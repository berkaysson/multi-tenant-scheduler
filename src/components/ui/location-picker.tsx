"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface LocationPickerProps {
  center?: [number, number]
  zoom?: number
  className?: string
  height?: string
  onLocationSelect?: (location: [number, number]) => void
  initialLocation?: [number, number]
}

export function LocationPicker({
  center = [51.505, -0.09],
  zoom = 13,
  className,
  height = "400px",
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let map: any
    let marker: any

    const initMap = async () => {
      console.log("[v0] Initializing map...")
      const L = (await import("leaflet")).default

      // Fix for default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // Use initialLocation if provided, otherwise use center
      const mapCenter = initialLocation || center
      
      // Initialize map
      map = L.map(mapRef.current!).setView(mapCenter, zoom)
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Place initial marker if initialLocation is provided
      if (initialLocation) {
        marker = L.marker([initialLocation[0], initialLocation[1]], { draggable: true }).addTo(map)
        markerRef.current = marker
        marker.bindPopup("Selected Location")
        marker.openPopup()
        setSelectedLocation(initialLocation)

        // Handle marker drag
        marker.on("dragend", () => {
          const position = marker.getLatLng()
          const draggedLocation: [number, number] = [position.lat, position.lng]
          console.log("[v0] Marker dragged to:", draggedLocation)
          setSelectedLocation(draggedLocation)
          onLocationSelect?.(draggedLocation)
        })
      }

      // Handle map click to place/move marker
      map.on("click", (e: any) => {
        console.log("[v0] Map clicked at:", e.latlng.lat, e.latlng.lng)
        const newLocation: [number, number] = [e.latlng.lat, e.latlng.lng]

        if (marker) {
          console.log("[v0] Moving existing marker")
          marker.setLatLng(e.latlng)
        } else {
          console.log("[v0] Creating new marker")
          marker = L.marker(e.latlng, { draggable: true }).addTo(map)
          markerRef.current = marker
          marker.bindPopup("Selected Location")

          // Handle marker drag
          marker.on("dragend", () => {
            const position = marker.getLatLng()
            const draggedLocation: [number, number] = [position.lat, position.lng]
            console.log("[v0] Marker dragged to:", draggedLocation)
            setSelectedLocation(draggedLocation)
            onLocationSelect?.(draggedLocation)
          })
        }

        marker.openPopup()
        setSelectedLocation(newLocation)
        onLocationSelect?.(newLocation)
      })

      setIsMapReady(true)
      console.log("[v0] Map ready")
    }

    initMap()

    // Cleanup
    return () => {
      console.log("[v0] Cleaning up map")
      if (map) {
        map.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, []) // Empty dependency array to prevent recreation

  // Update marker when initialLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !initialLocation) return

    const updateMarker = async () => {
      const L = (await import("leaflet")).default
      const map = mapInstanceRef.current
      
      if (!map) return

      // Update map view to initial location
      map.setView(initialLocation, map.getZoom())

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([initialLocation[0], initialLocation[1]])
        markerRef.current.openPopup()
      } else {
        const marker = L.marker([initialLocation[0], initialLocation[1]], { draggable: true }).addTo(map)
        markerRef.current = marker
        marker.bindPopup("Selected Location")
        marker.openPopup()

        // Handle marker drag
        marker.on("dragend", () => {
          const position = marker.getLatLng()
          const draggedLocation: [number, number] = [position.lat, position.lng]
          setSelectedLocation(draggedLocation)
          onLocationSelect?.(draggedLocation)
        })
      }

      setSelectedLocation(initialLocation)
    }

    updateMarker()
  }, [initialLocation, onLocationSelect])

  return (
    <div className="space-y-2">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={mapRef}
        className={cn("rounded-lg border border-border overflow-hidden", className)}
        style={{ height }}
      />
      {selectedLocation && (
        <div className="text-sm text-muted-foreground">
          Selected: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
        </div>
      )}
    </div>
  )
}
