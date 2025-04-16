import { levelModel } from "@/models/levelModel"
import { Database } from "./Database"
import { ParkingSpot } from "./ParkingSpot"
import type { Vehicle } from "./Vehicle"
import { VehicleSize } from "./VehicleSize"
import { parkingSpotModel } from "@/models/parkingSpotModel"

export class Level {
  private floor: number
  private spots: Array<ParkingSpot>
  private availableSpots = 0
  private static SPOTS_PER_ROW = 10
  _id?: string

  constructor(floor: number, numberSpot: number) {
    this.floor = floor
    this.spots = new Array(numberSpot)

    const largeSpots = Math.floor(numberSpot / 4)
    const motorcycleSpots = Math.floor(numberSpot / 4)
    const compactSpots = numberSpot - largeSpots - motorcycleSpots

    for (let i = 0; i < numberSpot; i++) {
      let sz = VehicleSize.Motorcycle
      if (i < largeSpots) {
        sz = VehicleSize.Large
      } else if (i < largeSpots + compactSpots) {
        sz = VehicleSize.Compact
      }

      const row = Math.floor(i / Level.SPOTS_PER_ROW)
      this.spots[i] = new ParkingSpot(this, row, i, sz)
    }

    this.availableSpots = numberSpot
  }

  getId() {
    return this._id
  }

  setId(id: string) {
    this._id = id
  }

  getAvailableSpots() {
    return this.availableSpots
  }

  getFloor() {
    return this.floor
  }

  parkStartingAtSpot(spotNumber: number, vehicle: Vehicle) {
    vehicle.clearSpots()
    let success = true
    for (let i = spotNumber; i < spotNumber + vehicle.getSpotNeeded(); i++) {
      success = success && this.spots[i].park(vehicle)
    }
    this.availableSpots -= vehicle.getSpotNeeded()
    return success
  }

  parkVehicle(vehicle: Vehicle) {
    if (this.availableSpots < vehicle.getSpotNeeded()) {
      return false
    }
    const spotNumber = this.findAvailableSpots(vehicle)
    if (spotNumber < 0) {
      return false
    }
    return this.parkStartingAtSpot(spotNumber, vehicle)
  }

  findAvailableSpots(vehicle: Vehicle) {
    // Find first spot that can be able to park this vehicle, return the index of that spot or -1 if it is no available spot
    const spotNeeded = vehicle.getSpotNeeded()
    let lastRow = -1
    let spotFound = 0
    for (let i = 0; i < this.spots.length; i++) {
      const thisSpot = this.spots[i]
      if (lastRow != thisSpot.getRow()) {
        spotFound = 0
        lastRow = thisSpot.getRow()
      }
      if (thisSpot.canFitVehicle(vehicle)) {
        spotFound++
      } else {
        spotFound = 0
      }
      if (spotFound === spotNeeded) {
        return i - (spotNeeded - 1)
      }
    }

    return -1
  }

  spotFreed() {
    // the vehicle is removed, increment the availableSpots
    this.availableSpots++
    console.log("available: ", this.availableSpots)
  }

  unpark(licensePlate: string) {
    let success = false;
    for(let i=0; i<this.spots.length; i++){
      if (this.spots[i].getVehicle()){
        let vehicle = this.spots[i].getVehicle();
        if(vehicle.getLicensePlate() === licensePlate){
          vehicle.clearSpots();
        }
        success = true
      }
    }
    return success;
  }

  print() {
    let lastRow = -1
    for (let i = 0; i < this.spots.length; i++) {
      const thisSpot = this.spots[i]
      if (thisSpot.getRow() != lastRow) {
        console.log(" ")
        lastRow = thisSpot.getRow()
      }
      thisSpot.print()
    }
  }

  static async fromDocument(doc: any): Promise<Level> {
    try {
      const spotCount = doc.spots && Array.isArray(doc.spots) ? doc.spots.length : 30
      const lvl = new Level(doc.floor, spotCount)
      
      if (doc._id) {
        lvl._id = doc._id.toString()
      }
      
     
      lvl.availableSpots = doc.availableSpots !== undefined ? doc.availableSpots : spotCount
      
      if (doc.spots && Array.isArray(doc.spots) && doc.spots.length > 0) {
        const spotDocs = await Database.findAll(parkingSpotModel, { 
          _id: { $in: doc.spots.map((id: any) => id.toString ? id.toString() : id) } 
        })
        
        const spotDocsMap = new Map()
        spotDocs.forEach((spotDoc: any) => {
          spotDocsMap.set(spotDoc.spotNumber, spotDoc)
        })
        
        for (let i = 0; i < lvl.spots.length; i++) {
          const spotDoc = spotDocsMap.get(i)
          if (spotDoc) {
            lvl.spots[i] = await ParkingSpot.fromDocument(spotDoc, lvl);
          }
        }
      }
      
      return lvl
    } catch (error) {
      console.error("Error creating level from document:", error)
      throw error
    }
  }

  async save() {
    const spotIds = []
    for (const spot of this.spots) {
      const spotId = await spot.save()
      spotIds.push(spotId)
    }

    const levelData: any = {
      floor: this.floor,
      availableSpots: this.availableSpots,
      spots: spotIds, 
    }

    if (this._id) {
      levelData._id = this._id
    }

    const savedDoc = await Database.saveOrUpdate(levelModel, levelData)

    if (!this._id) {
      this._id = savedDoc._id.toString()
    }

    return this._id
  }
}
