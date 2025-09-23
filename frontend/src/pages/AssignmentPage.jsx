// Assignment page with real data and proper imports
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useChore } from '../contexts/ChoreContext'
import { 
  Brain, 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Settings,
  Award,
  Target,
  Lightbulb
} from 'lucide-react'

// Safe component with error handling
const AssignmentPage = () => {
  const {
    familyMembers = [],
    aiSuggestions = null,
    calculateAIAssignment = async () => {},
    choreAssignments = []
  } = useChore()
  
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('assignments')
  const [showDetails, setShowDetails] = useState({})

  const handleCalculateAssignment = async () => {
    setIsCalculating(true)
    try {
      if (calculateAIAssignment) {
        await calculateAIAssignment()
      }
    } catch (error) {
      console.error('AI分担計算エラー:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  useEffect(() => {
    try {
      if (familyMembers.length > 0 && (!aiSuggestions || !choreAssignments.length)) {
        handleCalculateAssignment()
      }
    } catch (error) {
      console.error('useEffect error:', error)
    }
  }, [familyMembers.length])

  // Calculate fairness score
  const calculateFairnessScore = () => {
    try {
      if (!aiSuggestions || !aiSuggestions.workloadAnalysis) {
        return 0
      }
      return Math.round((aiSuggestions.overallFairnessScore || 0) * 100)
    } catch (error) {
      console.error('Fairness calculation error:', error)
      return 0
    }
  }

  const fairnessScore = calculateFairnessScore()

  // Get member workload
  const getMemberWorkload = (memberId) => {
    try {
      if (!aiSuggestions || !aiSuggestions.workloadAnalysis) {
        return { totalTime: 0, totalChores: 0 }
      }
      return aiSuggestions.workloadAnalysis[memberId] || { totalTime: 0, totalChores: 0 }
    } catch (error) {
      console.error('Member workload error:', error)
      return { totalTime: 0, totalChores: 0 }
    }
  }

  // Filter assignments by category
  const getFilteredAssignments = () => {
    try {
      if (!aiSuggestions || !aiSuggestions.assignments) {
        return []
      }
      
      if (selectedCategory === 'all') {
        return aiSuggestions.assignments
      }
      
      return aiSuggestions.assignments.filter(category => 
        category.categoryId === selectedCategory
      )
    } catch (error) {
      console.error('Filter assignments error:', error)
      return []
    }
  }

  const filteredAssignments = getFilteredAssignments()

  // Error boundary render
  try {
    if (familyMembers.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            家族メンバーが未設定です
          </h2>
          <p className="text-gray-600 mb-8">
            まずは家族メンバーを登録してください
          </p>
          <Link 
            to="/setup" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            家族設定に進む
          </Link>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">AI分担結果</h1>
              <p className="text-white/80">
                最適化された家事分担を確認・調整
              </p>
            </div>
            <button
              onClick={handleCalculateAssignment}
              disabled={isCalculating}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>再計算</span>
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl mb-2">⚖️</div>
            <div className="text-2xl font-bold text-gray-900">{fairnessScore}%</div>
            <div className="text-gray-600">公平性スコア</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gray-900">{familyMembers.length}</div>
            <div className="text-gray-600">家族メンバー</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-gray-900">{choreAssignments.length}</div>
            <div className="text-gray-600">今日のタスク</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-green-600">
              {fairnessScore >= 80 ? '最適' : fairnessScore >= 60 ? '良好' : '要調整'}
            </div>
            <div className="text-gray-600">分担バランス</div>
          </div>
        </div>

        {/* AI提案がない場合 */}
        {!aiSuggestions && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI分担を実行してください
            </h3>
            <p className="text-gray-600 mb-6">
              家族メンバーの情報を元に最適な分担を計算します
            </p>
            <button
              onClick={handleCalculateAssignment}
              disabled={isCalculating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto disabled:opacity-50"
            >
              <Brain className="w-5 h-5" />
              <span>AI分担を実行</span>
            </button>
          </div>
        )}

        {/* メンバー別ワークロード */}
        {aiSuggestions && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              メンバー別ワークロード
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyMembers.map((member) => {
                const workload = getMemberWorkload(member.id)
                const utilizationRate = Math.min(100, Math.round((workload.totalTime / 240) * 100)) // 4時間 = 240分

                return (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-3xl">{member.avatar}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.age}歳</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">総作業時間</span>
                        <span className="font-medium">{workload.totalTime || 0}分</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">担当タスク数</span>
                        <span className="font-medium">{workload.totalChores || 0}件</span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">利用率</span>
                          <span className="text-sm font-medium">{utilizationRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              utilizationRate > 80 ? 'bg-red-500' :
                              utilizationRate > 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${utilizationRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* カテゴリフィルター */}
        {filteredAssignments.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">分担詳細</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                {aiSuggestions.assignments.map((category) => (
                  <button
                    key={category.categoryId}
                    onClick={() => setSelectedCategory(category.categoryId)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCategory === category.categoryId 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.category}
                  </button>
                ))}
              </div>
            </div>

            {/* 分担リスト */}
            <div className="space-y-6">
              {filteredAssignments.map((categoryData) => (
                <div key={categoryData.categoryId}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {categoryData.category}
                  </h3>
                  <div className="space-y-3">
                    {categoryData.assignments.map((assignment, index) => (
                      <div
                        key={`${categoryData.categoryId}-${index}`}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">{assignment.choreIcon}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {assignment.choreName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              難易度: {assignment.choreDifficulty}/10 • 
                              {assignment.recommendedAssignee?.estimatedTime || 30}分
                            </p>
                          </div>
                        </div>
                        
                        {assignment.recommendedAssignee && (
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {assignment.recommendedAssignee.memberName}
                              </div>
                              <div className="text-sm text-gray-600">
                                適合度: {Math.round((assignment.recommendedAssignee.score || 0) * 100)}%
                              </div>
                            </div>
                            <span className="text-2xl">
                              {assignment.recommendedAssignee.memberAvatar}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 改善提案 */}
        {aiSuggestions && aiSuggestions.balanceSuggestions && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI改善提案</h2>
            <div className="space-y-3">
              {aiSuggestions.balanceSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    {suggestion.message || suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('AssignmentPage render error:', error)
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ページエラー
        </h2>
        <p className="text-gray-600 mb-8">
          分担ページの表示中に問題が発生しました
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          ページを再読み込み
        </button>
      </div>
    )
  }
}

export default AssignmentPage
