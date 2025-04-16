import { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '@/lib/Database'
import { parkingLotModel } from '@/models/parkingLotModel'
import { ParkingLot } from '@/lib/ParkingLot'


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
    } else {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' })
    }
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}