import React, { useState } from 'react'
import { Navigation, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

const LocationDetector = () => {
  const { detectLocation } = useApp()
  const [isDetecting, setIsDetecting] = useState(false)

  const handleDetectLocation = async () => {
    setIsDetecting(true)
    try {
      await detectLocation()
    } catch (error) {
      console.error('Location detection failed:', error)
      alert('Unable to detect location. Please check your browser permissions.')
    } finally {
      setIsDetecting(false)
    }
  }

  return (
    <button
      onClick={handleDetectLocation}
      disabled={isDetecting}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Detect Current Location"
    >
      {isDetecting ? (
        <Loader2 className="w-4 h-4 text-accent animate-spin" />
      ) : (
        <Navigation className="w-4 h-4 text-text-secondary" />
      )}
    </button>
  )
}

export default LocationDetector