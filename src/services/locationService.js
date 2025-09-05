// Location Service for state detection and geolocation
import { apiClient, geoAPI } from '../config/api'
import toast from 'react-hot-toast'

class LocationService {
  // Get user's current location using browser geolocation
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          let message = 'Unable to retrieve location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable'
              break
            case error.TIMEOUT:
              message = 'Location request timed out'
              break
          }
          reject(new Error(message))
        },
        options
      )
    })
  }

  // Get state from IP address using GeoJS API
  async getStateFromIP() {
    try {
      const response = await apiClient.get(geoAPI.stateURL)
      return response.data
    } catch (error) {
      console.error('Error getting state from IP:', error)
      throw new Error('Unable to detect state from IP address')
    }
  }

  // Get country from IP address
  async getCountryFromIP() {
    try {
      const response = await apiClient.get(geoAPI.countryURL)
      return response.data
    } catch (error) {
      console.error('Error getting country from IP:', error)
      throw new Error('Unable to detect country from IP address')
    }
  }

  // Reverse geocoding using coordinates
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free reverse geocoding service
      const response = await apiClient.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      )
      
      return {
        state: response.data.principalSubdivision,
        city: response.data.city,
        country: response.data.countryName,
        countryCode: response.data.countryCode,
        address: response.data.locality
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error)
      throw new Error('Unable to get location details from coordinates')
    }
  }

  // Get comprehensive location data
  async getLocationData() {
    try {
      let locationData = {
        state: 'California', // Default fallback
        country: 'United States',
        method: 'default'
      }

      try {
        // First try to get precise location from GPS
        const position = await this.getCurrentPosition()
        const geoData = await this.reverseGeocode(position.latitude, position.longitude)
        
        locationData = {
          ...locationData,
          ...geoData,
          coordinates: {
            latitude: position.latitude,
            longitude: position.longitude
          },
          method: 'gps'
        }
      } catch (gpsError) {
        console.log('GPS location failed, trying IP-based detection:', gpsError.message)
        
        try {
          // Fallback to IP-based location
          const state = await this.getStateFromIP()
          const country = await this.getCountryFromIP()
          
          locationData = {
            ...locationData,
            state: state,
            country: country,
            method: 'ip'
          }
        } catch (ipError) {
          console.log('IP-based location failed, using default:', ipError.message)
          toast.error('Unable to detect location. Using default state (California).')
        }
      }

      return locationData
    } catch (error) {
      console.error('Error getting location data:', error)
      return {
        state: 'California',
        country: 'United States',
        method: 'default'
      }
    }
  }

  // Validate if state is supported
  isSupportedState(state) {
    const supportedStates = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
      'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
      'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
      'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
    ]
    
    return supportedStates.includes(state)
  }

  // Get state abbreviation
  getStateAbbreviation(stateName) {
    const stateAbbreviations = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
    }
    
    return stateAbbreviations[stateName] || stateName
  }

  // Watch position for continuous tracking
  watchPosition(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported'))
      return null
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      errorCallback,
      options
    )
  }

  // Clear position watch
  clearWatch(watchId) {
    if (navigator.geolocation && watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
  }
}

export default new LocationService()
