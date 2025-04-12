import mongoose from "mongoose"

const levelSchema = new mongoose.Schema({
  floor: { type: Number, required: true },
  availableSpots: { type: Number, required: true },
  spots: [{ type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpot" }],
})

export const levelModel = mongoose.models.Level || mongoose.model("Level", levelSchema)
