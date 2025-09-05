import React, { useState } from 'react'
import { Crown, Star, Check, X, CreditCard, Gift } from 'lucide-react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const PremiumFeatures = () => {
  const { isPremium, isInTrial, paymentService, checkPremiumStatus } = useApp()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMicroTransactions, setShowMicroTransactions] = useState(false)

  const premiumFeatures = paymentService.getPremiumFeatures()
  const microTransactions = paymentService.getMicroTransactions()
  const trialInfo = paymentService.getTrialInfo()
  const trialDaysRemaining = paymentService.getTrialDaysRemaining()

  const handleStartTrial = async () => {
    try {
      setIsProcessing(true)
      await paymentService.startFreeTrial()
      checkPremiumStatus()
      toast.success('Free trial started! Enjoy premium features for 7 days.')
    } catch (error) {
      toast.error('Failed to start trial: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpgrade = async (planKey) => {
    try {
      setIsProcessing(true)
      const plan = premiumFeatures[planKey]
      
      // In a real implementation, you would integrate with Stripe
      toast.success(`Upgrading to ${planKey} plan...`)
      
      // Simulate payment process
      setTimeout(() => {
        toast.success('Payment successful! Premium features activated.')
        checkPremiumStatus()
        setIsProcessing(false)
      }, 2000)
      
    } catch (error) {
      toast.error('Payment failed: ' + error.message)
      setIsProcessing(false)
    }
  }

  const handleMicroTransaction = async (itemKey) => {
    try {
      setIsProcessing(true)
      const item = microTransactions[itemKey]
      
      // Simulate micro-transaction
      toast.success(`Purchasing ${item.name}...`)
      
      setTimeout(() => {
        toast.success(`${item.name} purchased successfully!`)
        setIsProcessing(false)
      }, 1500)
      
    } catch (error) {
      toast.error('Purchase failed: ' + error.message)
      setIsProcessing(false)
    }
  }

  if (isPremium) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Premium Member</span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            You're all set! 🎉
          </h1>
          <p className="text-text-secondary">
            Enjoy all premium features and thank you for supporting GuardPoint.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Your Premium Benefits</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {premiumFeatures.monthly.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-text-primary">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
          <Star className="w-5 h-5" />
          <span className="font-semibold">Premium Features</span>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4">
          Unlock Your Full Potential
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Get advanced tools, AI-powered content, and premium support to stay protected and informed.
        </p>
      </div>

      {/* Trial Banner */}
      {!isInTrial && !isPremium && (
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-6 mb-8 border border-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-accent/20 p-3 rounded-full">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Try Premium Free for {trialInfo.duration} Days
                </h3>
                <p className="text-text-secondary">
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
            <button
              onClick={handleStartTrial}
              disabled={isProcessing}
              className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Starting...' : 'Start Free Trial'}
            </button>
          </div>
        </div>
      )}

      {/* Trial Status */}
      {isInTrial && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Crown className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Free Trial Active
              </h3>
              <p className="text-green-600">
                {trialDaysRemaining} days remaining. Upgrade anytime to continue after trial.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {Object.entries(premiumFeatures).map(([key, plan]) => (
          <div
            key={key}
            className={`bg-surface rounded-xl p-6 shadow-card border-2 transition-all ${
              selectedPlan === key
                ? 'border-accent shadow-lg scale-105'
                : 'border-transparent hover:border-accent/30'
            } ${key === 'yearly' ? 'relative' : ''}`}
          >
            {key === 'yearly' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-primary mb-2 capitalize">
                {key} Plan
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">
                  {paymentService.formatPrice(plan.amount)}
                </span>
                {plan.interval !== 'one_time' && (
                  <span className="text-text-secondary">/{plan.interval}</span>
                )}
              </div>
              {key === 'yearly' && (
                <div className="text-green-600 font-semibold text-sm">
                  Save $20 per year
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-text-primary text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(key)}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                selectedPlan === key
                  ? 'bg-accent text-white hover:bg-accent/90'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {isProcessing ? 'Processing...' : `Choose ${key}`}
            </button>
          </div>
        ))}
      </div>

      {/* Micro-transactions */}
      <div className="bg-surface rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Individual Purchases
            </h2>
            <p className="text-text-secondary">
              Buy specific features without a subscription
            </p>
          </div>
          <button
            onClick={() => setShowMicroTransactions(!showMicroTransactions)}
            className="text-accent hover:text-accent/80 font-semibold"
          >
            {showMicroTransactions ? 'Hide' : 'Show'} Options
          </button>
        </div>

        {showMicroTransactions && (
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(microTransactions).map(([key, item]) => (
              <div
                key={key}
                className="border border-gray-200 rounded-lg p-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary">{item.name}</h3>
                  <span className="text-lg font-bold text-accent">
                    {paymentService.formatPrice(item.amount)}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-4">
                  {item.description}
                </p>
                <button
                  onClick={() => handleMicroTransaction(key)}
                  disabled={isProcessing}
                  className="w-full bg-accent/10 text-accent py-2 px-4 rounded-lg font-semibold hover:bg-accent/20 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Purchase'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          <details className="bg-surface rounded-lg p-4 shadow-card">
            <summary className="font-semibold text-primary cursor-pointer">
              Can I cancel my subscription anytime?
            </summary>
            <p className="text-text-secondary mt-2">
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
            </p>
          </details>
          
          <details className="bg-surface rounded-lg p-4 shadow-card">
            <summary className="font-semibold text-primary cursor-pointer">
              What happens to my data if I cancel?
            </summary>
            <p className="text-text-secondary mt-2">
              Your incident recordings and data remain secure. However, some premium features like AI summaries and extended cloud storage will no longer be available.
            </p>
          </details>
          
          <details className="bg-surface rounded-lg p-4 shadow-card">
            <summary className="font-semibold text-primary cursor-pointer">
              Is my payment information secure?
            </summary>
            <p className="text-text-secondary mt-2">
              Yes, we use Stripe for secure payment processing. We never store your payment information on our servers.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}

export default PremiumFeatures
