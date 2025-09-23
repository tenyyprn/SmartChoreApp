import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useChore } from '../contexts/ChoreContext'
import { 
  CheckCircle, BarChart3, Settings, RefreshCw, 
  Calendar, Brain, Heart,
  Trash2, Plus, Eye, EyeOff
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import AIAnalysisDisplay from '../components/AIAnalysisDisplay'
import DebugConsole from '../components/DebugConsole'
import TaskCompletionCelebration from '../components/TaskCompletionCelebration'

const SimpleDebugToggle = ({ debugMode, setDebugMode }) => {
  if (import.meta.env.MODE === 'production' && !debugMode) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-100 border border-red-300 rounded-lg p-2 shadow-lg">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
            debugMode 
              ? 'bg-red-200 text-red-800' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {debugMode ? (
            <>
              <EyeOff className="h-3 w-3" />
              <span className="hidden sm:inline">非表示</span>
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Debug</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

const DashboardPage = () => {
  const {
    familyMembers = [],
    choreAssignments = [],
    aiSuggestions,
    updateChoreStatus,
    getStats,
    calculateAIAssignment,
    deleteTask
  } = useChore() || {}
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [showDebugConsole, setShowDebugConsole] = useState(false)
  const [debugData, setDebugData] = useState(null)
  const [celebrationData, setCelebrationData] = useState(null)
  const [supportMessages, setSupportMessages] = useState([])
  const [showManualTaskForm, setShowManualTaskForm] = useState(false)

  const stats = getStats ? getStats() : { total: 0, completed: 0, pending: 0 }
  const today = new Date().toISOString().split('T')[0]

  const todayChores = choreAssignments.filter(chore => {
    const choreDate = chore.date || chore.createdAt?.split('T')[0]
    return choreDate === today
  })

  const choresByMember = {}
  todayChores.forEach(chore => {
    const memberId = chore.assignedTo?.memberId || 'unassigned'
    if (!choresByMember[memberId]) {
      choresByMember[memberId] = []
    }
    choresByMember[memberId].push(chore)
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleTaskComplete = async (taskId, memberName, task) => {
    try {
      await updateChoreStatus(taskId, 'completed')
      setCelebrationData({
        task,
        memberName,
        otherMembers: familyMembers.filter(m => m.name !== memberName)
      })
    } catch (error) {
      console.error('タスク完了エラー:', error)
    }
  }

  const handleSupportMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      type: 'support'
    }
    setSupportMessages(prev => [newMessage, ...prev.slice(0, 4)])
  }

  const handleAIAssignment = async () => {
    setIsRefreshing(true)
    try {
      const result = await calculateAIAssignment()
      if (result) {
        // 安全性チェックを追加
        const safeResult = {
          ...result,
          aiResponse: result.debugInfo?.enhancedAssignment?.aiResponse,
          skillMatching: [], 
          assignments: Array.isArray(result.assignments) ? result.assignments : [],
          workloadAnalysis: result.workloadAnalysis || {},
          overallFairnessScore: result.overallFairnessScore || 0,
          metrics: result.debugInfo?.fairnessAnalysis?.metrics || {}
        }
        
        setDebugData(safeResult)
        
        // デバッグログ
        if (debugMode) {
          console.log('🎉 AI分担結果:', safeResult)
        }
      }
    } catch (error) {
      console.error('AI分担エラー:', error)
      
      // エラー情報をデバッグデータに設定
      setDebugData({
        error: true,
        errorMessage: error.message || 'AI分担の計算中にエラーが発生しました',
        assignments: [],
        workloadAnalysis: {},
        overallFairnessScore: 0
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleChoreCompletion = (choreId) => {
    const chore = todayChores.find(c => c.id === choreId)
    if (chore && updateChoreStatus) {
      const newStatus = chore.status === 'completed' ? 'pending' : 'completed'
      const memberName = getMemberInfo(chore.assignedTo?.memberId)?.name || 'Unknown'
      
      updateChoreStatus(choreId, newStatus)
      
      if (newStatus === 'completed') {
        handleTaskComplete(choreId, memberName, chore)
      }
    }
  }

  const handleManualAssignment = async () => {
    if (!calculateAIAssignment) return
    setIsRefreshing(true)
    try {
      await calculateAIAssignment()
    } catch (error) {
      console.error('AI分担エラー:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'おはようございます'
    if (hour < 17) return 'こんにちは'
    if (hour < 21) return 'こんばんは'
    return 'お疲れ様です'
  }

  const getMemberInfo = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId)
    return member || { name: '未割り当て', avatar: '?' }
  }

  try {
    if (familyMembers.length === 0) {
      return (
        <>
          <div className="min-h-screen bg-gray-50 px-4 py-6">
            <div className="max-w-md mx-auto">
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">家族メンバーが未設定です</h2>
                <p className="text-gray-600 mb-6 text-sm">
                  まずは家族メンバーを登録してAI分担システムを開始しましょう
                </p>
                <Link to="/setup" className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Settings className="w-4 h-4" />
                  <span>家族設定を開始</span>
                </Link>
              </div>
            </div>
          </div>
          <SimpleDebugToggle debugMode={debugMode} setDebugMode={setDebugMode} />
        </>
      )
    }

    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="px-4 py-4 space-y-6">
            {/* ヘッダー - モバイル最適化 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4">
              <div className="text-center">
                <h1 className="text-lg font-bold mb-1">
                  {getGreeting()}
                </h1>
                <p className="text-white/80 text-sm mb-3">
                  {format(currentTime, 'M月d日 (E) HH:mm', { locale: ja })}
                </p>
                <div className="flex justify-center items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {stats.completed}/{stats.total}
                    </div>
                    <div className="text-white/80 text-xs">
                      タスク完了
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 統計カード - モバイル縦並び */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                      <div className="text-gray-600 text-sm">今日の総タスク</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                      <div className="text-gray-600 text-sm">完了済み</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">⏳</div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{stats.pending}</div>
                      <div className="text-gray-600 text-sm">未完了</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI分析レポート */}
            {aiSuggestions && (
              <AIAnalysisDisplay 
                aiSuggestions={aiSuggestions.balanceSuggestions}
                aiAnalysis={aiSuggestions.aiAnalysis}
                debugInfo={debugMode ? aiSuggestions.debugInfo : null}
                familyMembers={familyMembers}
              />
            )}

            {/* タスクセクション */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">今日のタスク</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowManualTaskForm(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>タスク追加</span>
                  </button>
                  <button
                    onClick={handleAIAssignment}
                    disabled={isRefreshing}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>AI分担実行</span>
                  </button>
                </div>
              </div>

              {todayChores.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    今日のタスクを作成しましょう
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    AI分担実行ボタンをクリックして今日の家事を自動生成
                  </p>
                  <button 
                    onClick={handleManualAssignment}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    disabled={isRefreshing}
                  >
                    <Brain className="w-4 h-4" />
                    <span>AI分担を実行</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(choresByMember).map(([memberId, chores]) => {
                    const memberInfo = getMemberInfo(memberId)
                    const completedChores = chores.filter(c => c.status === 'completed').length
                    const completionRate = chores.length > 0 ? Math.round((completedChores / chores.length) * 100) : 0
                    
                    return (
                      <div key={memberId} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{memberInfo.avatar}</span>
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">
                                {memberInfo.name}さん
                              </h3>
                              <p className="text-xs text-gray-600">
                                {chores.length}件 • {completionRate}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-600">
                              {completedChores}/{chores.length}
                            </div>
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {chores.map((chore) => (
                            <div
                              key={chore.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${chore.status === 'completed' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200 hover:border-blue-300'
                              }`}
                              onClick={() => toggleChoreCompletion(chore.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <button
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${chore.status === 'completed'
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                  }`}
                                >
                                  {chore.status === 'completed' && (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                </button>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{chore.icon || '📋'}</span>
                                  <div>
                                    <div className={`text-sm font-medium ${chore.status === 'completed' 
                                      ? 'line-through text-gray-500' 
                                      : 'text-gray-900'
                                    }`}>
                                      {chore.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {chore.estimatedTime || 30}分 • 難易度: {chore.difficulty || 5}/10
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <div className="text-xs">
                                  {chore.status === 'completed' ? (
                                    <span className="text-green-600 font-medium">完了</span>
                                  ) : (
                                    <span className="text-gray-400">未完了</span>
                                  )}
                                </div>
                                
                                {debugMode && deleteTask && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm(`このタスク「${chore.name}」を削除しますか？`)) {
                                        deleteTask(chore.id)
                                      }
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* その他の操作 - モバイル縦並び */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">その他の操作</h3>
              <div className="space-y-2">
                <Link
                  to="/assignment"
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">AI分担設定</div>
                    <div className="text-xs text-gray-600">詳細な分担結果を確認</div>
                  </div>
                </Link>
                
                <Link
                  to="/setup"
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">家族設定</div>
                    <div className="text-xs text-gray-600">メンバー情報を編集</div>
                  </div>
                </Link>

                <Link
                  to="/calendar"
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">カレンダー</div>
                    <div className="text-xs text-gray-600">予定と家事の統合管理</div>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* デバッグコンソール */}
            <DebugConsole 
              debugData={debugData}
              isVisible={showDebugConsole}
              onToggle={() => setShowDebugConsole(!showDebugConsole)}
            />
          </div>
        </div>
        
        <SimpleDebugToggle debugMode={debugMode} setDebugMode={setDebugMode} />
        
        {/* サポートメッセージ - モバイル調整 */}
        {supportMessages.length > 0 && (
          <div className="fixed top-16 right-2 left-2 z-40 space-y-2 max-w-sm mx-auto">
            {supportMessages.map((msg) => (
              <div key={msg.id} className="bg-green-100 border border-green-300 rounded-lg p-3 shadow-lg">
                <div className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-800">{msg.message}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {format(msg.timestamp, 'HH:mm', { locale: ja })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* タスク完了祝福モーダル */}
        {celebrationData && (
          <TaskCompletionCelebration
            completedTask={celebrationData.task}
            memberName={celebrationData.memberName}
            otherMembers={celebrationData.otherMembers}
            onClose={() => setCelebrationData(null)}
            onSupportMessage={handleSupportMessage}
          />
        )}
      </>
    )
    
  } catch (error) {
    console.error('DashboardPage レンダリングエラー:', error)
    return (
      <>
        <div className="min-h-screen bg-gray-50 px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">エラーが発生しました</h2>
              <p className="text-gray-600 mb-6 text-sm">
                ページの読み込み中に問題が発生しました。
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                ページを再読み込み
              </button>
            </div>
          </div>
        </div>
        <SimpleDebugToggle debugMode={debugMode} setDebugMode={setDebugMode} />
      </>
    )
  }
}

export default DashboardPage