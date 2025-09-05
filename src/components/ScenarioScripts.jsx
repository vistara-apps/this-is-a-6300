import React, { useState } from 'react'
import { Play, Copy, Globe, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

const ScenarioScripts = () => {
  const { preferredLanguage, setPreferredLanguage } = useApp()
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [copiedText, setCopiedText] = useState('')

  const scenarios = [
    {
      id: 'traffic-stop',
      title: 'Traffic Stop',
      description: 'What to say during a routine traffic stop',
      icon: '🚗',
      scripts: {
        English: [
          "Good [morning/afternoon/evening], officer.",
          "I understand you've stopped me. May I ask why?",
          "Here are my license, registration, and insurance.",
          "I prefer to exercise my right to remain silent.",
          "Am I free to leave?",
          "I do not consent to any searches of my vehicle."
        ],
        Spanish: [
          "Buenos [días/tardes/noches], oficial.",
          "Entiendo que me detuvo. ¿Puedo preguntar por qué?",
          "Aquí están mi licencia, registro y seguro.",
          "Prefiero ejercer mi derecho a permanecer en silencio.",
          "¿Soy libre de irme?",
          "No consiento a ningún registro de mi vehículo."
        ]
      }
    },
    {
      id: 'street-questioning',
      title: 'Street Questioning',
      description: 'Responses when approached by police on the street',
      icon: '🚶',
      scripts: {
        English: [
          "Hello, officer. How can I help you?",
          "Am I being detained or am I free to go?",
          "I prefer to remain silent.",
          "I want to speak with an attorney.",
          "I do not consent to any search.",
          "May I see your badge number and get your name?"
        ],
        Spanish: [
          "Hola, oficial. ¿Cómo puedo ayudarle?",
          "¿Estoy detenido o soy libre de irme?",
          "Prefiero permanecer en silencio.",
          "Quiero hablar con un abogado.",
          "No consiento a ningún registro.",
          "¿Puedo ver su número de placa y obtener su nombre?"
        ]
      }
    },
    {
      id: 'home-visit',
      title: 'Police at Your Door',
      description: 'How to handle police visiting your home',
      icon: '🏠',
      scripts: {
        English: [
          "Hello, I see you're police officers. How can I help you?",
          "Do you have a warrant?",
          "I do not consent to you entering my home.",
          "I prefer to speak with you through the door.",
          "I want to contact my attorney before answering questions.",
          "I'm going to remain silent now."
        ],
        Spanish: [
          "Hola, veo que son oficiales de policía. ¿Cómo puedo ayudarles?",
          "¿Tienen una orden judicial?",
          "No consiento a que entren en mi casa.",
          "Prefiero hablar con ustedes a través de la puerta.",
          "Quiero contactar a mi abogado antes de responder preguntas.",
          "Voy a permanecer en silencio ahora."
        ]
      }
    }
  ]

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(''), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = preferredLanguage === 'Spanish' ? 'es-ES' : 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-lg animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h2 className="text-xl font-semibold text-primary mb-sm">
              Scenario Scripts
            </h2>
            <p className="text-text-secondary text-sm">
              Pre-written phrases for common police interactions
            </p>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-xs bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreferredLanguage('English')}
              className={`px-md py-xs rounded-md text-sm font-medium transition-colors ${
                preferredLanguage === 'English'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setPreferredLanguage('Spanish')}
              className={`px-md py-xs rounded-md text-sm font-medium transition-colors ${
                preferredLanguage === 'Spanish'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              ES
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Selection */}
      {!selectedScenario && (
        <div className="space-y-md">
          <h3 className="text-lg font-medium text-primary">Choose a Scenario</h3>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              className="w-full card hover:shadow-lg transition-shadow text-left group"
            >
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{scenario.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-primary group-hover:text-accent transition-colors">
                    {scenario.title}
                  </h4>
                  <p className="text-sm text-text-secondary mt-xs">
                    {scenario.description}
                  </p>
                </div>
                <div className="text-text-secondary group-hover:text-accent transition-colors">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Scenario Script */}
      {selectedScenario && (
        <div className="space-y-lg">
          <div className="flex items-center gap-md">
            <button
              onClick={() => setSelectedScenario(null)}
              className="text-accent hover:text-accent/80 text-sm font-medium"
            >
              ← Back to scenarios
            </button>
          </div>

          <div className="card-elevated">
            <div className="flex items-center gap-md mb-lg">
              <span className="text-3xl">{selectedScenario.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-primary">
                  {selectedScenario.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {preferredLanguage} version
                </p>
              </div>
            </div>

            <div className="space-y-md">
              {selectedScenario.scripts[preferredLanguage].map((phrase, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-md">
                    <p className="text-primary leading-relaxed flex-1">
                      "{phrase}"
                    </p>
                    <div className="flex items-center gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => speakText(phrase)}
                        className="p-2 hover:bg-surface rounded-lg transition-colors"
                        title="Listen"
                      >
                        <Play className="w-4 h-4 text-accent" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(phrase)}
                        className="p-2 hover:bg-surface rounded-lg transition-colors"
                        title="Copy"
                      >
                        {copiedText === phrase ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-text-secondary" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-lg pt-lg border-t border-gray-100">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-lg">
                <h4 className="font-medium text-blue-800 mb-xs">💡 Pro Tip</h4>
                <p className="text-sm text-blue-700">
                  Practice these phrases beforehand. Stay calm, speak clearly, and remember 
                  that being polite doesn't mean giving up your rights.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScenarioScripts