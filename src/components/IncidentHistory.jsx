import React, { useState } from 'react'
import { Calendar, MapPin, Play, Share2, Trash2, Clock, Video, Mic } from 'lucide-react'
import { useApp } from '../context/AppContext'

const IncidentHistory = () => {
  const { incidents } = useApp()
  const [selectedIncident, setSelectedIncident] = useState(null)

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const shareIncident = (incident) => {
    const shareData = {
      title: 'Incident Recording',
      text: `Incident recorded on ${formatDate(incident.timestamp)}`,
      url: incident.recordingUrl
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      navigator.clipboard.writeText(
        `Incident recorded on ${formatDate(incident.timestamp)}\nLocation: ${incident.location}`
      )
      alert('Incident details copied to clipboard')
    }
  }

  const deleteIncident = (incidentId) => {
    if (confirm('Are you sure you want to delete this incident recording?')) {
      // In a real app, you'd call a delete function from context
      console.log('Delete incident:', incidentId)
    }
  }

  const playRecording = (incident) => {
    if (incident.recordingUrl) {
      const audio = new Audio(incident.recordingUrl)
      audio.play().catch(error => {
        console.error('Error playing recording:', error)
        alert('Unable to play recording')
      })
    }
  }

  if (incidents.length === 0) {
    return (
      <div className="space-y-lg animate-fade-in">
        <div className="card">
          <h2 className="text-xl font-semibold text-primary mb-sm">
            Incident History
          </h2>
          <p className="text-text-secondary text-sm">
            Your recorded incidents and documentation
          </p>
        </div>

        <div className="card text-center py-xxl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-lg">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-primary mb-sm">No Incidents Recorded</h3>
          <p className="text-text-secondary text-sm mb-lg">
            When you record incidents, they'll appear here for easy access and sharing.
          </p>
          <button 
            onClick={() => window.location.hash = '#record'}
            className="btn-primary"
          >
            Record Your First Incident
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-lg animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary mb-sm">
              Incident History
            </h2>
            <p className="text-text-secondary text-sm">
              {incidents.length} recorded incident{incidents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-text-secondary">Total Evidence</div>
            <div className="font-medium text-primary">{incidents.length} files</div>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-md">
        {incidents.map((incident) => (
          <div key={incident.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-md">
              {/* Type Icon */}
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                {incident.type === 'video' ? (
                  <Video className="w-6 h-6 text-accent" />
                ) : (
                  <Mic className="w-6 h-6 text-accent" />
                )}
              </div>

              {/* Incident Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-sm">
                  <h3 className="font-medium text-primary">
                    {incident.type === 'video' ? 'Video' : 'Audio'} Recording
                  </h3>
                  <span className="text-xs text-text-secondary bg-gray-100 px-sm py-xs rounded">
                    {incident.summaryCardContent?.duration ? 
                      formatDuration(incident.summaryCardContent.duration) : 
                      'Unknown duration'
                    }
                  </span>
                </div>

                <div className="space-y-xs mb-md">
                  <div className="flex items-center gap-xs text-sm text-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(incident.timestamp)}</span>
                  </div>
                  {incident.location && (
                    <div className="flex items-center gap-xs text-sm text-text-secondary">
                      <MapPin className="w-4 h-4" />
                      <span>{incident.location}</span>
                    </div>
                  )}
                </div>

                {incident.notes && (
                  <p className="text-sm text-text-primary mb-md">
                    {incident.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-sm">
                  <button
                    onClick={() => playRecording(incident)}
                    className="flex items-center gap-xs text-sm text-accent hover:text-accent/80 font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                  <button
                    onClick={() => shareIncident(incident)}
                    className="flex items-center gap-xs text-sm text-text-secondary hover:text-primary font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={() => setSelectedIncident(incident)}
                    className="text-sm text-text-secondary hover:text-primary font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-lg border-b border-gray-100">
              <h3 className="text-lg font-semibold text-primary">Incident Details</h3>
            </div>
            
            <div className="p-lg space-y-lg">
              <div>
                <h4 className="font-medium text-primary mb-sm">Recording Information</h4>
                <div className="space-y-sm text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-primary capitalize">{selectedIncident.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Duration:</span>
                    <span className="text-primary">
                      {selectedIncident.summaryCardContent?.duration ? 
                        formatDuration(selectedIncident.summaryCardContent.duration) : 
                        'Unknown'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Date:</span>
                    <span className="text-primary">{formatDate(selectedIncident.timestamp)}</span>
                  </div>
                  {selectedIncident.location && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Location:</span>
                      <span className="text-primary">{selectedIncident.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedIncident.notes && (
                <div>
                  <h4 className="font-medium text-primary mb-sm">Notes</h4>
                  <p className="text-sm text-text-primary">{selectedIncident.notes}</p>
                </div>
              )}

              <div className="flex gap-sm">
                <button
                  onClick={() => playRecording(selectedIncident)}
                  className="btn-primary flex-1"
                >
                  <Play className="w-4 h-4 mr-sm" />
                  Play Recording
                </button>
                <button
                  onClick={() => shareIncident(selectedIncident)}
                  className="btn-secondary"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-lg border-t border-gray-100">
              <button
                onClick={() => setSelectedIncident(null)}
                className="w-full btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-lg">
        <h4 className="font-medium text-primary mb-sm">📱 Storage & Privacy</h4>
        <ul className="space-y-xs text-sm text-text-secondary">
          <li>• Recordings are stored locally on your device</li>
          <li>• No data is uploaded to external servers</li>
          <li>• You control when and how to share your evidence</li>
          <li>• Clear your browser data to remove all recordings</li>
        </ul>
      </div>
    </div>
  )
}

export default IncidentHistory