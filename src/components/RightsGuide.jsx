import React, { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'

const RightsGuide = () => {
  const { currentState } = useApp()
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // Mock data - in production, this would come from an API based on state
  const rightsData = {
    California: {
      overview: "In California, you have specific constitutional rights during police interactions. Understanding these rights can help protect you and ensure fair treatment.",
      sections: [
        {
          id: 'traffic-stops',
          title: 'Traffic Stops',
          icon: '🚗',
          content: [
            "You must provide your driver's license, registration, and proof of insurance when requested.",
            "You have the right to remain silent beyond providing required documents.",
            "You do not have to consent to a vehicle search unless there's probable cause.",
            "You can ask if you're free to leave.",
            "Record the interaction if you can do so safely."
          ]
        },
        {
          id: 'questioning',
          title: 'Police Questioning',
          icon: '❓',
          content: [
            "You have the right to remain silent (5th Amendment).",
            "You have the right to an attorney (6th Amendment).",
            "You must clearly state: 'I am invoking my right to remain silent and want an attorney.'",
            "Police can't punish you for exercising these rights.",
            "You don't have to answer questions without an attorney present."
          ]
        },
        {
          id: 'searches',
          title: 'Searches & Seizures',
          icon: '🔍',
          content: [
            "Police need a warrant or probable cause to search your property.",
            "You can clearly state: 'I do not consent to any search.'",
            "Never physically resist, even if you believe the search is illegal.",
            "Police can pat you down for weapons if they have reasonable suspicion.",
            "Your phone is protected - police typically need a warrant to search it."
          ]
        },
        {
          id: 'arrest',
          title: 'During an Arrest',
          icon: '⚖️',
          content: [
            "You have the right to know why you're being arrested.",
            "Remain calm and don't resist, even if you believe the arrest is wrongful.",
            "Ask for an attorney immediately and repeatedly.",
            "Don't sign anything without an attorney present.",
            "You have the right to make a phone call."
          ]
        }
      ]
    }
  }

  const stateRights = rightsData[currentState] || rightsData.California

  return (
    <div className="space-y-lg animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-start gap-md">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary mb-sm">
              Your Rights in {currentState}
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              {stateRights.overview}
            </p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-lg">
        <div className="flex items-start gap-md">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-orange-800 mb-xs">Important Notice</h3>
            <p className="text-sm text-orange-700">
              This information is for educational purposes. Laws may vary and change. 
              Consult with a qualified attorney for specific legal advice.
            </p>
          </div>
        </div>
      </div>

      {/* Rights Sections */}
      <div className="space-y-md">
        {stateRights.sections.map((section) => (
          <div key={section.id} className="card">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-0"
            >
              <div className="flex items-center gap-md">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-lg font-medium text-primary">{section.title}</h3>
              </div>
              {expandedSections[section.id] ? (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              )}
            </button>
            
            {expandedSections[section.id] && (
              <div className="mt-lg pt-lg border-t border-gray-100 animate-slide-up">
                <ul className="space-y-md">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-md text-sm">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-text-primary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RightsGuide