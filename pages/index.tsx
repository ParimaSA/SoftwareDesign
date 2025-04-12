"use client"

import React, { useState, useEffect } from "react"

export default function Home() {
  const [availableSpots, setAvailableSpots] = useState([])
  const [licensePlateToPark, setLicensePlateToPark] = useState("")
  const [vehicleType, setVehicleType] = useState("car")
  const [licensePlateToUnpark, setLicensePlateToUnpark] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchAvailableSpots = async () => {
    try {
      const res = await fetch("/api/parking")
      const data = await res.json()

      if (data.success) {
        const spotsArray = data.data.map((level) => level.availableSpots)
        setAvailableSpots(spotsArray)
      }
    } catch (error) {
      console.error("Error fetching available spots:", error)
      window.alert("Failed to fetch available spots")
    }
  }

  useEffect(() => {
    fetchAvailableSpots()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!licensePlateToPark) {
      window.alert("Please enter a license plate number")
      return
    }

    setLoading(true)

    const vehicleData = {
      licensePlate: licensePlateToPark,
      vehicleType
    }

    try {
      const response = await fetch("/api/parking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicleData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        window.alert("Vehicle parked successfully!")
        setLicensePlateToPark("")
        setVehicleType("car")
        fetchAvailableSpots()
      } else {
        window.alert("Failed to park the vehicle: " + (result.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Error parking vehicle:", error)
      window.alert("Error parking vehicle. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUnpark = async (e) => {
    e.preventDefault()

    if (!licensePlateToUnpark) {
      window.alert("Please enter a license plate number")
      return
    }

    setLoading(true)

    const vehicleData = {
      licensePlate: licensePlateToUnpark,
    }

    try {
      const response = await fetch("/api/unpark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicleData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        window.alert("Vehicle unparked successfully!")
        setLicensePlateToUnpark("")
        fetchAvailableSpots()
      } else {
        window.alert("Failed to unpark the vehicle: " + (result.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Error unparking vehicle:", error)
      window.alert("Error unparking vehicle. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Parking Lot Management</h1>

      <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" }}>
        {/* Park Form */}
        <div style={{
          flex: "1 1 400px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Add a Vehicle</h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label htmlFor="licensePlateToPark" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                License Plate
              </label>
              <input
                id="licensePlateToPark"
                type="text"
                value={licensePlateToPark}
                onChange={(e) => setLicensePlateToPark(e.target.value)}
                placeholder="Enter license plate"
                style={{
                  width: "90%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px"
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="vehicleType" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                style={{
                  width: "95%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#fff"
                }}
              >
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bus">Bus</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 16px",
                backgroundColor: loading ? "#ccc" : "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "500"
              }}
            >
              {loading ? "Parking..." : "Park Vehicle"}
            </button>
          </form>
        </div>

        {/* Available Spots */}
        <div style={{
          flex: "1 1 400px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Available Parking Spots</h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={{ textAlign: "left", padding: "8px 16px", fontWeight: "600" }}>Level</th>
                <th style={{ textAlign: "left", padding: "8px 16px", fontWeight: "600" }}>Available Spots</th>
              </tr>
            </thead>
            <tbody>
              {availableSpots.length > 0 ? (
                availableSpots.map((spots, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 16px" }}>{index + 1}</td>
                    <td style={{ padding: "8px 16px" }}>{spots}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "16px" }}>
                    Loading available spots...
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <button
            onClick={fetchAvailableSpots}
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Unpark Form */}
      <div style={{
        maxWidth: "400px",
        margin: "40px auto 0",
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Unpark Vehicle</h2>
        <form onSubmit={handleUnpark} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label htmlFor="licensePlateToUnpark" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              License Plate
            </label>
            <input
              id="licensePlateToUnpark"
              type="text"
              value={licensePlateToUnpark}
              onChange={(e) => setLicensePlateToUnpark(e.target.value)}
              placeholder="Enter license plate to unpark"
              style={{
                width: "95%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 16px",
              backgroundColor: loading ? "#ccc" : "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "500"
            }}
          >
            {loading ? "Unparking..." : "Unpark Vehicle"}
          </button>
        </form>
      </div>
    </div>
  )
}
