import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Brain, Sparkles } from 'lucide-react'

const AIAnalysisDisplay = ({ aiSuggestions, aiAnalysis, debugInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullResponse, setShowFullResponse] = useState(false)

  // AI応答サマリーを取得
  const getAIResponseSummary = () => {
    if (debugInfo?.enhancedAssignment?.aiResponse) {
      return debugInfo.enhancedAssignment.aiResponse
    }
    
    // フォールバック: aiAnalysisから抽出
    if (aiAnalysis && typeof aiAnalysis === 'string') {
      return aiAnalysis
    }
    
    return null
  }

  const aiResponseSummary = getAIResponseSummary()

  if (!aiResponseSummary && (!aiSuggestions || aiSuggestions.length === 0)) {
    return null
  }

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">
            Vertex AI 分析レポート
          </h3>
          <Sparkles className="w-4 h-4 text-purple-500" />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* AI分析サマリー */}
      {aiAnalysis && (
        <div className="mb-3">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 font-medium">総合評価:</span>
            </div>
            <p className="text-gray-700">{aiAnalysis}</p>
          </div>
        </div>
      )}

      {/* AI応答サマリー */}
      {aiResponseSummary && (
        <div className="mb-3">
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 font-medium">AI詳細分析:</span>
              <button
                onClick={() => setShowFullResponse(!showFullResponse)}
                className="text-sm text-purple-600 hover:text-purple-800 underline"
              >
                {showFullResponse ? '要約表示' : '全文表示'}
              </button>
            </div>
            <div className="text-gray-700">
              {showFullResponse ? (
                <div className="whitespace-pre-wrap text-sm">
                  {aiResponseSummary}
                </div>
              ) : (
                <p className="text-sm">
                  {truncateText(aiResponseSummary, 150)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 展開可能な詳細情報 */}
      {isExpanded && (
        <div className="space-y-3">
          {/* AI提案一覧 */}
          {aiSuggestions && aiSuggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">改善提案:</h4>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      suggestion.type === 'success'
                        ? 'bg-green-50 border-green-400 text-green-800'
                        : suggestion.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                        : suggestion.type === 'info'
                        ? 'bg-blue-50 border-blue-400 text-blue-800'
                        : 'bg-gray-50 border-gray-400 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {suggestion.type === 'success' && '✅ '}
                        {suggestion.type === 'warning' && '⚠️ '}
                        {suggestion.type === 'info' && 'ℹ️ '}
                        {suggestion.type === 'tip' && '💡 '}
                        {suggestion.message}
                      </span>
                      {suggestion.priority && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          suggestion.priority === 'high'
                            ? 'bg-red-100 text-red-600'
                            : suggestion.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {suggestion.priority}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* デバッグ情報（開発時のみ） */}
          {debugInfo && process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-50 rounded-lg p-3">
              <summary className="text-sm font-medium text-gray-600 cursor-pointer">
                デバッグ情報（開発用）
              </summary>
              <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-32">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

export default AIAnalysisDisplay
