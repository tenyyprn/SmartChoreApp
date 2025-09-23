// Mock Firebase service for local development
class MockFirebaseService {
  constructor() {
    this.data = JSON.parse(localStorage.getItem('mock_firestore') || '{}')
    console.log('🔧 Using Mock Firebase Service (Local Storage)')
  }

  // Mock Firestore operations
  async addDocument(collection, data) {
    if (!this.data[collection]) this.data[collection] = []
    const doc = { id: Date.now().toString(), ...data, createdAt: new Date() }
    this.data[collection].push(doc)
    this.saveToStorage()
    return doc.id
  }

  async getDocuments(collection) {
    return this.data[collection] || []
  }

  async updateDocument(collection, id, updates) {
    const docs = this.data[collection] || []
    const index = docs.findIndex(doc => doc.id === id)
    if (index !== -1) {
      docs[index] = { ...docs[index], ...updates, lastUpdated: new Date() }
      this.saveToStorage()
    }
  }

  async deleteDocument(collection, id) {
    const docs = this.data[collection] || []
    this.data[collection] = docs.filter(doc => doc.id !== id)
    this.saveToStorage()
  }

  saveToStorage() {
    localStorage.setItem('mock_firestore', JSON.stringify(this.data))
  }

  // Mock real-time subscriptions
  onSnapshot(collection, callback) {
    // Simulate real-time updates
    const interval = setInterval(() => {
      callback(this.data[collection] || [])
    }, 1000)
    
    return () => clearInterval(interval)
  }
}

// Mock Vertex AI service
class MockVertexAIService {
  async generateChoreAssignment(familyMembers, existingChores, calendarEvents) {
    console.log('🤖 Using Mock Vertex AI Service')
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const assignments = this.generateMockAssignments(familyMembers)
    return {
      assignments,
      fairnessScore: 0.85,
      recommendations: [
        '料理スキルの高いメンバーに食事タスクを集中',
        '掃除タスクを平均的に分散',
        '時間的制約を考慮した最適化'
      ],
      totalWorkload: familyMembers.reduce((acc, member) => {
        acc[member.name] = Math.floor(Math.random() * 60) + 30
        return acc
      }, {})
    }
  }

  generateMockAssignments(familyMembers) {
    const tasks = [
      { name: '朝食の準備', category: '料理', estimatedTime: 30, difficulty: 4, timeSlot: 'morning', icon: '🍳' },
      { name: '昼食の準備', category: '料理', estimatedTime: 40, difficulty: 5, timeSlot: 'afternoon', icon: '🍜' },
      { name: '夕食の準備', category: '料理', estimatedTime: 60, difficulty: 7, timeSlot: 'evening', icon: '🍽️' },
      { name: '食器洗い', category: 'キッチン', estimatedTime: 15, difficulty: 3, timeSlot: 'evening', icon: '🍽️' },
      { name: '洗濯', category: '洗濯', estimatedTime: 20, difficulty: 4, timeSlot: 'morning', icon: '👕' },
      { name: '掃除機かけ', category: '掃除', estimatedTime: 25, difficulty: 5, timeSlot: 'afternoon', icon: '🧹' },
      { name: 'ゴミ出し', category: 'ゴミ', estimatedTime: 10, difficulty: 2, timeSlot: 'morning', icon: '🗑️' }
    ]

    return [{
      category: 'AI生成タスク',
      assignments: tasks.map((task, index) => {
        const member = familyMembers[index % familyMembers.length]
        return {
          choreId: `task_${index}`,
          choreName: task.name,
          choreIcon: task.icon,
          choreDifficulty: task.difficulty,
          recommendedAssignee: {
            memberId: member.id,
            memberName: member.name,
            memberAvatar: member.avatar,
            estimatedTime: task.estimatedTime,
            score: Math.random() * 0.3 + 0.7 // 0.7-1.0のスコア
          }
        }
      })
    }]
  }
}

// Mock Google Calendar service
class MockCalendarService {
  async createChoreEvent(choreData) {
    console.log('📅 Using Mock Calendar Service')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      calendarEventId: `mock_event_${Date.now()}`,
      htmlLink: `https://calendar.google.com/calendar/event?eid=mock_${Date.now()}`,
      success: true
    }
  }

  async updateChoreEvent(eventId, choreData) {
    return { success: true }
  }

  async deleteChoreEvent(eventId) {
    return { success: true }
  }

  async bulkCreateChoreEvents(choreAssignments) {
    return choreAssignments.map(chore => ({
      choreId: chore.id,
      calendarResult: { success: true, calendarEventId: `mock_${chore.id}` }
    }))
  }

  isSignedIn() {
    return true // Always "signed in" for demo
  }
}

// Export mock services
export const mockFirestore = new MockFirebaseService()
export const mockVertexAI = new MockVertexAIService()
export const mockCalendar = new MockCalendarService()
