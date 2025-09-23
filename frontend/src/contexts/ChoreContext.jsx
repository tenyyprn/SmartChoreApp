// Enhanced ChoreContext with Vertex AI integration
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import VertexAIChoreAssignment from '../services/vertexAI'
import { CHORE_CATEGORIES } from '../services/choreDatabase'

const ChoreContext = createContext()

const ACTION_TYPES = {
  SET_FAMILY_MEMBERS: 'SET_FAMILY_MEMBERS',
  ADD_FAMILY_MEMBER: 'ADD_FAMILY_MEMBER',
  UPDATE_FAMILY_MEMBER: 'UPDATE_FAMILY_MEMBER',
  REMOVE_FAMILY_MEMBER: 'REMOVE_FAMILY_MEMBER',
  SET_CHORE_ASSIGNMENTS: 'SET_CHORE_ASSIGNMENTS',
  UPDATE_CHORE_STATUS: 'UPDATE_CHORE_STATUS',
  SET_AI_SUGGESTIONS: 'SET_AI_SUGGESTIONS',
  DELETE_TASK: 'DELETE_TASK',
  LOAD_DATA: 'LOAD_DATA',
  SAVE_DATA: 'SAVE_DATA'
}

const initialState = {
  familyMembers: [],
  choreAssignments: [],
  aiSuggestions: null,
  calendarEvents: [],
  assignmentStatus: 'draft', // 'draft' | 'confirmed'
  confirmedAssignments: [],
  isLoading: false,
  error: null,
  lastUpdated: null
}

const choreReducer = (state, action) => {
  try {
    switch (action.type) {
      case ACTION_TYPES.SET_FAMILY_MEMBERS:
        return {
          ...state,
          familyMembers: Array.isArray(action.payload) ? action.payload : [],
          lastUpdated: new Date().toISOString()
        }
      
      case ACTION_TYPES.ADD_FAMILY_MEMBER:
        if (!action.payload || !action.payload.name) return state
        return {
          ...state,
          familyMembers: [...state.familyMembers, action.payload],
          lastUpdated: new Date().toISOString()
        }
      
      case ACTION_TYPES.UPDATE_FAMILY_MEMBER:
        if (!action.payload || !action.payload.id) return state
        return {
          ...state,
          familyMembers: state.familyMembers.map(member =>
            member.id === action.payload.id 
              ? { ...member, ...action.payload.updates } 
              : member
          ),
          lastUpdated: new Date().toISOString()
        }
      
      case ACTION_TYPES.REMOVE_FAMILY_MEMBER:
        if (!action.payload) return state
        return {
          ...state,
          familyMembers: state.familyMembers.filter(member => member.id !== action.payload),
          lastUpdated: new Date().toISOString()
        }
      
      case ACTION_TYPES.SET_CHORE_ASSIGNMENTS:
        return {
          ...state,
          choreAssignments: Array.isArray(action.payload) ? action.payload : [],
          lastUpdated: new Date().toISOString()
        }
      
      case ACTION_TYPES.UPDATE_CHORE_STATUS:
        if (!action.payload || !action.payload.choreId) return state
        return {
          ...state,
          choreAssignments: state.choreAssignments.map(chore =>
            chore.id === action.payload.choreId 
              ? { 
                  ...chore, 
                  status: action.payload.status,
                  completedAt: action.payload.status === 'completed' ? new Date().toISOString() : null,
                  completedBy: action.payload.status === 'completed' ? action.payload.memberId : null
                }
              : chore
          ),
          lastUpdated: new Date().toISOString()
        }
      
      case ACTION_TYPES.DELETE_TASK:
        if (!action.payload) return state
        return {
          ...state,
          choreAssignments: state.choreAssignments.filter(task => task.id !== action.payload),
          lastUpdated: new Date().toISOString()
        }
      
      case ACTION_TYPES.SET_AI_SUGGESTIONS:
        return {
          ...state,
          aiSuggestions: action.payload,
          lastUpdated: new Date().toISOString()
        }
      
      case ACTION_TYPES.LOAD_DATA:
        return {
          ...state,
          ...action.payload,
          isLoading: false
        }
      
      default:
        return state
    }
  } catch (error) {
    console.error('Reducer error:', error)
    return { ...state, error: error.message }
  }
}

// Safe localStorage operations
const safeLocalStorage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('localStorage getItem error:', error)
      return null
    }
  },
  
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('localStorage setItem error:', error)
      return false
    }
  }
}

export const ChoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(choreReducer, initialState)
  const [aiEngine] = useState(() => new VertexAIChoreAssignment())

  // Initialize Vertex AI assignment system
  // const aiAssignmentSystem = new VertexAIChoreAssignment() // Now using state variable

  // Safe data loading
  useEffect(() => {
    try {
      const savedFamilyMembers = safeLocalStorage.getItem('smartChore_familyMembers') || []
      const savedChoreAssignments = safeLocalStorage.getItem('smartChore_choreAssignments') || []
      const savedAiSuggestions = safeLocalStorage.getItem('smartChore_aiSuggestions')

      dispatch({
        type: ACTION_TYPES.LOAD_DATA,
        payload: {
          familyMembers: savedFamilyMembers,
          choreAssignments: savedChoreAssignments,
          aiSuggestions: savedAiSuggestions
        }
      })
    } catch (error) {
      console.error('Data loading error:', error)
    }
  }, [])

  // Safe data saving
  useEffect(() => {
    try {
      if (state.lastUpdated) {
        safeLocalStorage.setItem('smartChore_familyMembers', state.familyMembers)
        safeLocalStorage.setItem('smartChore_choreAssignments', state.choreAssignments)
        if (state.aiSuggestions) {
          safeLocalStorage.setItem('smartChore_aiSuggestions', state.aiSuggestions)
        }
      }
    } catch (error) {
      console.error('Data saving error:', error)
    }
  }, [state.familyMembers, state.choreAssignments, state.aiSuggestions, state.lastUpdated])

  // Generate today's chores from CHORE_CATEGORIES
  const generateTodaysChores = () => {
    try {
      const today = new Date()
      const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const dayOfMonth = today.getDate()
      const currentHour = today.getHours()
      
      const todaysChores = []
      
      // より多くの家事を生成するため、フィルタリングを緩和
      CHORE_CATEGORIES.forEach(category => {
        category.chores.forEach(chore => {
          let shouldAdd = false
          
          // 毎日の家事 - 時間帯制限を緩和
          if (category.frequency === 'daily') {
            shouldAdd = true // 時間帯に関係なく追加
          }
          
          // 週単位の家事 - より頻繁に追加
          if (category.frequency === 'weekly') {
            // 毎日何かしらの週単位家事を追加
            shouldAdd = Math.random() > 0.3 // 70%の確率で追加
          }
          
          // 月単位の家事 - 月の最初の2週間に追加
          if (category.frequency === 'monthly') {
            if (dayOfMonth <= 14) { // 月前半
              shouldAdd = Math.random() > 0.7 // 30%の確率で追加
            }
          }
          
          if (shouldAdd) {
            todaysChores.push({
              id: `${chore.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              choreId: chore.id,
              name: chore.name,
              icon: chore.icon,
              estimatedTime: chore.time,
              difficulty: chore.difficulty,
              category: category.name,
              timeSlot: chore.timeSlot || 'anytime',
              skill: chore.skill,
              description: chore.description,
              tips: chore.tips,
              status: 'pending',
              date: today.toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              generatedFromSchedule: true
            })
          }
        })
      })
      
      // 最低限の家事を保証
      if (todaysChores.length < 3) {
        const essentialChores = [
          {
            id: `essential_1_${Date.now()}`,
            choreId: 'essential_cooking',
            name: '食事の準備',
            icon: '🍳',
            estimatedTime: 45,
            difficulty: 3,
            category: '料理',
            timeSlot: 'morning',
            skill: 'cooking',
            description: '朝食または昼食の準備',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          },
          {
            id: `essential_2_${Date.now()}`,
            choreId: 'essential_cleaning',
            name: '部屋の片付け',
            icon: '🧹',
            estimatedTime: 30,
            difficulty: 2,
            category: '掃除',
            timeSlot: 'anytime',
            skill: 'cleaning',
            description: 'リビングや寝室の整理整頓',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          },
          {
            id: `essential_3_${Date.now()}`,
            choreId: 'essential_dishes',
            name: '食器洗い',
            icon: '🍽️',
            estimatedTime: 20,
            difficulty: 1,
            category: '掃除',
            timeSlot: 'evening',
            skill: 'cleaning',
            description: '食後の食器洗いと片付け',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          },
          {
            id: `essential_4_${Date.now()}`,
            choreId: 'essential_laundry',
            name: '洗濯',
            icon: '👕',
            estimatedTime: 15,
            difficulty: 2,
            category: '洗濯',
            timeSlot: 'morning',
            skill: 'laundry',
            description: '洗濯機を回す（乾燥まで）',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          },
          {
            id: `essential_5_${Date.now()}`,
            choreId: 'essential_grocery',
            name: '買い物',
            icon: '🛒',
            estimatedTime: 60,
            difficulty: 2,
            category: '買い物',
            timeSlot: 'afternoon',
            skill: 'shopping',
            description: '食材や日用品の買い物',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          }
        ]
        
        // 不足分を補填
        const needed = Math.max(0, 5 - todaysChores.length)
        todaysChores.push(...essentialChores.slice(0, needed))
      }
      
      console.log('✅ 今日の家事を生成:', todaysChores.length, '件')
      console.log('📋 生成された家事:', todaysChores.map(c => c.name).join(', '))
      return todaysChores
      
    } catch (error) {
      console.error('Error generating today\'s chores:', error)
      
      // エラー時のフォールバック：最低限の家事を生成
      return [
        {
          id: `fallback_1_${Date.now()}`,
          choreId: 'fallback_cooking',
          name: '食事の準備',
          icon: '🍳',
          estimatedTime: 30,
          difficulty: 3,
          category: '料理',
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          generatedFromSchedule: true
        },
        {
          id: `fallback_2_${Date.now()}`,
          choreId: 'fallback_cleaning',
          name: '掃除',
          icon: '🧹',
          estimatedTime: 25,
          difficulty: 2,
          category: '掃除',
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          generatedFromSchedule: true
        }
      ]
    }
  }

  // Action creators
  const addFamilyMember = async (memberData) => {
    try {
      const newMember = {
        id: Date.now().toString(),
        name: memberData.name,
        avatar: memberData.avatar || '👤',
        age: memberData.age,
        skills: memberData.skills || {
          cooking: 5,
          cleaning: 5,
          laundry: 5,
          shopping: 5,
          childcare: 5,
          maintenance: 5
        },
        availableTime: memberData.availableTime || {
          weekday: {
            morning: true,
            afternoon: false,
            evening: true,
            night: false
          },
          weekend: {
            morning: true,
            afternoon: true,
            evening: true,
            night: false
          }
        },
        preferences: memberData.preferences || {
          preferred: [],
          disliked: [],
          maxChoresPerWeek: 7
        },
        createdAt: new Date().toISOString()
      }
      dispatch({
        type: ACTION_TYPES.ADD_FAMILY_MEMBER,
        payload: newMember
      })
      return newMember.id
    } catch (error) {
      console.error('Add family member error:', error)
      return null
    }
  }

  const updateFamilyMember = async (memberId, updates) => {
    try {
      dispatch({
        type: ACTION_TYPES.UPDATE_FAMILY_MEMBER,
        payload: { id: memberId, updates }
      })
      return true
    } catch (error) {
      console.error('Update family member error:', error)
      return false
    }
  }

  const removeFamilyMember = async (memberId) => {
    try {
      dispatch({
        type: ACTION_TYPES.REMOVE_FAMILY_MEMBER,
        payload: memberId
      })
      return true
    } catch (error) {
      console.error('Remove family member error:', error)
      return false
    }
  }

  const updateChoreStatus = async (choreId, status, memberId = null) => {
    try {
      dispatch({
        type: ACTION_TYPES.UPDATE_CHORE_STATUS,
        payload: { choreId, status, memberId }
      })
      return true
    } catch (error) {
      console.error('Update chore status error:', error)
      return false
    }
  }

  const deleteTask = async (taskId) => {
    try {
      dispatch({
        type: ACTION_TYPES.DELETE_TASK,
        payload: taskId
      })
      return true
    } catch (error) {
      console.error('Delete task error:', error)
      return false
    }
  }

  const calculateAIAssignment = async () => {
    try {
      console.log('🤖 Vertex AI分担計算を開始: 家族メンバー数', state.familyMembers.length)
      
      if (state.familyMembers.length === 0) {
        console.warn('No family members for AI assignment')
        return null
      }

      // Generate today's chores
      const todaysChores = generateTodaysChores()
      
      // Use the Vertex AI system for assignment calculation
      const aiResult = await aiEngine.calculateOptimalAssignment(
        state.familyMembers, 
        todaysChores
      )
      
      console.log('✅ Vertex AI分担計算完了:', aiResult)
      
      // Convert AI result to choreAssignments format
      const assignments = []
      
      aiResult.assignments.forEach(categoryData => {
        categoryData.assignments.forEach(assignment => {
          const choreData = todaysChores.find(c => c.choreId === assignment.choreId) || {}
          
          assignments.push({
            id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            choreId: assignment.choreId,
            name: assignment.choreName || choreData.name,
            icon: assignment.choreIcon || choreData.icon || '📋',
            estimatedTime: assignment.recommendedAssignee?.estimatedTime || choreData.estimatedTime || 30,
            difficulty: assignment.choreDifficulty || choreData.difficulty || 5,
            category: categoryData.category,
            description: choreData.description || '',
            tips: choreData.tips || '',
            assignedTo: {
              memberId: assignment.recommendedAssignee.memberId,
              memberName: assignment.recommendedAssignee.memberName,
              memberAvatar: assignment.recommendedAssignee.memberAvatar
            },
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true,
            aiScore: assignment.recommendedAssignee.score
          })
        })
      })
      
      // Update state with assignments and AI suggestions
      dispatch({
        type: ACTION_TYPES.SET_CHORE_ASSIGNMENTS,
        payload: assignments
      })
      
      dispatch({
        type: ACTION_TYPES.SET_AI_SUGGESTIONS,
        payload: aiResult
      })
      
      console.log('📋 今日の家事を生成:', assignments.length, '件')
      
      return aiResult
      
    } catch (error) {
      console.error('AI assignment calculation error:', error)
      return null
    }
  }

  const getStats = () => {
    try {
      const total = state.choreAssignments.length
      const completed = state.choreAssignments.filter(chore => chore.status === 'completed').length
      const pending = total - completed
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

      return { total, completed, pending, completionRate }
    } catch (error) {
      console.error('Get stats error:', error)
      return { total: 0, completed: 0, pending: 0, completionRate: 0 }
    }
  }

  const addManualTask = async (taskData) => {
    try {
      const newTask = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...taskData,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        manuallyAdded: true
      }
      
      const updatedAssignments = [...state.choreAssignments, newTask]
      dispatch({
        type: ACTION_TYPES.SET_CHORE_ASSIGNMENTS,
        payload: updatedAssignments
      })
      
      return newTask.id
    } catch (error) {
      console.error('Add manual task error:', error)
      return null
    }
  }

  const contextValue = {
    // State
    familyMembers: state.familyMembers,
    choreAssignments: state.choreAssignments,
    aiSuggestions: state.aiSuggestions,
    calendarEvents: state.calendarEvents,
    assignmentStatus: state.assignmentStatus,
    confirmedAssignments: state.confirmedAssignments,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    updateChoreStatus,
    calculateAIAssignment,
    getStats,
    deleteTask,
    addManualTask
  }

  try {
    return (
      <ChoreContext.Provider value={contextValue}>
        {children}
      </ChoreContext.Provider>
    )
  } catch (error) {
    console.error('ChoreProvider render error:', error)
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          データシステムエラー
        </h2>
        <p className="text-gray-600 mb-8">
          アプリデータの初期化に失敗しました
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          再読み込み
        </button>
      </div>
    )
  }
}

export const useChore = () => {
  try {
    const context = useContext(ChoreContext)
    if (!context) {
      console.warn('useChore must be used within a ChoreProvider')
      return {
        familyMembers: [],
        choreAssignments: [],
        aiSuggestions: null,
        isLoading: false,
        error: null,
        addFamilyMember: async () => null,
        updateFamilyMember: async () => false,
        removeFamilyMember: async () => false,
        updateChoreStatus: async () => false,
        calculateAIAssignment: async () => null,
        getStats: () => ({ total: 0, completed: 0, pending: 0, completionRate: 0 }),
        deleteTask: async () => false,
        addManualTask: async () => null
      }
    }
    return context
  } catch (error) {
    console.error('useChore hook error:', error)
    return {
      familyMembers: [],
      choreAssignments: [],
      aiSuggestions: null,
      isLoading: false,
      error: error.message,
      addFamilyMember: async () => null,
      updateFamilyMember: async () => false,
      removeFamilyMember: async () => false,
      updateChoreStatus: async () => false,
      calculateAIAssignment: async () => null,
      getStats: () => ({ total: 0, completed: 0, pending: 0, completionRate: 0 }),
      deleteTask: async () => false,
      addManualTask: async () => null
    }
  }
}
