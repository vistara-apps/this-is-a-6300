// Storage Service for handling file uploads and IPFS storage via Pinata
import { pinataConfig, apiClient } from '../config/api'
import toast from 'react-hot-toast'

class StorageService {
  // Upload file to IPFS via Pinata
  async uploadToIPFS(file, metadata = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata
      const pinataMetadata = {
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'incident-recording',
          timestamp: metadata.timestamp || new Date().toISOString(),
          userId: metadata.userId || 'anonymous',
          ...metadata.customData
        }
      }
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
      
      const pinataOptions = {
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 2
            },
            {
              id: 'NYC1', 
              desiredReplicationCount: 2
            }
          ]
        }
      }
      
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      const response = await apiClient.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': pinataConfig.apiKey,
            'pinata_secret_api_key': pinataConfig.secretKey
          },
          timeout: 60000 // 60 seconds for large files
        }
      )

      const result = {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        metadata: pinataMetadata
      }

      toast.success('File uploaded to secure storage successfully!')
      return result
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      toast.error('Failed to upload file to secure storage')
      throw error
    }
  }

  // Upload JSON data to IPFS
  async uploadJSONToIPFS(data, metadata = {}) {
    try {
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      
      const file = new File([jsonBlob], metadata.filename || 'data.json', {
        type: 'application/json'
      })

      return await this.uploadToIPFS(file, {
        ...metadata,
        type: 'json-data'
      })
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error)
      throw error
    }
  }

  // Create incident summary card and upload
  async createIncidentSummaryCard(incidentData) {
    try {
      const summaryCard = {
        id: incidentData.id,
        timestamp: incidentData.timestamp,
        location: incidentData.location,
        type: incidentData.type,
        duration: incidentData.duration,
        summary: incidentData.summary,
        recordingUrl: incidentData.recordingUrl,
        notes: incidentData.notes,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0',
          app: 'GuardPoint'
        }
      }

      const result = await this.uploadJSONToIPFS(summaryCard, {
        name: `incident-summary-${incidentData.id}`,
        filename: `incident-${incidentData.id}-summary.json`,
        type: 'incident-summary',
        timestamp: incidentData.timestamp,
        userId: incidentData.userId
      })

      return {
        ...result,
        summaryCard
      }
    } catch (error) {
      console.error('Error creating incident summary card:', error)
      throw error
    }
  }

  // Get file from IPFS
  async getFromIPFS(ipfsHash) {
    try {
      const response = await apiClient.get(
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        { timeout: 30000 }
      )
      return response.data
    } catch (error) {
      console.error('Error getting file from IPFS:', error)
      throw error
    }
  }

  // Pin existing IPFS hash
  async pinByHash(ipfsHash, metadata = {}) {
    try {
      const response = await apiClient.post(
        'https://api.pinata.cloud/pinning/pinByHash',
        {
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: metadata.name || `pinned-${ipfsHash}`,
            keyvalues: metadata.keyvalues || {}
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': pinataConfig.apiKey,
            'pinata_secret_api_key': pinataConfig.secretKey
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Error pinning by hash:', error)
      throw error
    }
  }

  // Unpin file from IPFS
  async unpinFile(ipfsHash) {
    try {
      const response = await apiClient.delete(
        `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
        {
          headers: {
            'pinata_api_key': pinataConfig.apiKey,
            'pinata_secret_api_key': pinataConfig.secretKey
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Error unpinning file:', error)
      throw error
    }
  }

  // List pinned files
  async listPinnedFiles(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.pageLimit) params.append('pageLimit', filters.pageLimit)
      if (filters.pageOffset) params.append('pageOffset', filters.pageOffset)
      if (filters.metadata) {
        Object.entries(filters.metadata).forEach(([key, value]) => {
          params.append(`metadata[keyvalues][${key}]`, value)
        })
      }

      const response = await apiClient.get(
        `https://api.pinata.cloud/data/pinList?${params.toString()}`,
        {
          headers: {
            'pinata_api_key': pinataConfig.apiKey,
            'pinata_secret_api_key': pinataConfig.secretKey
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Error listing pinned files:', error)
      throw error
    }
  }

  // Get storage usage
  async getStorageUsage() {
    try {
      const response = await apiClient.get(
        'https://api.pinata.cloud/data/userPinnedDataTotal',
        {
          headers: {
            'pinata_api_key': pinataConfig.apiKey,
            'pinata_secret_api_key': pinataConfig.secretKey
          }
        }
      )

      return {
        pinCount: response.data.pin_count,
        pinSizeTotal: response.data.pin_size_total,
        pinSizeWithReplicationsTotal: response.data.pin_size_with_replications_total
      }
    } catch (error) {
      console.error('Error getting storage usage:', error)
      throw error
    }
  }

  // Test Pinata connection
  async testConnection() {
    try {
      const response = await apiClient.get(
        'https://api.pinata.cloud/data/testAuthentication',
        {
          headers: {
            'pinata_api_key': pinataConfig.apiKey,
            'pinata_secret_api_key': pinataConfig.secretKey
          }
        }
      )

      return {
        authenticated: true,
        message: response.data.message
      }
    } catch (error) {
      console.error('Pinata connection test failed:', error)
      return {
        authenticated: false,
        error: error.message
      }
    }
  }

  // Convert blob to file
  blobToFile(blob, filename, mimeType) {
    return new File([blob], filename, { type: mimeType })
  }

  // Generate shareable link
  generateShareableLink(ipfsHash, type = 'file') {
    const baseUrl = 'https://gateway.pinata.cloud/ipfs/'
    const fullUrl = `${baseUrl}${ipfsHash}`
    
    return {
      ipfsUrl: fullUrl,
      shortUrl: fullUrl, // In production, you might want to use a URL shortener
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`,
      type
    }
  }

  // Validate file before upload
  validateFile(file, maxSize = 100 * 1024 * 1024) { // 100MB default
    const errors = []

    if (!file) {
      errors.push('No file provided')
      return { valid: false, errors }
    }

    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`)
    }

    // Check file type
    const allowedTypes = [
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm',
      'application/json', 'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default new StorageService()
