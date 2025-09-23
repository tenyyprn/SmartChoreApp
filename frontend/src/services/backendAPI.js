// Backend API Service for Smart Chore App
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

class BackendAPIService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      }

      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // Family Members API
  async getFamilyMembers() {
    return this.request('/family/members')
  }

  async addFamilyMember(memberData) {
    return this.request('/family/members', {
      method: 'POST',
      body: JSON.stringify(memberData)
    })
  }

  async updateFamilyMember(memberId, updates) {
    return this.request(`/family/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteFamilyMember(memberId) {
    return this.request(`/family/members/${memberId}`, {
      method: 'DELETE'
    })
  }

  // Chore Assignments API
  async getChoreAssignments() {
    return this.request('/chores/assignments')
  }

  async calculateAIAssignment(familyMembers, preferences = {}) {
    return this.request('/chores/calculate', {
      method: 'POST',
      body: JSON.stringify({ familyMembers, preferences })
    })
  }

  async updateChoreStatus(choreId, status) {
    return this.request(`/chores/${choreId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export default BackendAPIService
