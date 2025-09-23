// Google Calendar API service for calendar integration
class GoogleCalendarService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
    this.discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
    this.scopes = 'https://www.googleapis.com/auth/calendar.events'
    this.gapi = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return true

    try {
      // Load Google API library
      await this.loadGoogleAPI()
      
      // Initialize the API
      await this.gapi.load('client:auth2', async () => {
        await this.gapi.client.init({
          apiKey: this.apiKey,
          discoveryDocs: [this.discoveryDoc],
        })
      })

      this.initialized = true
      console.log('📅 Google Calendar API initialized')
      return true
    } catch (error) {
      console.error('Failed to initialize Google Calendar API:', error)
      return false
    }
  }

  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapi = window.gapi
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        this.gapi = window.gapi
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  async signIn() {
    try {
      if (!this.initialized) {
        await this.initialize()
      }

      const authInstance = this.gapi.auth2.getAuthInstance()
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn()
      }
      
      console.log('📅 Signed in to Google Calendar')
      return true
    } catch (error) {
      console.error('Failed to sign in to Google Calendar:', error)
      return false
    }
  }

  async createChoreEvent(choreData) {
    try {
      if (!await this.signIn()) {
        throw new Error('Failed to authenticate with Google Calendar')
      }

      const event = {
        summary: `🏠 ${choreData.name}`,
        description: this.formatChoreDescription(choreData),
        start: {
          dateTime: this.calculateEventTime(choreData),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: this.calculateEventEndTime(choreData),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: choreData.assignedTo ? [{
          email: choreData.assignedTo.email,
          displayName: choreData.assignedTo.memberName
        }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 60 }
          ]
        },
        colorId: this.getChoreColorId(choreData.category),
        extendedProperties: {
          private: {
            choreId: choreData.id,
            choreApp: 'SmartChoreApp',
            difficulty: choreData.difficulty?.toString(),
            estimatedTime: choreData.estimatedTime?.toString()
          }
        }
      }

      const response = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      })

      console.log('📅 Chore event created:', response.result.id)
      return {
        calendarEventId: response.result.id,
        htmlLink: response.result.htmlLink,
        success: true
      }
    } catch (error) {
      console.error('Failed to create calendar event:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  formatChoreDescription(choreData) {
    return `
🏠 家事: ${choreData.name}
👤 担当者: ${choreData.assignedTo?.memberName || '未指定'}
⏱️ 推定時間: ${choreData.estimatedTime || 30}分
🎯 難易度: ${choreData.difficulty || 5}/10
📂 カテゴリ: ${choreData.category || 'その他'}

${choreData.mealTask ? '🍴 毎日の食事タスクです' : ''}
${choreData.manuallyAdded ? '➕ 手動で追加されたタスクです' : ''}

Smart Chore App で管理されています
`.trim()
  }

  calculateEventTime(choreData) {
    const now = new Date()
    const eventDate = choreData.date ? new Date(choreData.date) : now
    
    // Set time based on timeSlot
    switch (choreData.timeSlot) {
      case 'morning':
        eventDate.setHours(8, 0, 0, 0)
        break
      case 'afternoon':
        eventDate.setHours(13, 0, 0, 0)
        break
      case 'evening':
        eventDate.setHours(18, 0, 0, 0)
        break
      default:
        eventDate.setHours(10, 0, 0, 0)
    }

    return eventDate.toISOString()
  }

  calculateEventEndTime(choreData) {
    const startTime = new Date(this.calculateEventTime(choreData))
    const duration = choreData.estimatedTime || 30
    startTime.setMinutes(startTime.getMinutes() + duration)
    return startTime.toISOString()
  }

  getChoreColorId(category) {
    const colorMap = {
      '料理': '4', // Blue
      'キッチン': '4', // Blue
      '掃除': '2', // Green
      '洗濯': '6', // Orange
      'ゴミ': '8', // Gray
      '買い物': '9', // Bold Blue
      '手動追加': '10', // Bold Green
      'default': '1' // Lavender
    }
    return colorMap[category] || colorMap.default
  }

  async updateChoreEvent(calendarEventId, choreData) {
    try {
      if (!await this.signIn()) {
        throw new Error('Failed to authenticate with Google Calendar')
      }

      const updatedEvent = {
        summary: `🏠 ${choreData.name}`,
        description: this.formatChoreDescription(choreData),
        start: {
          dateTime: this.calculateEventTime(choreData),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: this.calculateEventEndTime(choreData),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }

      const response = await this.gapi.client.calendar.events.patch({
        calendarId: 'primary',
        eventId: calendarEventId,
        resource: updatedEvent
      })

      console.log('📅 Chore event updated:', response.result.id)
      return { success: true }
    } catch (error) {
      console.error('Failed to update calendar event:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteChoreEvent(calendarEventId) {
    try {
      if (!await this.signIn()) {
        throw new Error('Failed to authenticate with Google Calendar')
      }

      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: calendarEventId
      })

      console.log('📅 Chore event deleted:', calendarEventId)
      return { success: true }
    } catch (error) {
      console.error('Failed to delete calendar event:', error)
      return { success: false, error: error.message }
    }
  }

  async getCalendarEvents(startDate, endDate) {
    try {
      if (!await this.signIn()) {
        throw new Error('Failed to authenticate with Google Calendar')
      }

      const response = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
        q: 'Smart Chore App' // Filter for our app's events
      })

      return response.result.items.map(event => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        description: event.description,
        choreId: event.extendedProperties?.private?.choreId,
        difficulty: parseInt(event.extendedProperties?.private?.difficulty) || null,
        estimatedTime: parseInt(event.extendedProperties?.private?.estimatedTime) || null
      }))
    } catch (error) {
      console.error('Failed to get calendar events:', error)
      return []
    }
  }

  async bulkCreateChoreEvents(choreAssignments) {
    const results = []
    
    for (const chore of choreAssignments) {
      const result = await this.createChoreEvent(chore)
      results.push({
        choreId: chore.id,
        calendarResult: result
      })
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('📅 Bulk calendar events created:', results.length)
    return results
  }

  isSignedIn() {
    if (!this.initialized || !this.gapi?.auth2) return false
    
    const authInstance = this.gapi.auth2.getAuthInstance()
    return authInstance.isSignedIn.get()
  }

  async signOut() {
    try {
      if (this.isSignedIn()) {
        const authInstance = this.gapi.auth2.getAuthInstance()
        await authInstance.signOut()
        console.log('📅 Signed out from Google Calendar')
      }
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }
}

export const googleCalendarService = new GoogleCalendarService()
