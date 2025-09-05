import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppProvider, useApp } from './context/AppContext'
import Header from './components/Header'
import TabNavigation from './components/TabNavigation'
import RightsGuide from './components/RightsGuide'
import ScenarioScripts from './components/ScenarioScripts'
import IncidentRecorder from './components/IncidentRecorder'
import IncidentHistory from './components/IncidentHistory'
import PremiumFeatures from './components/PremiumFeatures'
// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
  </div>
)

// Main app content component
const AppContent = () => {
  const { loading, offlineMode } = useApp()
  const [activeTab, setActiveTab] = useState('rights')

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'rights':
        return <RightsGuide />
      case 'scripts':
        return <ScenarioScripts />
      case 'record':
        return <IncidentRecorder />
      case 'history':
        return <IncidentHistory />
      case 'premium':
        return <PremiumFeatures />
      default:
        return <RightsGuide />
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Offline indicator */}
      {offlineMode && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm">
          <span className="font-semibold">Offline Mode</span> - Some features may be limited
        </div>
      )}
      
      <div className="max-w-screen-md mx-auto px-4">
        <Header />
        <main className="pb-20">
          {renderActiveTab()}
        </main>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AppProvider>
  )
}

export default App
