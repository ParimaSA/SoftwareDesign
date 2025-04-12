import type { ParkingSpot } from "./ParkingSpot"
import { Vehicle } from "./Vehicle"
import { VehicleSize } from "./VehicleSize"

export class Motorcycle extends Vehicle {
  spotNeeded: number
  vehicleSize: VehicleSize

  constructor(licensePlate: string) {
    super(licensePlate)
    this.spotNeeded = 1
    this.vehicleSize = VehicleSize.Motorcycle
  }

  canFitInSpot(spot: ParkingSpot): boolean {
    // Motorcycles can fit in any spot
    return true
  }

  print(): void {
    console.log("M")
  }
}
