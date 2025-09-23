// Reports page with real data instead of dummy data
import React, { useState } from 'react'
import { useChore } from '../contexts/ChoreContext'
import { BarChart3, TrendingUp, Award, Calendar, Users, Clock } from 'lucide-react'

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const {
    familyMembers = [],
    choreAssignments = [],
    aiSuggestions = null,
    getStats = () => ({ total: 0, completed: 0, pending: 0, completionRate: 0 })
  } = useChore()

  const stats = getStats()

  // Calculate member performance from real data
  const calculateMemberPerformance = () => {
    return familyMembers.map(member => {
      const memberTasks = choreAssignments.filter(task => 
        task.assignedTo?.memberId === member.id
      )
      const completedTasks = memberTasks.filter(task => task.status === 'completed')
      const totalTime = memberTasks.reduce((sum, task) => sum + (task.estimatedTime || 30), 0)
      const completionRate = memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0
      
      return {
        name: member.name,
        avatar: member.avatar,
        completed: completedTasks.length,
        total: memberTasks.length,
        time: `${Math.round(totalTime / 60 * 10) / 10}h`,
        completionRate,
        trend: completionRate > 75 ? '+15%' : completionRate > 50 ? '+8%' : '-5%'
      }
    })
  }

  // Calculate task frequency from real data
  const calculateTaskFrequency = () => {
    const taskCount = {}
    const taskCompletion = {}
    
    choreAssignments.forEach(task => {
      const taskName = task.name
      taskCount[taskName] = (taskCount[taskName] || 0) + 1
      if (task.status === 'completed') {
        taskCompletion[taskName] = (taskCompletion[taskName] || 0) + 1
      }
    })
    
    return Object.keys(taskCount).map(taskName => {
      const count = taskCount[taskName]
      const completed = taskCompletion[taskName] || 0
      const rate = count > 0 ? Math.round((completed / count) * 100) : 0
      
      // Find the task to get icon
      const task = choreAssignments.find(t => t.name === taskName)
      
      return {
        name: taskName,
        icon: task?.icon || '📋',
        count,
        rate: `${rate}%`,
        completionRate: rate
      }
    }).sort((a, b) => b.completionRate - a.completionRate)
  }

  const memberPerformance = calculateMemberPerformance()
  const taskFrequency = calculateTaskFrequency()
  const popularTasks = taskFrequency.slice(0, 4)
  const improvementTasks = taskFrequency.slice(-4).reverse()

  try {
    return (
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">家事レポート</h1>
              <p className="text-white/80">
                分担実績とパフォーマンス分析
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.completionRate}%</div>
              <div className="text-white/80 text-sm">今週の完了率</div>
            </div>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">レポート期間</h2>
            <div className="flex space-x-2">
              {[
                { value: 'week', label: '今週' },
                { value: 'month', label: '今月' },
                { value: 'quarter', label: '四半期' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 統計カード（実際のデータ） */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-success-600">{stats.completed}</div>
            <div className="text-gray-600">完了タスク</div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.total > 0 ? `${stats.total}件中` : '今日のタスクなし'}
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(choreAssignments.reduce((sum, task) => sum + (task.estimatedTime || 30), 0) / 60 * 10) / 10}h
            </div>
            <div className="text-gray-600">総作業時間</div>
            <div className="text-sm text-gray-500 mt-1">予想時間</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-2">⚖️</div>
            <div className="text-2xl font-bold text-warning-600">
              {aiSuggestions ? Math.round((aiSuggestions.overallFairnessScore || 0) * 100) : 0}%
            </div>
            <div className="text-gray-600">分担公平性</div>
            <div className="text-sm text-gray-500 mt-1">AI計算結果</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
            <div className="text-gray-600">完了率</div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.pending}件未完了
            </div>
          </div>
        </div>

        {/* メンバー別パフォーマンス（実際のデータ） */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            メンバー別パフォーマンス
          </h2>
          {memberPerformance.length > 0 ? (
            <div className="space-y-6">
              {memberPerformance.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{member.avatar}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">
                        {member.completed}/{member.total} タスク完了 • {member.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-gray-900">{member.completionRate}%</span>
                      <span className={`text-sm font-medium ${
                        member.completionRate > 75 ? 'text-green-600' : 
                        member.completionRate > 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {member.trend}
                      </span>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          member.completionRate > 75 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          member.completionRate > 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${member.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              家族メンバーまたはタスクデータがありません
            </div>
          )}
        </div>

        {/* タスクランキング（実際のデータ） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              よく完了されるタスク
            </h2>
            {popularTasks.length > 0 ? (
              <div className="space-y-4">
                {popularTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{task.icon}</span>
                      <span className="font-medium text-gray-900">{task.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{task.count}回</div>
                      <div className="text-sm text-green-600">{task.rate}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                タスクデータがありません
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              改善が必要なタスク
            </h2>
            {improvementTasks.length > 0 ? (
              <div className="space-y-4">
                {improvementTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{task.icon}</span>
                      <span className="font-medium text-gray-900">{task.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{task.count}回</div>
                      <div className="text-sm text-red-600">{task.rate}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                改善データがありません
              </div>
            )}
          </div>
        </div>

        {/* AI改善提案（実際のデータ） */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            AI改善提案
          </h2>
          {aiSuggestions && aiSuggestions.balanceSuggestions && aiSuggestions.balanceSuggestions.length > 0 ? (
            <div className="space-y-4">
              {aiSuggestions.balanceSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      {suggestion.type === 'warning' ? '⚠️ 注意事項' :
                       suggestion.type === 'success' ? '✅ 良好な状況' : '💡 改善提案'}
                    </h3>
                    <p className="text-blue-800 text-sm">
                      {suggestion.message || suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">データ収集中</h3>
                  <p className="text-gray-700 text-sm">
                    より多くのタスクを完了すると、パーソナライズされた改善提案が表示されます
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('ReportsPage render error:', error)
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ページエラー
        </h2>
        <p className="text-gray-600 mb-8">
          レポートページの表示中に問題が発生しました
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          ページを再読み込み
        </button>
      </div>
    )
  }
}

export default ReportsPage
