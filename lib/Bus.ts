import type { ParkingSpot } from "./ParkingSpot"
import { Vehicle } from "./Vehicle"
import { VehicleSize } from "./VehicleSize"

export class Bus extends Vehicle {
  spotNeeded: number
  vehicleSize: VehicleSize

  constructor(licensePlate: string) {
    super(licensePlate)
    this.spotNeeded = 5 // A bus needs 5 consecutive spots
    this.vehicleSize = VehicleSize.Large
  }

  canFitInSpot(spot: ParkingSpot): boolean {
    // Buses can only fit in Large spots
    return spot.getSize() === VehicleSize.Large
  }

  print(): void {
    console.log("B")
  }
}
