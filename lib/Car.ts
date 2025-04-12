import type { ParkingSpot } from "./ParkingSpot"
import { Vehicle } from "./Vehicle"
import { VehicleSize } from "./VehicleSize"

export class Car extends Vehicle {
  spotNeeded: number
  vehicleSize: VehicleSize

  constructor(licensePlate: string) {
    super(licensePlate)
    this.spotNeeded = 1
    this.vehicleSize = VehicleSize.Compact
  }

  canFitInSpot(spot: ParkingSpot): boolean {
    // Cars can fit in Compact or Large spots
    return spot.getSize() === VehicleSize.Compact || spot.getSize() === VehicleSize.Large
  }

  print(): void {
    console.log("C")
  }
}
