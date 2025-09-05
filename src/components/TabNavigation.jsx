import React from 'react'
import { BookOpen, MessageSquare, Video, Clock, Crown } from 'lucide-react'
import { useApp } from '../context/AppContext'

const TabNavigation = ({ activeTab, onTabChange }) => {
  const { isPremium, isInTrial } = useApp()
  
  const tabs = [
    { id: 'rights', label: 'Rights', icon: BookOpen },
    { id: 'scripts', label: 'Scripts', icon: MessageSquare },
    { id: 'record', label: 'Record', icon: Video },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'premium', label: 'Premium', icon: Crown, showBadge: !isPremium && !isInTrial }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 px-4">
      <div className="max-w-screen-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-accent bg-accent/10' 
                    : 'text-text-secondary hover:text-primary hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                
                {/* Premium badge */}
                {tab.showBadge && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-surface"></div>
                )}
                
                {/* Premium/Trial indicator */}
                {tab.id === 'premium' && (isPremium || isInTrial) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-surface"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default TabNavigation
