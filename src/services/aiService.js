// AI Service for generating dynamic content using OpenAI
import { openai } from '../config/api'
import toast from 'react-hot-toast'

class AIService {
  // Generate state-specific rights guide
  async generateRightsGuide(state, scenario = 'general') {
    try {
      const prompt = `Generate a comprehensive, accurate legal rights guide for ${state} regarding police interactions. Focus on ${scenario} scenarios. 

      Please provide:
      1. A brief overview of constitutional rights in ${state}
      2. Specific state laws that differ from federal standards
      3. Practical advice for common police interactions
      4. What to do and what NOT to do
      5. Important phone numbers and resources

      Format the response as a JSON object with sections: overview, sections (array of {id, title, icon, content}), resources, and lastUpdated.
      
      Keep the language clear, accessible, and legally accurate. Focus on practical guidance that can help people stay safe and know their rights.`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a legal expert specializing in constitutional rights and police interactions. Provide accurate, helpful, and practical legal guidance. Always emphasize safety and de-escalation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })

      const content = response.choices[0].message.content
      return JSON.parse(content)
    } catch (error) {
      console.error('Error generating rights guide:', error)
      toast.error('Unable to generate rights guide. Using default content.')
      return this.getDefaultRightsGuide(state)
    }
  }

  // Generate scenario-specific scripts
  async generateScenarioScript(scenario, language = 'English', state = 'California') {
    try {
      const prompt = `Generate a practical, safe script for a ${scenario} interaction with police in ${state}. 

      The script should be in ${language} and include:
      1. Polite, respectful phrases
      2. Clear assertion of rights
      3. De-escalation language
      4. What to say and what NOT to say
      5. Step-by-step guidance

      Format as an array of phrases/sentences that someone can use in order during the interaction.
      Keep it concise, practical, and focused on safety and legal protection.`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in police interactions and civil rights. Create scripts that prioritize safety, respect, and legal protection. Always emphasize de-escalation and compliance with lawful orders while protecting constitutional rights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.2
      })

      const content = response.choices[0].message.content
      return JSON.parse(content)
    } catch (error) {
      console.error('Error generating scenario script:', error)
      toast.error('Unable to generate custom script. Using default script.')
      return this.getDefaultScript(scenario, language)
    }
  }

  // Generate incident summary
  async generateIncidentSummary(incidentData) {
    try {
      const prompt = `Create a professional incident summary based on the following data:
      
      Date/Time: ${incidentData.timestamp}
      Location: ${incidentData.location || 'Not specified'}
      Type: ${incidentData.type || 'General incident'}
      Duration: ${incidentData.duration || 'Not specified'}
      Notes: ${incidentData.notes || 'No additional notes'}
      
      Generate a clear, factual summary that could be useful for legal documentation. Include:
      1. Incident overview
      2. Key details
      3. Timeline if available
      4. Recommendations for follow-up
      
      Keep it professional, objective, and legally appropriate.`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a legal documentation assistant. Create clear, professional, and objective incident summaries that could be useful for legal purposes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.1
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error generating incident summary:', error)
      return `Incident Summary - ${new Date(incidentData.timestamp).toLocaleString()}\n\nType: ${incidentData.type}\nLocation: ${incidentData.location || 'Not specified'}\nNotes: ${incidentData.notes || 'No additional notes provided'}`
    }
  }

  // Translate content to different languages
  async translateContent(content, targetLanguage) {
    try {
      const prompt = `Translate the following content to ${targetLanguage}. Maintain the legal accuracy and tone:

      ${content}
      
      Ensure the translation is culturally appropriate and legally accurate for the target language.`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in legal and civil rights content. Provide accurate translations that maintain legal precision and cultural appropriateness.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error translating content:', error)
      toast.error('Translation service unavailable')
      return content
    }
  }

  // Get default rights guide fallback
  getDefaultRightsGuide(state) {
    return {
      overview: `In ${state}, you have constitutional rights during police interactions. Understanding these rights can help protect you and ensure fair treatment.`,
      sections: [
        {
          id: 'basic-rights',
          title: 'Your Basic Rights',
          icon: '⚖️',
          content: [
            'You have the right to remain silent (5th Amendment)',
            'You have the right to an attorney (6th Amendment)',
            'You have the right to be free from unreasonable searches (4th Amendment)',
            'You have the right to equal treatment regardless of race, religion, or background'
          ]
        },
        {
          id: 'traffic-stops',
          title: 'Traffic Stops',
          icon: '🚗',
          content: [
            'Pull over safely and turn off your engine',
            'Keep your hands visible on the steering wheel',
            'Provide license, registration, and insurance when requested',
            'You can remain silent beyond providing required documents',
            'You can refuse consent to search your vehicle'
          ]
        },
        {
          id: 'street-encounters',
          title: 'Street Encounters',
          icon: '🚶',
          content: [
            'Ask "Am I free to leave?" if not under arrest',
            'You can remain silent and ask for an attorney',
            'You don\'t have to consent to searches',
            'Stay calm and keep your hands visible',
            'Don\'t resist, even if you believe the stop is unfair'
          ]
        }
      ],
      resources: [
        'ACLU Know Your Rights: aclu.org',
        'Local Legal Aid: Find at lsc.gov',
        'Emergency: 911',
        'Non-emergency police: Check local number'
      ],
      lastUpdated: new Date().toISOString()
    }
  }

  // Get default script fallback
  getDefaultScript(scenario, language) {
    const scripts = {
      'traffic-stop': {
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
      },
      'street-questioning': {
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
    }

    return scripts[scenario]?.[language] || scripts['traffic-stop']['English']
  }

  // Check if AI services are available
  async checkServiceHealth() {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })
      return { available: true, model: 'gpt-3.5-turbo' }
    } catch (error) {
      console.error('AI service health check failed:', error)
      return { available: false, error: error.message }
    }
  }
}

export default new AIService()
