import { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '@/lib/Database'
import { parkingLotModel } from '@/models/parkingLotModel'
import { ParkingLot } from '@/lib/ParkingLot'
import { VehicleFactory } from '@/lib/VehicleFactory'
import { Vehicle } from '@/lib/Vehicle'
import { vehicleModel } from '@/models/vehicleModel'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await Database.connect()
  
    try {
        if (req.method === 'POST') {
        const parkingLotDoc = await Database.find(parkingLotModel, {})
        const { licensePlate } = req.body
        
        if (!parkingLotDoc) {
            const newParkingLotInstance = new ParkingLot()
            await newParkingLotInstance.save()
            let data = newParkingLotInstance.unparkVehicle(licensePlate)
            newParkingLotInstance.save();
            return res.status(201).json({
            success: true,
            data: data,
            })
        }
        
        const parkingLot = await ParkingLot.fromDocument(parkingLotDoc)
        let data = parkingLot.unparkVehicle(licensePlate);
        parkingLot.save()
        return res.status(200).json({
            success: true,
            data: data,
        })
        } 
    }
    catch (error) {
        console.error('Server error:', error)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}