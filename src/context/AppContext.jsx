import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'
import locationService from '../services/locationService'
import aiService from '../services/aiService'
import storageService from '../services/storageService'
import paymentService from '../services/paymentService'
import { supabase } from '../config/api'
import toast from 'react-hot-toast'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  // Core state
  const [user, setUser] = useState(null)
  const [currentState, setCurrentState] = useState('California')
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [incidents, setIncidents] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  
  // Enhanced state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [locationData, setLocationData] = useState(null)
  const [rightsGuide, setRightsGuide] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [isPremium, setIsPremium] = useState(false)
  const [isInTrial, setIsInTrial] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)

  // Initialize app
  useEffect(() => {
    initializeApp()
  }, [])

  // Initialize application
  const initializeApp = async () => {
    try {
      setLoading(true)

      // Check authentication status
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setIsAuthenticated(true)
        
        // Get user profile
        const profile = await authService.getUserProfile(currentUser.id)
        if (profile) {
          setCurrentState(profile.current_state || 'California')
          setPreferredLanguage(profile.preferred_language || 'English')
        }
      }

      // Load saved data from localStorage
      loadLocalData()

      // Detect location
      await detectLocation()

      // Check premium status
      checkPremiumStatus()

      // Load initial content
      await loadInitialContent()

      // Check network status
      updateNetworkStatus()

    } catch (error) {
      console.error('Error initializing app:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load data from localStorage
  const loadLocalData = () => {
    try {
      const savedIncidents = localStorage.getItem('guardpoint-incidents')
      if (savedIncidents) {
        setIncidents(JSON.parse(savedIncidents))
      }

      const savedUser = localStorage.getItem('guardpoint-user')
      if (savedUser && !user) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setCurrentState(userData.currentState || 'California')
        setPreferredLanguage(userData.preferredLanguage || 'English')
      }
    } catch (error) {
      console.error('Error loading local data:', error)
    }
  }

  // Enhanced location detection
  const detectLocation = async () => {
    try {
      const locationData = await locationService.getLocationData()
      setLocationData(locationData)
      
      if (locationData.state && locationData.state !== currentState) {
        setCurrentState(locationData.state)
        if (user) {
          await updateUser({ currentState: locationData.state })
        }
      }
      
      return locationData
    } catch (error) {
      console.error('Error detecting location:', error)
      return { state: currentState, method: 'default' }
    }
  }

  // Load initial content
  const loadInitialContent = async () => {
    try {
      // Load rights guide for current state
      if (!offlineMode) {
        const guide = await aiService.generateRightsGuide(currentState)
        setRightsGuide(guide)
      } else {
        // Load cached content
        const cachedGuide = localStorage.getItem(`guardpoint-rights-${currentState}`)
        if (cachedGuide) {
          setRightsGuide(JSON.parse(cachedGuide))
        }
      }
    } catch (error) {
      console.error('Error loading initial content:', error)
      // Use default content
      const defaultGuide = aiService.getDefaultRightsGuide(currentState)
      setRightsGuide(defaultGuide)
    }
  }

  // Check premium status
  const checkPremiumStatus = () => {
    const premium = paymentService.isPremiumUser()
    const trial = paymentService.isInTrialPeriod()
    
    setIsPremium(premium)
    setIsInTrial(trial)
  }

  // Update network status
  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine
    setOfflineMode(!isOnline)

    // Listen for network changes
    window.addEventListener('online', () => setOfflineMode(false))
    window.addEventListener('offline', () => setOfflineMode(true))
  }

  // Enhanced user update
  const updateUser = async (userData) => {
    try {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('guardpoint-user', JSON.stringify(updatedUser))

      // Update in database if authenticated
      if (isAuthenticated && user?.id) {
        await authService.updateUserProfile(user.id, userData)
      }

      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Enhanced incident management
  const addIncident = async (incident) => {
    try {
      const newIncident = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous',
        ...incident
      }

      // Generate AI summary if available
      if (!offlineMode && (isPremium || isInTrial)) {
        try {
          const summary = await aiService.generateIncidentSummary(newIncident)
          newIncident.aiSummary = summary
        } catch (error) {
          console.log('AI summary generation failed:', error)
        }
      }

      // Upload to secure storage if premium
      if (!offlineMode && (isPremium || isInTrial) && incident.recordingBlob) {
        try {
          const file = storageService.blobToFile(
            incident.recordingBlob,
            `incident-${newIncident.id}.webm`,
            'video/webm'
          )
          
          const uploadResult = await storageService.uploadToIPFS(file, {
            name: `incident-${newIncident.id}`,
            type: 'incident-recording',
            timestamp: newIncident.timestamp,
            userId: newIncident.userId
          })
          
          newIncident.recordingUrl = uploadResult.url
          newIncident.ipfsHash = uploadResult.ipfsHash
        } catch (error) {
          console.log('IPFS upload failed:', error)
        }
      }

      const updatedIncidents = [newIncident, ...incidents]
      setIncidents(updatedIncidents)
      localStorage.setItem('guardpoint-incidents', JSON.stringify(updatedIncidents))

      // Sync with database if authenticated
      if (isAuthenticated && !offlineMode) {
        try {
          await supabase
            .from('incident_logs')
            .insert([{
              incident_id: newIncident.id,
              user_id: newIncident.userId,
              timestamp: newIncident.timestamp,
              location: newIncident.location,
              recording_url: newIncident.recordingUrl,
              summary_card_content: JSON.stringify(newIncident),
              notes: newIncident.notes
            }])
        } catch (error) {
          console.log('Database sync failed:', error)
        }
      }

      toast.success('Incident recorded successfully')
      return newIncident
    } catch (error) {
      console.error('Error adding incident:', error)
      toast.error('Failed to save incident')
      throw error
    }
  }

  // Authentication methods
  const signIn = async (email, password) => {
    try {
      const result = await authService.signIn(email, password)
      setUser(result.user)
      setIsAuthenticated(true)
      
      // Reload user data
      await initializeApp()
      
      return result
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      const result = await authService.signUp(email, password, {
        ...userData,
        currentState,
        preferredLanguage
      })
      
      return result
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      setIsAuthenticated(false)
      setIsPremium(false)
      setIsInTrial(false)
      
      // Clear local data
      setIncidents([])
      setRightsGuide(null)
      
      toast.success('Signed out successfully')
    } catch (error) {
      throw error
    }
  }

  // Generate custom content
  const generateCustomRightsGuide = async (state = currentState, scenario = 'general') => {
    try {
      if (offlineMode) {
        throw new Error('Custom content generation requires internet connection')
      }

      const guide = await aiService.generateRightsGuide(state, scenario)
      setRightsGuide(guide)
      
      // Cache the guide
      localStorage.setItem(`guardpoint-rights-${state}`, JSON.stringify(guide))
      
      return guide
    } catch (error) {
      console.error('Error generating custom rights guide:', error)
      throw error
    }
  }

  // Generate custom scripts
  const generateCustomScript = async (scenario, language = preferredLanguage, state = currentState) => {
    try {
      if (offlineMode) {
        throw new Error('Custom script generation requires internet connection')
      }

      const script = await aiService.generateScenarioScript(scenario, language, state)
      return script
    } catch (error) {
      console.error('Error generating custom script:', error)
      throw error
    }
  }

  // Premium feature access
  const hasFeatureAccess = (feature) => {
    if (isPremium || isInTrial) return true
    
    // Check individual purchases
    return paymentService.hasPurchasedItem(feature)
  }

  // Offline content management
  const cacheContentForOffline = async () => {
    try {
      // Cache rights guide
      if (rightsGuide) {
        localStorage.setItem(`guardpoint-rights-${currentState}`, JSON.stringify(rightsGuide))
      }

      // Cache scenarios
      if (scenarios.length > 0) {
        localStorage.setItem('guardpoint-scenarios', JSON.stringify(scenarios))
      }

      toast.success('Content cached for offline use')
    } catch (error) {
      console.error('Error caching content:', error)
      toast.error('Failed to cache content')
    }
  }

  const value = {
    // Core state
    user,
    currentState,
    preferredLanguage,
    incidents,
    isRecording,
    
    // Enhanced state
    isAuthenticated,
    loading,
    locationData,
    rightsGuide,
    scenarios,
    isPremium,
    isInTrial,
    offlineMode,
    
    // Core methods
    setIsRecording,
    updateUser,
    addIncident,
    setCurrentState,
    setPreferredLanguage,
    
    // Enhanced methods
    detectLocation,
    signIn,
    signUp,
    signOut,
    generateCustomRightsGuide,
    generateCustomScript,
    hasFeatureAccess,
    cacheContentForOffline,
    checkPremiumStatus,
    
    // Services
    authService,
    locationService,
    aiService,
    storageService,
    paymentService
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
