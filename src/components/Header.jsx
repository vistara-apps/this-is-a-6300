import React from 'react'
import { Shield, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import LocationDetector from './LocationDetector'

const Header = () => {
  const { currentState } = useApp()

  return (
    <header className="py-lg border-b border-gray-100 mb-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">GuardPoint</h1>
            <p className="text-sm text-text-secondary">Your Pocket Guide to Rights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-sm">
          <LocationDetector />
          <div className="flex items-center gap-xs text-sm text-text-secondary">
            <MapPin className="w-4 h-4" />
            <span>{currentState}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header