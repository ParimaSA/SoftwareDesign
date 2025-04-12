import { Database } from "./Database"
import { Level } from "./Level"
import type { Vehicle } from "./Vehicle"
import { parkingLotModel } from "@/models/parkingLotModel"
import { levelModel } from "@/models/levelModel"

export class ParkingLot {
  private levels: Array<Level>
  static readonly NUM_LEVELS = 5
  _id?: string

  constructor() {
    this.levels = new Array(ParkingLot.NUM_LEVELS)
    for (let i = 0; i < ParkingLot.NUM_LEVELS; i++) {
      this.levels[i] = new Level(i, 30)
    }
  }

  getId(): string | undefined {
    return this._id
  }

  setId(id: string): void {
    this._id = id
  }


  parkVehicle(vehicle: Vehicle): boolean {
    for (let i = 0; i < ParkingLot.NUM_LEVELS; i++) {
      if (this.levels[i].parkVehicle(vehicle)) {
        return true
      }
    }
    return false
  }

  getAllAvailableSpots(): Array<{ level: number, availableSpots: number }> {
    const result = []
    for (let i = 0; i < ParkingLot.NUM_LEVELS; i++) {
      result.push({
        level: i + 1,
        availableSpots: this.levels[i].getAvailableSpots(),
      })
    }
    return result
  }

  unparkVehicle(licensePlate){
    for(let i=0; i<ParkingLot.NUM_LEVELS; i++){
      let success = this.levels[i].unpark(licensePlate);
      if (success){
        return true;
      }
    }
    return false
  }

  async save(): Promise<string> {
    try {
      const levelIds = []
      for (const level of this.levels) {
        const levelId = await level.save()
        levelIds.push(levelId)
      }
      
      const parkingLotData: { levels: string[], _id?: string } = {
        levels: levelIds,
      }
      
      if (this._id) {
        parkingLotData._id = this._id
      }
      
      const savedDoc = await Database.saveOrUpdate(parkingLotModel, parkingLotData)
      if (!this._id && savedDoc._id) {
        this._id = savedDoc._id.toString()
      }
      
      return this._id || ''
    } catch (error) {
      console.error("Error saving parking lot:", error)
      throw error
    }
  }

  static async fromDocument(doc: any): Promise<ParkingLot> {
    try {
      const lot = new ParkingLot()
      
      if (doc._id) {
        lot._id = doc._id.toString()
      }
      
      if (doc.levels && Array.isArray(doc.levels)) {
        const levelDocs = await Database.findAll(levelModel, { _id: { $in: doc.levels } })
        
        lot.levels = new Array(levelDocs.length)
        
        for (let i = 0; i < levelDocs.length; i++) {
          lot.levels[i] = await Level.fromDocument(levelDocs[i])
        }
      }
      
      return lot
    } catch (error) {
      console.error("Error creating parking lot from document:", error)
      throw error
    }
  }
}