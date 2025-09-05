import React, { useState, useRef, useEffect } from 'react'
import { Video, Square, Pause, Play, Mic, Share2, MapPin, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'

const IncidentRecorder = () => {
  const { addIncident, isRecording, setIsRecording } = useApp()
  const [recordingType, setRecordingType] = useState('video') // 'video' or 'audio'
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordedChunks, setRecordedChunks] = useState([])
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }

    return () => {
      stopRecording()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const constraints = recordingType === 'video' 
        ? { video: true, audio: true }
        : { audio: true }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (recordingType === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      setRecordedChunks([])
      setRecordingDuration(0)
      setIsRecording(true)
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data])
        }
      }

      recorder.onstop = () => {
        processRecording()
      }

      recorder.start()
      startTimer()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access camera/microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    stopTimer()
    setIsRecording(false)
    setIsPaused(false)
  }

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause()
      setIsPaused(true)
      stopTimer()
    }
  }

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume()
      setIsPaused(false)
      startTimer()
    }
  }

  const processRecording = async () => {
    setIsProcessing(true)
    
    // Create blob from recorded chunks
    const blob = new Blob(recordedChunks, {
      type: recordingType === 'video' ? 'video/webm' : 'audio/webm'
    })
    
    // Create object URL for the recording
    const recordingUrl = URL.createObjectURL(blob)
    
    // Generate summary card content
    const summaryCard = {
      type: recordingType,
      duration: recordingDuration,
      timestamp: new Date().toISOString(),
      location: currentLocation,
      size: blob.size
    }
    
    // Save incident
    const incident = {
      type: recordingType,
      recordingUrl,
      summaryCardContent: summaryCard,
      notes: `${recordingType === 'video' ? 'Video' : 'Audio'} recording - ${formatDuration(recordingDuration)}`,
      location: currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : 'Unknown'
    }
    
    addIncident(incident)
    
    // Reset state
    setRecordedChunks([])
    setRecordingDuration(0)
    setIsProcessing(false)
    
    alert('Recording saved successfully!')
  }

  const shareRecording = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Incident Recording',
        text: `Recorded a ${recordingType} incident at ${new Date().toLocaleString()}`,
        url: window.location.href
      })
    } else {
      // Fallback - copy to clipboard
      const shareText = `Incident recorded at ${new Date().toLocaleString()}`
      navigator.clipboard.writeText(shareText)
      alert('Recording details copied to clipboard')
    }
  }

  return (
    <div className="space-y-lg animate-fade-in">
      {/* Header */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-sm">
          Incident Recorder
        </h2>
        <p className="text-text-secondary text-sm">
          One-tap recording with automatic documentation
        </p>
      </div>

      {/* Recording Type Selector */}
      {!isRecording && (
        <div className="card">
          <h3 className="font-medium text-primary mb-md">Recording Type</h3>
          <div className="flex gap-md">
            <button
              onClick={() => setRecordingType('video')}
              className={`flex-1 p-lg rounded-lg border-2 transition-colors ${
                recordingType === 'video'
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Video className="w-6 h-6 mx-auto mb-sm" />
              <div className="text-sm font-medium">Video</div>
              <div className="text-xs text-text-secondary mt-xs">
                Audio + Visual evidence
              </div>
            </button>
            <button
              onClick={() => setRecordingType('audio')}
              className={`flex-1 p-lg rounded-lg border-2 transition-colors ${
                recordingType === 'audio'
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Mic className="w-6 h-6 mx-auto mb-sm" />
              <div className="text-sm font-medium">Audio</div>
              <div className="text-xs text-text-secondary mt-xs">
                Voice recording only
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {recordingType === 'video' && isRecording && (
        <div className="card">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg bg-black"
          />
        </div>
      )}

      {/* Recording Controls */}
      <div className="card-elevated">
        <div className="text-center">
          {isRecording && (
            <div className="mb-lg">
              <div className="flex items-center justify-center gap-md mb-md">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-mono font-medium text-primary">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-xs text-sm text-text-secondary">
                <Clock className="w-4 h-4" />
                <span>Recording {recordingType} evidence</span>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-md">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="btn-primary flex items-center gap-md text-lg px-xxl py-lg"
              >
                {recordingType === 'video' ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
                Start Recording
              </button>
            ) : (
              <div className="flex gap-md">
                {isPaused ? (
                  <button
                    onClick={resumeRecording}
                    className="btn-secondary flex items-center gap-sm"
                  >
                    <Play className="w-5 h-5" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseRecording}
                    className="btn-secondary flex items-center gap-sm"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                )}
                <button
                  onClick={stopRecording}
                  className="bg-red-500 text-white px-lg py-md rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-sm"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="mt-lg text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
              <p className="text-sm text-text-secondary mt-sm">Processing recording...</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Info */}
      {currentLocation && (
        <div className="card">
          <div className="flex items-center gap-md">
            <MapPin className="w-5 h-5 text-accent" />
            <div>
              <h4 className="font-medium text-primary">Location Tracking</h4>
              <p className="text-sm text-text-secondary">
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-lg">
        <h4 className="font-medium text-blue-800 mb-md">📱 Recording Tips</h4>
        <ul className="space-y-xs text-sm text-blue-700">
          <li>• Hold your phone steady and speak clearly</li>
          <li>• State the date, time, and location at the beginning</li>
          <li>• Keep recording even if asked to stop</li>
          <li>• Don't interfere with police activities while recording</li>
          <li>• Your recording is automatically timestamped and geotagged</li>
        </ul>
      </div>
    </div>
  )
}

export default IncidentRecorder