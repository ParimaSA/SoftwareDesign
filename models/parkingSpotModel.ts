import mongoose from "mongoose"

const parkingSpotSchema = new mongoose.Schema({
  spotNumber: { type: Number, required: true },
  row: { type: Number, required: true },
  spotSize: { type: Number, required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
})

export const parkingSpotModel = mongoose.models.ParkingSpot || mongoose.model("ParkingSpot", parkingSpotSchema)
