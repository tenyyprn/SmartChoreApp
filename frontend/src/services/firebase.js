// Firebase configuration and services
import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { 
  getAuth,
  signInAnonymously,
  onAuthStateChanged 
} from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

class FirebaseService {
  constructor() {
    this.currentUser = null
    this.familyId = null
    this.initializeAuth()
  }

  async initializeAuth() {
    try {
      // Anonymous authentication for now
      await signInAnonymously(auth)
      console.log('Firebase認証成功')
      
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user
        if (user) {
          this.familyId = user.uid // Use user ID as family ID for now
        }
      })
    } catch (error) {
      console.error('Firebase認証エラー:', error)
    }
  }

  // Family Members management
  async getFamilyMembers() {
    if (!this.familyId) return []
    
    try {
      const membersRef = collection(db, 'families', this.familyId, 'members')
      const snapshot = await getDocs(membersRef)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('家族メンバー取得エラー:', error)
      return this.getFallbackData('familyMembers')
    }
  }

  async saveFamilyMember(memberData) {
    if (!this.familyId) return null

    try {
      const membersRef = collection(db, 'families', this.familyId, 'members')
      const docRef = await addDoc(membersRef, {
        ...memberData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      })
      
      console.log('家族メンバー保存成功:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('家族メンバー保存エラー:', error)
      this.saveFallbackData('familyMembers', memberData)
      return null
    }
  }

  async updateFamilyMember(memberId, updates) {
    if (!this.familyId) return false

    try {
      const memberRef = doc(db, 'families', this.familyId, 'members', memberId)
      await updateDoc(memberRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      })
      
      console.log('家族メンバー更新成功:', memberId)
      return true
    } catch (error) {
      console.error('家族メンバー更新エラー:', error)
      return false
    }
  }

  async deleteFamilyMember(memberId) {
    if (!this.familyId) return false

    try {
      const memberRef = doc(db, 'families', this.familyId, 'members', memberId)
      await deleteDoc(memberRef)
      
      console.log('家族メンバー削除成功:', memberId)
      return true
    } catch (error) {
      console.error('家族メンバー削除エラー:', error)
      return false
    }
  }

  // Chore Assignments management
  async getChoreAssignments() {
    if (!this.familyId) return []

    try {
      const assignmentsRef = collection(db, 'families', this.familyId, 'assignments')
      const q = query(assignmentsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('家事分担取得エラー:', error)
      return this.getFallbackData('choreAssignments')
    }
  }

  async saveChoreAssignments(assignments) {
    if (!this.familyId) return false

    try {
      const assignmentsRef = collection(db, 'families', this.familyId, 'assignments')
      
      // Save each assignment
      const savePromises = assignments.map(assignment => 
        addDoc(assignmentsRef, {
          ...assignment,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        })
      )
      
      await Promise.all(savePromises)
      console.log('家事分担保存成功:', assignments.length + '件')
      return true
    } catch (error) {
      console.error('家事分担保存エラー:', error)
      this.saveFallbackData('choreAssignments', assignments)
      return false
    }
  }

  async updateChoreStatus(choreId, status, memberId = null) {
    if (!this.familyId) return false

    try {
      const choreRef = doc(db, 'families', this.familyId, 'assignments', choreId)
      const updates = {
        status: status,
        lastUpdated: serverTimestamp()
      }
      
      if (status === 'completed') {
        updates.completedAt = serverTimestamp()
        updates.completedBy = memberId
      }
      
      await updateDoc(choreRef, updates)
      console.log('家事ステータス更新成功:', choreId, status)
      return true
    } catch (error) {
      console.error('家事ステータス更新エラー:', error)
      return false
    }
  }

  // AI Suggestions management
  async saveAISuggestions(suggestions) {
    if (!this.familyId) return false

    try {
      const suggestionsRef = collection(db, 'families', this.familyId, 'ai_suggestions')
      await addDoc(suggestionsRef, {
        ...suggestions,
        createdAt: serverTimestamp()
      })
      
      console.log('AI提案保存成功')
      return true
    } catch (error) {
      console.error('AI提案保存エラー:', error)
      this.saveFallbackData('aiSuggestions', suggestions)
      return false
    }
  }

  async getLatestAISuggestions() {
    if (!this.familyId) return null

    try {
      const suggestionsRef = collection(db, 'families', this.familyId, 'ai_suggestions')
      const q = query(suggestionsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const latestDoc = snapshot.docs[0]
        return { id: latestDoc.id, ...latestDoc.data() }
      }
      
      return null
    } catch (error) {
      console.error('AI提案取得エラー:', error)
      return this.getFallbackData('aiSuggestions')
    }
  }

  // Real-time listeners
  subscribeToFamilyMembers(callback) {
    if (!this.familyId) return () => {}

    try {
      const membersRef = collection(db, 'families', this.familyId, 'members')
      return onSnapshot(membersRef, (snapshot) => {
        const members = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(members)
      })
    } catch (error) {
      console.error('リアルタイム監視エラー:', error)
      return () => {}
    }
  }

  subscribeToChoreAssignments(callback) {
    if (!this.familyId) return () => {}

    try {
      const assignmentsRef = collection(db, 'families', this.familyId, 'assignments')
      const q = query(assignmentsRef, orderBy('createdAt', 'desc'))
      
      return onSnapshot(q, (snapshot) => {
        const assignments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(assignments)
      })
    } catch (error) {
      console.error('リアルタイム監視エラー:', error)
      return () => {}
    }
  }

  // Fallback to localStorage when Firebase is unavailable
  getFallbackData(key) {
    try {
      const data = localStorage.getItem(`smartChore_${key}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('ローカルストレージ取得エラー:', error)
      return []
    }
  }

  saveFallbackData(key, data) {
    try {
      localStorage.setItem(`smartChore_${key}`, JSON.stringify(data))
      console.log('ローカルストレージにフォールバック保存:', key)
    } catch (error) {
      console.error('ローカルストレージ保存エラー:', error)
    }
  }

  // Migration from localStorage to Firebase
  async migrateLocalDataToFirebase() {
    if (!this.familyId) return false

    try {
      console.log('ローカルデータをFirebaseに移行中...')
      
      // Migrate family members
      const localMembers = this.getFallbackData('familyMembers')
      if (localMembers.length > 0) {
        for (const member of localMembers) {
          await this.saveFamilyMember(member)
        }
        console.log('家族メンバー移行完了:', localMembers.length + '人')
      }
      
      // Migrate chore assignments
      const localAssignments = this.getFallbackData('choreAssignments')
      if (localAssignments.length > 0) {
        await this.saveChoreAssignments(localAssignments)
        console.log('家事分担移行完了:', localAssignments.length + '件')
      }
      
      // Migrate AI suggestions
      const localAI = this.getFallbackData('aiSuggestions')
      if (localAI) {
        await this.saveAISuggestions(localAI)
        console.log('AI提案移行完了')
      }
      
      return true
    } catch (error) {
      console.error('データ移行エラー:', error)
      return false
    }
  }

  // Connection status
  isConnected() {
    return this.currentUser !== null
  }

  getFamilyId() {
    return this.familyId
  }
}

// Create singleton instance
const firebaseService = new FirebaseService()

export default firebaseService
export { db, auth }
