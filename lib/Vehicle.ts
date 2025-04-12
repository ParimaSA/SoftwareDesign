import type { VehicleSize } from "./VehicleSize"
import type { ParkingSpot } from "./ParkingSpot"
import { Database } from "./Database"
import { vehicleModel } from "@/models/vehicleModel"

export abstract class Vehicle {
  protected parkingSpots: Array<ParkingSpot> = new Array<ParkingSpot>()
  protected licensePlate: string
  spotNeeded: number
  vehicleSize: VehicleSize
  _id?: string // Add _id field to store MongoDB ObjectId

  constructor(licensePlace: string) {
    this.licensePlate = licensePlace
  }

  // Getter for _id
  getId() {
    return this._id
  }

  // Setter for _id
  setId(id: string) {
    this._id = id
  }

  getSpotNeeded() {
    return this.spotNeeded
  }

  getSize() {
    return this.vehicleSize
  }

  getLicensePlate() {
    return this.licensePlate
  }

  abstract canFitInSpot(spot: ParkingSpot): boolean

  parkInSpot(spot: ParkingSpot) {
    // Park vehicle in given spot
    this.parkingSpots.push(spot)
  }

  clearSpots() {
    // Remove vehicle from parkingSpot and notify that spot
    for (let i = 0; i < this.parkingSpots.length; i++) {
      this.parkingSpots[i].removeVehicle()
    }
    this.parkingSpots = []
  }

  abstract print(): void

  getVehicleType(): string {
    return this.constructor.name.toLowerCase()
  }

  async save() {
    const vehicleData: any = {
      licensePlate: this.licensePlate,
      vehicleSize: this.vehicleSize,
      spotNeeded: this.spotNeeded,
      parkingSpots: this.parkingSpots.map((spot) => ({
        spotNumber: spot.getSpotNumber(),
        row: spot.getRow(),
        size: spot.getSize(),
      })),
    }

    if (this._id) {
      vehicleData._id = this._id
    }

    const savedDoc = await Database.saveOrUpdate(vehicleModel, vehicleData)

    if (!this._id) {
      this._id = savedDoc._id.toString()
    }

    return this._id
  }
}
