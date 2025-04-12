import { VehicleSize } from "./VehicleSize"
import { Motorcycle } from "./MotorCycle"
import { Car } from "./Car"
import { Bus } from "./Bus"
import type { ParkingSpot } from "./ParkingSpot"
import type { Vehicle } from "./Vehicle"

export class VehicleFactory {
  static createVehicle(type: string, licensePlate: string): Vehicle {
    switch (type.toLowerCase()) {
      case "motorcycle":
        return new Motorcycle(licensePlate)
      case "car":
        return new Car(licensePlate)
      case "bus":
        return new Bus(licensePlate)
      default:
        throw new Error(`Unknown vehicle type: ${type}`)
    }
  }

  static createVehicleFromDocument(doc: any, spot): Vehicle {
    let vehicle: Vehicle

    if (doc.vehicleSize === VehicleSize.Motorcycle) {
      vehicle = new Motorcycle(doc.licensePlate)
    } else if (doc.vehicleSize === VehicleSize.Compact) {
      vehicle = new Car(doc.licensePlate)
    } else {
      vehicle = new Bus(doc.licensePlate)
    }

    if (doc._id) {
      vehicle.setId(doc._id.toString())
    }

    vehicle.spotNeeded = doc.spotNeeded || 1
    vehicle.parkInSpot(spot)

    return vehicle
  }
}
