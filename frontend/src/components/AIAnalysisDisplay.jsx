import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Brain, Sparkles } from 'lucide-react'

const AIAnalysisDisplay = ({ aiSuggestions, aiAnalysis, debugInfo, familyMembers = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullResponse, setShowFullResponse] = useState(false)

  // メンバー名を取得するヘルパー関数
  const getMemberName = (memberId) => {
    if (!memberId || !familyMembers || familyMembers.length === 0) {
      return '不明なメンバー'
    }
    
    const member = familyMembers.find(m => m.id === memberId || m.name === memberId)
    return member ? member.name : `メンバー${memberId}`
  }

  // AI分析テキストの`undefined`を修正する関数（完全リライト版）
  const fixUndefinedInText = (text) => {
    if (!text || typeof text !== 'string') return text
    
    // 新しい改善提案メッセージを検出して、そのまま返す
    if (text.includes('Vertex AI') || text.includes('スキルマッチング') || text.includes('スキルベース分担')) {
      return text // 新しいメッセージはそのまま表示
    }
    
    let fixedText = text
    
    if (familyMembers.length >= 2) {
      const member1 = familyMembers[0]
      const member2 = familyMembers[1]
      
      console.log('AI分析修正:', {
        member1: member1.name,
        member2: member2.name,
        originalLength: text.length
      })
      
      // 段階的に置換（より安全な方法）
      // Step 1: 具体的なパターンを先に置換
      fixedText = fixedText.replace(
        /(・\s*)undefined(さん: \d+分)、undefined(さん: \d+分)/g, 
        `$1${member1.name}$2、${member2.name}$3`
      )
      
      // Step 2: 詳細統計の置換（2つのundefinedを区別）
      let statCount = 0
      fixedText = fixedText.replace(
        /(・\s*)undefined(: \d+分 \()undefined(件\))/g, 
        (match, prefix, middle, suffix) => {
          const member = statCount === 0 ? member1 : member2
          statCount++
          return `${prefix}${member.name}${middle}${member.name}${suffix}`
        }
      )
      
      // Step 3: まだ残っているundefinedがあれば交互に置換
      let remainingCount = 0
      fixedText = fixedText.replace(/\bundefined\b/g, () => {
        const member = familyMembers[remainingCount % familyMembers.length]
        remainingCount++
        return member.name
      })
      
      console.log('修正完了:', {
        beforeUndefinedCount: (text.match(/undefined/g) || []).length,
        afterUndefinedCount: (fixedText.match(/undefined/g) || []).length,
        result: fixedText.substring(0, 200)
      })
      
    } else if (familyMembers.length === 1) {
      const member = familyMembers[0]
      fixedText = fixedText.replace(/\bundefined\b/g, member.name)
    } else {
      fixedText = fixedText.replace(/\bundefined\b/g, 'メンバー')
    }
    
    return fixedText
  }

  // AI応答サマリーを取得
  const getAIResponseSummary = () => {
    if (debugInfo?.enhancedAssignment?.aiResponse) {
      return fixUndefinedInText(debugInfo.enhancedAssignment.aiResponse)
    }
    
    // フォールバック: aiAnalysisから抽出
    if (aiAnalysis && typeof aiAnalysis === 'string') {
      return fixUndefinedInText(aiAnalysis)
    }
    
    return null
  }

  const aiResponseSummary = getAIResponseSummary()
  const fixedAiAnalysis = fixUndefinedInText(aiAnalysis)

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
      {fixedAiAnalysis && (
        <div className="mb-3">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 font-medium">総合評価:</span>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{fixedAiAnalysis}</p>
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
          {/* メンバー別統計情報 */}
          {debugInfo?.enhancedAssignment?.workloadAnalysis && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">メンバー別詳細:</h4>
              <div className="space-y-2">
                {Object.entries(debugInfo.enhancedAssignment.workloadAnalysis).map(([memberId, workload]) => {
                  const memberName = getMemberName(memberId)
                  return (
                    <div key={memberId} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{memberName}</span>
                        <div className="text-sm text-gray-600">
                          {workload.totalMinutes || 0}分 • {workload.taskCount || 0}件
                        </div>
                      </div>
                      {workload.averageComparison && (
                        <div className="text-xs text-gray-500 mt-1">
                          平均と比較して {Math.round(workload.averageComparison * 100)}%
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
                        {fixUndefinedInText(suggestion.message)}
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