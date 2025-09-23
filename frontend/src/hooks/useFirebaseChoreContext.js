// Firebase-integrated ChoreContext hook
import { useContext, useEffect, useState } from 'react'
import firebaseService from '../services/firebase'

export const useFirebaseChoreContext = () => {
  const [state, setState] = useState({
    familyMembers: [],
    choreAssignments: [],
    aiSuggestions: null,
    isLoading: true,
    isConnected: false,
    error: null
  })

  const [unsubscribers, setUnsubscribers] = useState([])

  useEffect(() => {
    initializeFirebaseConnection()
    
    return () => {
      // Cleanup listeners
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [])

  const initializeFirebaseConnection = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      // Wait for Firebase authentication
      let attempts = 0
      while (!firebaseService.isConnected() && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
      }

      if (firebaseService.isConnected()) {
        console.log('Firebase接続成功 - ファミリーID:', firebaseService.getFamilyId())
        
        // Setup real-time listeners
        setupRealtimeListeners()
        
        // Migrate local data if exists
        await firebaseService.migrateLocalDataToFirebase()
        
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isLoading: false,
          error: null 
        }))
      } else {
        throw new Error('Firebase接続タイムアウト')
      }
    } catch (error) {
      console.error('Firebase初期化エラー:', error)
      await loadFallbackData()
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false,
        error: 'Firebase接続に失敗しました。ローカルモードで動作します。'
      }))
    }
  }

  const setupRealtimeListeners = () => {
    // Family members listener
    const membersUnsubscriber = firebaseService.subscribeToFamilyMembers((members) => {
      setState(prev => ({ ...prev, familyMembers: members }))
    })

    // Chore assignments listener
    const assignmentsUnsubscriber = firebaseService.subscribeToChoreAssignments((assignments) => {
      setState(prev => ({ ...prev, choreAssignments: assignments }))
    })

    setUnsubscribers([membersUnsubscriber, assignmentsUnsubscriber])
  }

  const loadFallbackData = async () => {
    const familyMembers = firebaseService.getFallbackData('familyMembers')
    const choreAssignments = firebaseService.getFallbackData('choreAssignments')
    const aiSuggestions = firebaseService.getFallbackData('aiSuggestions')
    
    setState(prev => ({
      ...prev,
      familyMembers,
      choreAssignments,
      aiSuggestions
    }))
  }

  // Actions
  const addFamilyMember = async (memberData) => {
    try {
      if (state.isConnected) {
        const memberId = await firebaseService.saveFamilyMember(memberData)
        if (memberId) {
          // Real-time listener will update state automatically
          return memberId
        }
      }
      
      // Fallback to local storage
      const newMember = { ...memberData, id: Date.now().toString() }
      setState(prev => ({
        ...prev,
        familyMembers: [...prev.familyMembers, newMember]
      }))
      firebaseService.saveFallbackData('familyMembers', [...state.familyMembers, newMember])
      return newMember.id
    } catch (error) {
      console.error('家族メンバー追加エラー:', error)
      return null
    }
  }

  const updateFamilyMember = async (memberId, updates) => {
    try {
      if (state.isConnected) {
        const success = await firebaseService.updateFamilyMember(memberId, updates)
        if (success) {
          // Real-time listener will update state automatically
          return true
        }
      }
      
      // Fallback to local storage
      const updatedMembers = state.familyMembers.map(member =>
        member.id === memberId ? { ...member, ...updates } : member
      )
      setState(prev => ({ ...prev, familyMembers: updatedMembers }))
      firebaseService.saveFallbackData('familyMembers', updatedMembers)
      return true
    } catch (error) {
      console.error('家族メンバー更新エラー:', error)
      return false
    }
  }

  const removeFamilyMember = async (memberId) => {
    try {
      if (state.isConnected) {
        const success = await firebaseService.deleteFamilyMember(memberId)
        if (success) {
          // Real-time listener will update state automatically
          return true
        }
      }
      
      // Fallback to local storage
      const filteredMembers = state.familyMembers.filter(member => member.id !== memberId)
      setState(prev => ({ ...prev, familyMembers: filteredMembers }))
      firebaseService.saveFallbackData('familyMembers', filteredMembers)
      return true
    } catch (error) {
      console.error('家族メンバー削除エラー:', error)
      return false
    }
  }

  const updateChoreStatus = async (choreId, status, memberId = null) => {
    try {
      if (state.isConnected) {
        const success = await firebaseService.updateChoreStatus(choreId, status, memberId)
        if (success) {
          // Real-time listener will update state automatically
          return true
        }
      }
      
      // Fallback to local storage
      const updatedAssignments = state.choreAssignments.map(chore =>
        chore.id === choreId 
          ? { 
              ...chore, 
              status, 
              completedAt: status === 'completed' ? new Date().toISOString() : null,
              completedBy: status === 'completed' ? memberId : null
            }
          : chore
      )
      setState(prev => ({ ...prev, choreAssignments: updatedAssignments }))
      firebaseService.saveFallbackData('choreAssignments', updatedAssignments)
      return true
    } catch (error) {
      console.error('家事ステータス更新エラー:', error)
      return false
    }
  }

  const saveAIAssignments = async (assignments) => {
    try {
      if (state.isConnected) {
        const success = await firebaseService.saveChoreAssignments(assignments)
        if (success) {
          // Real-time listener will update state automatically
          return true
        }
      }
      
      // Fallback to local storage
      setState(prev => ({ ...prev, choreAssignments: assignments }))
      firebaseService.saveFallbackData('choreAssignments', assignments)
      return true
    } catch (error) {
      console.error('AI分担保存エラー:', error)
      return false
    }
  }

  const saveAISuggestions = async (suggestions) => {
    try {
      if (state.isConnected) {
        await firebaseService.saveAISuggestions(suggestions)
      }
      
      setState(prev => ({ ...prev, aiSuggestions: suggestions }))
      firebaseService.saveFallbackData('aiSuggestions', suggestions)
      return true
    } catch (error) {
      console.error('AI提案保存エラー:', error)
      return false
    }
  }

  const getConnectionStatus = () => ({
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    familyId: firebaseService.getFamilyId()
  })

  return {
    // State
    familyMembers: state.familyMembers,
    choreAssignments: state.choreAssignments,
    aiSuggestions: state.aiSuggestions,
    isLoading: state.isLoading,
    
    // Actions
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    updateChoreStatus,
    saveAIAssignments,
    saveAISuggestions,
    
    // Connection info
    getConnectionStatus
  }
}

export default useFirebaseChoreContext
