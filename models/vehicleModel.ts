import mongoose from "mongoose"

const vehicleSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true },
  vehicleSize: { type: Number, required: true },
  spotNeeded: { type: Number, required: true },
  parkingSpots: [
    {
      spotNumber: Number,
      row: Number,
      size: Number,
    },
  ],
})

export const vehicleModel = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema)
