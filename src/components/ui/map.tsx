"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface MapMarker {
  position: [number, number]
  popup?: string
  tooltip?: string
}

export interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  className?: string
  height?: string
}

export function Map({ center = [51.505, -0.09], zoom = 13, markers = [], className, height = "400px" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let map: any

    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // Initialize map
      map = L.map(mapRef.current!).setView(center, zoom)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add markers
      markers.forEach((marker) => {
        const leafletMarker = L.marker(marker.position).addTo(map)

        if (marker.popup) {
          leafletMarker.bindPopup(marker.popup)
        }

        if (marker.tooltip) {
          leafletMarker.bindTooltip(marker.tooltip)
        }
      })

      mapInstanceRef.current = map
    }

    initMap()

    // Cleanup
    return () => {
      if (map) {
        map.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, markers])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={mapRef}
        className={cn("rounded-lg border border-border overflow-hidden", className)}
        style={{ height }}
      />
    </>
  )
}
