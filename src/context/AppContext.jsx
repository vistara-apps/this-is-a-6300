import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [currentState, setCurrentState] = useState('California') // Default
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [incidents, setIncidents] = useState([])
  const [isRecording, setIsRecording] = useState(false)

  // Initialize user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('guardpoint-user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setCurrentState(userData.currentState || 'California')
      setPreferredLanguage(userData.preferredLanguage || 'English')
    }

    const savedIncidents = localStorage.getItem('guardpoint-incidents')
    if (savedIncidents) {
      setIncidents(JSON.parse(savedIncidents))
    }
  }, [])

  // Save user data to localStorage
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('guardpoint-user', JSON.stringify(updatedUser))
  }

  // Location detection
  const detectLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, we'll simulate state detection
          // In production, you'd use a reverse geocoding service
          const mockStateFromCoords = 'California' // Placeholder
          setCurrentState(mockStateFromCoords)
          updateUser({ currentState: mockStateFromCoords })
          resolve(mockStateFromCoords)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // Add incident
  const addIncident = (incident) => {
    const newIncident = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...incident
    }
    const updatedIncidents = [newIncident, ...incidents]
    setIncidents(updatedIncidents)
    localStorage.setItem('guardpoint-incidents', JSON.stringify(updatedIncidents))
  }

  const value = {
    user,
    currentState,
    preferredLanguage,
    incidents,
    isRecording,
    setIsRecording,
    updateUser,
    detectLocation,
    addIncident,
    setCurrentState,
    setPreferredLanguage
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}