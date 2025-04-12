import mongoose, { type Model } from "mongoose"

export class Database {
  private static instance: Database
  private static connected = false
  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  static async connect() {
    if (this.connected) return

    try {
      await mongoose.connect(process.env.MONGODB_URI || "", {
        dbName: "parking_db",
      })

      this.connected = true
      console.log("MongoDB connected")
    } catch (err) {
      console.error("MongoDB connection error:", err)
      throw err
    }
  }

  static async saveOrUpdate(model: any, data: any) {
    await this.connect()

    try {
      // if there is this data in database update that
      if (data._id) {
        const id = data._id
        const { _id, ...updateData } = data 

        const updatedDoc = await model.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: false },
        )

        if (!updatedDoc) {
          throw new Error(`Record with id ${id} not found`)
        }

        return updatedDoc
      } else { // else create new one
        const newRecord = new model(data)
        await newRecord.save({ validateBeforeSave: false }) 
        return newRecord
      }
    } catch (error) {
      console.error("Error saving or updating record:", error)
      throw error
    }
  }

  static async find<T>(model: Model<T>, query: Partial<T>) {
    await this.connect()
    return model.findOne(query)
  }

  static async findAll<T>(model: Model<T>, query: Partial<T> = {}) {
    await this.connect()
    return model.find(query)
  }

  static async delete<T>(model: Model<T>, query: Partial<T> = {}) {
    await this.connect()
    return model.deleteOne(query)
  }
}
