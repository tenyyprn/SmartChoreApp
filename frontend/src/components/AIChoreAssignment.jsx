import React, { useState } from 'react'
import { Sparkles, Brain, BarChart3 } from 'lucide-react'
import VertexAIChoreService from '../services/vertexAI'

const AIChoreAssignment = ({ familyMembers, chores, onAssignmentGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [preferences, setPreferences] = useState({
    prioritizeFairness: true,
    considerSkills: true,
    rotateWeekly: false
  })

  const aiService = new VertexAIChoreService()

  const generateAssignment = async () => {
    if (familyMembers.length === 0 || chores.length === 0) {
      alert('家族メンバーと家事リストを追加してください')
      return
    }

    setIsGenerating(true)
    
    try {
      const result = await aiService.generateChoreAssignment(
        familyMembers, 
        chores, 
        preferences
      )
      
      setLastResult(result)
      onAssignmentGenerated(result)
      
      // 成功通知
      console.log('AI分担生成完了:', result)
      
    } catch (error) {
      console.error('AI分担生成エラー:', error)
      alert('AI分担の生成に失敗しました。再度お試しください。')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Brain className="h-6 w-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">AI家事分担システム</h2>
        <div className="ml-auto flex items-center">
          <Sparkles className="h-5 w-5 text-yellow-500 mr-1" />
          <span className="text-sm text-gray-600">Vertex AI搭載</span>
        </div>
      </div>

      {/* 設定オプション */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">最適化設定</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.prioritizeFairness}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                prioritizeFairness: e.target.checked
              }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">公平性を最優先</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.considerSkills}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                considerSkills: e.target.checked
              }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">スキルレベルを考慮</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.rotateWeekly}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                rotateWeekly: e.target.checked
              }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">週次ローテーション</span>
          </label>
        </div>
      </div>

      {/* 生成ボタン */}
      <button
        onClick={generateAssignment}
        disabled={isGenerating || familyMembers.length === 0 || chores.length === 0}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200
          ${isGenerating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
          }
        `}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            AI分析中...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Sparkles className="h-5 w-5 mr-2" />
            AI分担を生成
          </div>
        )}
      </button>

      {/* 前回結果の表示 */}
      {lastResult && (
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center mb-3">
            <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">前回の分析結果</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-700">公平性スコア</div>
              <div className="text-2xl font-bold text-green-800">
                {Math.round(lastResult.fairnessScore * 100)}%
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-700">分担数</div>
              <div className="text-2xl font-bold text-blue-800">
                {lastResult.assignments?.[0]?.assignments?.length || 0}件
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-purple-700">最適化度</div>
              <div className="text-2xl font-bold text-purple-800">
                {lastResult.success ? '高' : '中'}
              </div>
            </div>
          </div>

          {/* AI提案 */}
          {lastResult.recommendations && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">AI提案</h4>
              <ul className="space-y-1">
                {lastResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start">
                    <span className="mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 使用状況 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <span>🔒 データは安全に処理され、プライバシーが保護されます</span>
      </div>
    </div>
  )
}

export default AIChoreAssignment
