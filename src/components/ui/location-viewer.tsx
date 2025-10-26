"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface ViewerLocation {
  position: [number, number]
  title?: string
  description?: string
  tooltip?: string
}

export interface LocationViewerProps {
  center?: [number, number]
  zoom?: number
  locations: ViewerLocation[]
  className?: string
  height?: string
  fitBounds?: boolean
}

export function LocationViewer({
  center = [51.505, -0.09],
  zoom = 13,
  locations,
  className,
  height = "400px",
  fitBounds = true,
}: LocationViewerProps) {
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
      const markers: any[] = []
      locations.forEach((location) => {
        const marker = L.marker(location.position).addTo(map)

        // Create popup content
        if (location.title || location.description) {
          const popupContent = `
            ${location.title ? `<strong>${location.title}</strong>` : ""}
            ${location.description ? `<p class="mt-1 text-sm">${location.description}</p>` : ""}
          `
          marker.bindPopup(popupContent)
        }

        if (location.tooltip) {
          marker.bindTooltip(location.tooltip)
        }

        markers.push(marker)
      })

      // Fit bounds to show all markers
      if (fitBounds && markers.length > 0) {
        const group = L.featureGroup(markers)
        map.fitBounds(group.getBounds().pad(0.1))
      }

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
  }, [center, zoom, locations, fitBounds])

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
