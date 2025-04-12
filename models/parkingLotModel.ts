import mongoose from "mongoose"

const parkingLotSchema = new mongoose.Schema({
  levels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Level" }],
})

export const parkingLotModel = mongoose.models.ParkingLot || mongoose.model("ParkingLot", parkingLotSchema)
