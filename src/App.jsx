import React, { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import Header from './components/Header'
import TabNavigation from './components/TabNavigation'
import RightsGuide from './components/RightsGuide'
import ScenarioScripts from './components/ScenarioScripts'
import IncidentRecorder from './components/IncidentRecorder'
import IncidentHistory from './components/IncidentHistory'

function App() {
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
      default:
        return <RightsGuide />
    }
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-md mx-auto px-4">
          <Header />
          <main className="pb-20">
            {renderActiveTab()}
          </main>
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </AppProvider>
  )
}

export default App