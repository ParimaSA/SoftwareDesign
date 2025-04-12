import { parkingSpotModel } from "@/models/parkingSpotModel"
import { Database } from "./Database"
import type { Level } from "./Level"
import type { Vehicle } from "./Vehicle"
import { VehicleSize } from "./VehicleSize"
import { VehicleFactory } from "./VehicleFactory"
import { vehicleModel } from "@/models/vehicleModel"

export class ParkingSpot {
  private vehicle: Vehicle | null = null
  private spotSize: VehicleSize
  private row: number
  private spotNumber: number
  private level: Level
  private _id?: string // Add _id field to store MongoDB ObjectId

  constructor(level: Level, row: number, sn: number, size: VehicleSize) {
    this.level = level
    this.row = row
    this.spotNumber = sn
    this.spotSize = size
  }

  getId() {
    return this._id
  }

  setId(id: string) {
    this._id = id
  }

  getVehicle() {
    return this.vehicle;
  }

  isAvailable() {
    return this.vehicle == null
  }

  canFitVehicle(vehicle: Vehicle) {
    return this.isAvailable() && vehicle.canFitInSpot(this)
  }

  park(vehicle: Vehicle) {
    if (!this.canFitVehicle(vehicle)) {
      return false
    }

    this.vehicle = vehicle
    vehicle.parkInSpot(this)
    return true
  }

  removeVehicle() {
    this.vehicle = null;
    this.level.spotFreed();
  }

  getSize() {
    return this.spotSize
  }

  getRow() {
    return this.row
  }

  getSpotNumber() {
    return this.spotNumber
  }

  print() {
    if (this.vehicle == null) {
      if (this.spotSize == VehicleSize.Motorcycle) {
        console.log("M")
      } else if (this.spotSize == VehicleSize.Compact) {
        console.log("C")
      } else if (this.spotSize == VehicleSize.Large) {
        console.log("B")
      }
    } else {
      this.vehicle.print()
    }
  }


  async save(): Promise<string> {
    try {
      let vehicleId: string | undefined;
      if (this.vehicle) {
        vehicleId = await this.vehicle.save();
      }
  
      const parkingSpotData: {
        spotNumber: number;
        row: number;
        spotSize: VehicleSize;
        level?: string;
        vehicle?: string;
        _id?: string;
      } = {
        spotNumber: this.spotNumber,
        row: this.row,
        spotSize: this.spotSize,
      };
  
      if (this.level && this.level._id) {
        parkingSpotData.level = this.level._id;
      }
  
      if (vehicleId) {
        parkingSpotData.vehicle = vehicleId;
      }
  
      if (this._id) {
        parkingSpotData._id = this._id;
      }
  
      const savedDoc = await Database.saveOrUpdate(parkingSpotModel, parkingSpotData);
  
      if (!this._id && savedDoc._id) {
        this._id = savedDoc._id.toString();
      }
  
      return this._id || '';
    } catch (error) {
      console.error("Error saving parking spot:", error);
      throw error;
    }
  }

  static async fromDocument(doc: any): Promise<ParkingSpot> {
    const mockLevel: any = {
      spotFreed: () => {},
      getAvailableSpots: () => 0,
      _id: doc.level
    }
  
    const spot = new ParkingSpot(
      doc.level || mockLevel, 
      doc.row || 0, 
      doc.spotNumber || 0, 
      doc.spotSize !== undefined ? doc.spotSize : VehicleSize.Motorcycle
    )
  
    if (doc._id) {
      spot._id = doc._id.toString()
    }
  
    if (doc.vehicle) {
      if (typeof doc.vehicle === 'string' || doc.vehicle._id) {
        const vehicleId = typeof doc.vehicle === 'string' ? doc.vehicle : doc.vehicle._id
        const vehicleDoc = await Database.find(vehicleModel, { _id: vehicleId })
        if (vehicleDoc) {
          spot.vehicle = VehicleFactory.createVehicleFromDocument(vehicleDoc, spot)
        }
      } else {
        spot.vehicle = VehicleFactory.createVehicleFromDocument(doc.vehicle, spot)
      }
    }
  
    return spot
  }


}
