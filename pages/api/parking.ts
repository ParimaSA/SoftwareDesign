import { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '@/lib/Database'
import { parkingLotModel } from '@/models/parkingLotModel'
import { ParkingLot } from '@/lib/ParkingLot'
import { VehicleFactory } from '@/lib/VehicleFactory'
import { Vehicle } from '@/lib/Vehicle'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await Database.connect()
  
  try {
    if (req.method === 'GET') {
      const parkingLotDoc = await Database.find(parkingLotModel, {})
      
      if (!parkingLotDoc) {
        const newParkingLotInstance = new ParkingLot()
        await newParkingLotInstance.save()
        return res.status(201).json({
          success: true,
          data: newParkingLotInstance.getAllAvailableSpots(),
        })
      }
      
      const parkingLot = await ParkingLot.fromDocument(parkingLotDoc)
      return res.status(200).json({
        success: true,
        data: parkingLot.getAllAvailableSpots(),
      })
    }
    else if (req.method === 'POST') {
      const { licensePlate, vehicleType } = req.body
      
      if (!licensePlate || !vehicleType) {
        return res.status(400).json({
          success: false,
          message: 'License plate and vehicle type are required',
        })
      }
      
      let parkingLotDoc = await Database.find(parkingLotModel, {})
      
      let parkingLot = parkingLotDoc
        ? await ParkingLot.fromDocument(parkingLotDoc)
        : new ParkingLot()
      
      let vehicle: Vehicle;
      try {
        vehicle = VehicleFactory.createVehicle(vehicleType, licensePlate)
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle type. Must be motorcycle, car, or bus.',
        })
      }
      
      const parked = parkingLot.parkVehicle(vehicle)
      
      if (parked) {
        await vehicle.save()
        await parkingLot.save()
        return res.status(200).json({
          success: true,
          message: 'Vehicle parked successfully',
          data: {
            licensePlate,
            vehicleType,
            availableSpots: parkingLot.getAllAvailableSpots(),
          },
        })
      } else {
        return res.status(400).json({
          success: false,
          message: 'No available spots for this vehicle type',
          data: {
            availableSpots: parkingLot.getAllAvailableSpots(),
          },
        })
      }
    } else {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' })
    }
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}