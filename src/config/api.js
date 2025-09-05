// API Configuration for GuardPoint
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import axios from 'axios'

// Environment variables (in production, these would be in .env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-key'
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || 'your-pinata-key'
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || 'your-pinata-secret'
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'your-stripe-key'

// Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// OpenAI client
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

// Axios instance for general API calls
export const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Pinata configuration
export const pinataConfig = {
  apiKey: PINATA_API_KEY,
  secretKey: PINATA_SECRET_KEY,
  baseURL: 'https://api.pinata.cloud'
}

// Stripe configuration
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY
}

// GeoJS API for location services
export const geoAPI = {
  baseURL: 'https://get.geojs.io/v1/ip',
  countryURL: 'https://get.geojs.io/v1/ip/country',
  stateURL: 'https://get.geojs.io/v1/ip/region'
}

// API endpoints
export const endpoints = {
  // Supabase tables
  users: 'users',
  stateGuides: 'state_guides',
  scenarioScripts: 'scenario_scripts',
  incidentLogs: 'incident_logs',
  
  // External APIs
  openai: 'https://api.openai.com/v1/chat/completions',
  pinata: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
  stripe: 'https://api.stripe.com/v1'
}

// Request interceptors
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('guardpoint-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('guardpoint-token')
      localStorage.removeItem('guardpoint-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  supabase,
  openai,
  apiClient,
  pinataConfig,
  stripeConfig,
  geoAPI,
  endpoints
}
