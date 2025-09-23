// Firebase Firestore service for data persistence
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore'
import { db } from '../config/firebase'

class FirestoreService {
  constructor() {
    this.collections = {
      families: 'families',
      members: 'familyMembers',
      chores: 'choreAssignments',
      events: 'calendarEvents',
      history: 'choreHistory'
    }
  }

  // Family Management
  async createFamily(familyData) {
    try {
      const familyRef = await addDoc(collection(db, this.collections.families), {
        ...familyData,
        createdAt: new Date(),
        lastUpdated: new Date()
      })
      console.log('🏠 Family created:', familyRef.id)
      return familyRef.id
    } catch (error) {
      console.error('Error creating family:', error)
      throw error
    }
  }

  async getFamily(familyId) {
    try {
      const familyDoc = await getDoc(doc(db, this.collections.families, familyId))
      if (familyDoc.exists()) {
        return { id: familyDoc.id, ...familyDoc.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting family:', error)
      throw error
    }
  }

  // Family Members Management
  async addFamilyMember(familyId, memberData) {
    try {
      const memberRef = await addDoc(collection(db, this.collections.members), {
        ...memberData,
        familyId,
        createdAt: new Date(),
        lastUpdated: new Date()
      })
      console.log('👤 Family member added:', memberRef.id)
      return memberRef.id
    } catch (error) {
      console.error('Error adding family member:', error)
      throw error
    }
  }

  async getFamilyMembers(familyId) {
    try {
      const q = query(
        collection(db, this.collections.members),
        where('familyId', '==', familyId),
        orderBy('createdAt')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting family members:', error)
      throw error
    }
  }

  async updateFamilyMember(memberId, updates) {
    try {
      await updateDoc(doc(db, this.collections.members, memberId), {
        ...updates,
        lastUpdated: new Date()
      })
      console.log('👤 Family member updated:', memberId)
    } catch (error) {
      console.error('Error updating family member:', error)
      throw error
    }
  }

  async deleteFamilyMember(memberId) {
    try {
      await deleteDoc(doc(db, this.collections.members, memberId))
      console.log('👤 Family member deleted:', memberId)
    } catch (error) {
      console.error('Error deleting family member:', error)
      throw error
    }
  }

  // Chore Assignments Management
  async saveChoreAssignments(familyId, assignments) {
    try {
      const batch = []
      
      for (const assignment of assignments) {
        const choreRef = await addDoc(collection(db, this.collections.chores), {
          ...assignment,
          familyId,
          createdAt: new Date(),
          lastUpdated: new Date()
        })
        batch.push(choreRef.id)
      }
      
      console.log('📋 Chore assignments saved:', batch.length)
      return batch
    } catch (error) {
      console.error('Error saving chore assignments:', error)
      throw error
    }
  }

  async getChoreAssignments(familyId, date = null) {
    try {
      let q = query(
        collection(db, this.collections.chores),
        where('familyId', '==', familyId)
      )

      if (date) {
        q = query(q, where('date', '==', date))
      }

      q = query(q, orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting chore assignments:', error)
      throw error
    }
  }

  async updateChoreStatus(choreId, status) {
    try {
      await updateDoc(doc(db, this.collections.chores, choreId), {
        status,
        completedAt: status === 'completed' ? new Date() : null,
        lastUpdated: new Date()
      })
      console.log('📝 Chore status updated:', choreId, status)
    } catch (error) {
      console.error('Error updating chore status:', error)
      throw error
    }
  }

  async deleteChore(choreId) {
    try {
      await deleteDoc(doc(db, this.collections.chores, choreId))
      console.log('🗑️ Chore deleted:', choreId)
    } catch (error) {
      console.error('Error deleting chore:', error)
      throw error
    }
  }

  // Calendar Events Management
  async saveCalendarEvent(familyId, eventData) {
    try {
      const eventRef = await addDoc(collection(db, this.collections.events), {
        ...eventData,
        familyId,
        createdAt: new Date(),
        lastUpdated: new Date()
      })
      console.log('📅 Calendar event saved:', eventRef.id)
      return eventRef.id
    } catch (error) {
      console.error('Error saving calendar event:', error)
      throw error
    }
  }

  async getCalendarEvents(familyId, startDate, endDate) {
    try {
      let q = query(
        collection(db, this.collections.events),
        where('familyId', '==', familyId)
      )

      if (startDate && endDate) {
        q = query(
          q,
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        )
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting calendar events:', error)
      throw error
    }
  }

  // Real-time subscriptions
  subscribeToChoreAssignments(familyId, callback) {
    const q = query(
      collection(db, this.collections.chores),
      where('familyId', '==', familyId),
      orderBy('lastUpdated', 'desc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const assignments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(assignments)
    })
  }

  subscribeToFamilyMembers(familyId, callback) {
    const q = query(
      collection(db, this.collections.members),
      where('familyId', '==', familyId),
      orderBy('createdAt')
    )

    return onSnapshot(q, (querySnapshot) => {
      const members = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(members)
    })
  }

  // Analytics and History
  async saveChoreHistory(choreData) {
    try {
      await addDoc(collection(db, this.collections.history), {
        ...choreData,
        completedAt: new Date()
      })
      console.log('📊 Chore history saved')
    } catch (error) {
      console.error('Error saving chore history:', error)
      throw error
    }
  }

  async getChoreStats(familyId, timeRange = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (timeRange * 24 * 60 * 60 * 1000))

      const q = query(
        collection(db, this.collections.history),
        where('familyId', '==', familyId),
        where('completedAt', '>=', startDate),
        where('completedAt', '<=', endDate)
      )

      const querySnapshot = await getDocs(q)
      const completedChores = querySnapshot.docs.map(doc => doc.data())

      // Calculate statistics
      const stats = {
        totalCompleted: completedChores.length,
        memberStats: {},
        categoryStats: {},
        dailyAverage: completedChores.length / timeRange
      }

      // Process member and category statistics
      completedChores.forEach(chore => {
        const member = chore.assignedTo?.memberName || 'Unknown'
        const category = chore.category || 'Other'

        stats.memberStats[member] = (stats.memberStats[member] || 0) + 1
        stats.categoryStats[category] = (stats.categoryStats[category] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error getting chore stats:', error)
      throw error
    }
  }
}

export const firestoreService = new FirestoreService()
