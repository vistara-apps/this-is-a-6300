// Authentication Service
import { supabase } from '../config/api'
import toast from 'react-hot-toast'

class AuthService {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            preferred_language: userData.preferredLanguage || 'English',
            current_state: userData.currentState || 'California'
          }
        }
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          ...userData
        })
      }

      toast.success('Account created successfully! Please check your email to verify.')
      return { user: data.user, session: data.session }
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast.success('Welcome back!')
      return { user: data.user, session: data.session }
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear local storage
      localStorage.removeItem('guardpoint-user')
      localStorage.removeItem('guardpoint-incidents')
      
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Create user profile
  async createUserProfile(userId, userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            user_id: userId,
            email: userData.email,
            preferred_language: userData.preferredLanguage || 'English',
            current_state: userData.currentState || 'California',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      toast.success('Password reset email sent!')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      toast.success('Password updated successfully!')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default new AuthService()
