// Payment Service for handling Stripe payments and premium features
import { loadStripe } from '@stripe/stripe-js'
import { stripeConfig, apiClient } from '../config/api'
import toast from 'react-hot-toast'

class PaymentService {
  constructor() {
    this.stripe = null
    this.initStripe()
  }

  // Initialize Stripe
  async initStripe() {
    try {
      this.stripe = await loadStripe(stripeConfig.publishableKey)
    } catch (error) {
      console.error('Error initializing Stripe:', error)
    }
  }

  // Premium feature pricing
  getPremiumFeatures() {
    return {
      monthly: {
        priceId: 'price_monthly_premium',
        amount: 999, // $9.99
        currency: 'usd',
        interval: 'month',
        features: [
          'Advanced documentation tools',
          'Multi-language script support (10+ languages)',
          'Offline access to all content',
          'Priority AI-generated content',
          'Extended cloud storage (10GB)',
          'Legal resource database access',
          'Priority customer support'
        ]
      },
      yearly: {
        priceId: 'price_yearly_premium',
        amount: 9999, // $99.99 (save $20)
        currency: 'usd',
        interval: 'year',
        features: [
          'All monthly features',
          'Save $20 per year',
          'Exclusive legal updates',
          'Advanced incident analytics',
          'Custom script templates',
          'Legal consultation credits (2 per year)'
        ]
      },
      lifetime: {
        priceId: 'price_lifetime_premium',
        amount: 19999, // $199.99
        currency: 'usd',
        interval: 'one_time',
        features: [
          'All premium features forever',
          'No recurring payments',
          'Future feature access included',
          'Unlimited cloud storage',
          'Priority feature requests',
          'Lifetime legal updates'
        ]
      }
    }
  }

  // Micro-transaction items
  getMicroTransactions() {
    return {
      script_pack_spanish: {
        priceId: 'price_script_spanish',
        amount: 299, // $2.99
        currency: 'usd',
        name: 'Spanish Script Pack',
        description: 'Complete Spanish language scripts for all scenarios'
      },
      script_pack_french: {
        priceId: 'price_script_french',
        amount: 299,
        currency: 'usd',
        name: 'French Script Pack',
        description: 'Complete French language scripts for all scenarios'
      },
      advanced_templates: {
        priceId: 'price_advanced_templates',
        amount: 499, // $4.99
        currency: 'usd',
        name: 'Advanced Document Templates',
        description: 'Professional incident report templates and forms'
      },
      state_pack: {
        priceId: 'price_state_pack',
        amount: 199, // $1.99
        currency: 'usd',
        name: 'Additional State Pack',
        description: 'Detailed rights guide for specific state'
      }
    }
  }

  // Create payment intent for premium subscription
  async createSubscription(priceId, customerId = null) {
    try {
      const response = await apiClient.post('/api/create-subscription', {
        priceId,
        customerId
      })

      const { clientSecret, subscriptionId } = response.data

      const result = await this.stripe.confirmCardPayment(clientSecret)

      if (result.error) {
        toast.error(result.error.message)
        throw new Error(result.error.message)
      }

      toast.success('Premium subscription activated!')
      return {
        success: true,
        subscriptionId,
        paymentIntent: result.paymentIntent
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast.error('Failed to process subscription payment')
      throw error
    }
  }

  // Create payment intent for one-time purchase
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await apiClient.post('/api/create-payment-intent', {
        amount,
        currency,
        metadata
      })

      const { clientSecret } = response.data

      return {
        clientSecret,
        amount,
        currency
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast.error('Failed to initialize payment')
      throw error
    }
  }

  // Process micro-transaction
  async processMicroTransaction(itemKey) {
    try {
      const item = this.getMicroTransactions()[itemKey]
      if (!item) {
        throw new Error('Invalid item')
      }

      const paymentIntent = await this.createPaymentIntent(
        item.amount,
        item.currency,
        {
          type: 'micro_transaction',
          item: itemKey,
          name: item.name
        }
      )

      const result = await this.stripe.confirmCardPayment(paymentIntent.clientSecret)

      if (result.error) {
        toast.error(result.error.message)
        throw new Error(result.error.message)
      }

      // Unlock the purchased item
      await this.unlockPurchasedItem(itemKey)

      toast.success(`${item.name} purchased successfully!`)
      return {
        success: true,
        item: itemKey,
        paymentIntent: result.paymentIntent
      }
    } catch (error) {
      console.error('Error processing micro-transaction:', error)
      toast.error('Failed to complete purchase')
      throw error
    }
  }

  // Unlock purchased item locally
  async unlockPurchasedItem(itemKey) {
    try {
      const purchases = JSON.parse(localStorage.getItem('guardpoint-purchases') || '[]')
      
      if (!purchases.includes(itemKey)) {
        purchases.push(itemKey)
        localStorage.setItem('guardpoint-purchases', JSON.stringify(purchases))
      }

      // Also sync with backend if user is authenticated
      const user = JSON.parse(localStorage.getItem('guardpoint-user') || 'null')
      if (user) {
        await apiClient.post('/api/sync-purchases', {
          userId: user.id,
          purchases
        })
      }
    } catch (error) {
      console.error('Error unlocking purchased item:', error)
    }
  }

  // Check if user has premium access
  isPremiumUser() {
    const user = JSON.parse(localStorage.getItem('guardpoint-user') || 'null')
    return user?.subscription?.status === 'active' || user?.subscription?.type === 'lifetime'
  }

  // Check if specific item is purchased
  hasPurchasedItem(itemKey) {
    const purchases = JSON.parse(localStorage.getItem('guardpoint-purchases') || '[]')
    return purchases.includes(itemKey) || this.isPremiumUser()
  }

  // Get user's subscription status
  async getSubscriptionStatus(customerId) {
    try {
      const response = await apiClient.get(`/api/subscription-status/${customerId}`)
      return response.data
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return { status: 'inactive' }
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await apiClient.post('/api/cancel-subscription', {
        subscriptionId
      })

      toast.success('Subscription cancelled successfully')
      return response.data
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
      throw error
    }
  }

  // Update payment method
  async updatePaymentMethod(customerId, paymentMethodId) {
    try {
      const response = await apiClient.post('/api/update-payment-method', {
        customerId,
        paymentMethodId
      })

      toast.success('Payment method updated successfully')
      return response.data
    } catch (error) {
      console.error('Error updating payment method:', error)
      toast.error('Failed to update payment method')
      throw error
    }
  }

  // Get payment history
  async getPaymentHistory(customerId) {
    try {
      const response = await apiClient.get(`/api/payment-history/${customerId}`)
      return response.data
    } catch (error) {
      console.error('Error getting payment history:', error)
      return []
    }
  }

  // Create customer
  async createCustomer(email, name) {
    try {
      const response = await apiClient.post('/api/create-customer', {
        email,
        name
      })

      return response.data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  // Format price for display
  formatPrice(amount, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  // Get trial period info
  getTrialInfo() {
    return {
      duration: 7, // 7 days
      features: [
        'Access to all premium features',
        'Multi-language support',
        'Advanced documentation tools',
        'Extended cloud storage',
        'Priority AI content generation'
      ]
    }
  }

  // Start free trial
  async startFreeTrial(customerId) {
    try {
      const response = await apiClient.post('/api/start-trial', {
        customerId
      })

      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 7)

      // Store trial info locally
      const trialInfo = {
        startDate: new Date().toISOString(),
        endDate: trialEnd.toISOString(),
        active: true
      }

      localStorage.setItem('guardpoint-trial', JSON.stringify(trialInfo))
      toast.success('Free trial started! Enjoy 7 days of premium features.')

      return response.data
    } catch (error) {
      console.error('Error starting free trial:', error)
      toast.error('Failed to start free trial')
      throw error
    }
  }

  // Check if user is in trial period
  isInTrialPeriod() {
    const trialInfo = JSON.parse(localStorage.getItem('guardpoint-trial') || 'null')
    
    if (!trialInfo || !trialInfo.active) {
      return false
    }

    const now = new Date()
    const trialEnd = new Date(trialInfo.endDate)
    
    return now < trialEnd
  }

  // Get days remaining in trial
  getTrialDaysRemaining() {
    const trialInfo = JSON.parse(localStorage.getItem('guardpoint-trial') || 'null')
    
    if (!trialInfo || !trialInfo.active) {
      return 0
    }

    const now = new Date()
    const trialEnd = new Date(trialInfo.endDate)
    const diffTime = trialEnd - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }
}

export default new PaymentService()
