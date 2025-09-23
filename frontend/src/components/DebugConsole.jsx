import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Code, Database, Brain, AlertTriangle } from 'lucide-react'

const DebugConsole = ({ debugData, isVisible, onToggle }) => {
  const [expandedSections, setExpandedSections] = useState({
    assignments: false,
    workload: false,
    aiResponse: false,
    metrics: false
  })

  if (!debugData) {
    return null
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatJson = (data) => {
    try {
      return JSON.stringify(data, null, 2)
    } catch (error) {
      return String(data)
    }
  }

  const getSectionIcon = (section) => {
    switch (section) {
      case 'assignments':
        return <Database className="w-4 h-4" />
      case 'workload':
        return <Code className="w-4 h-4" />
      case 'aiResponse':
        return <Brain className="w-4 h-4" />
      case 'metrics':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Code className="w-4 h-4" />
    }
  }

  if (!isVisible) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 text-red-700 hover:text-red-900"
        >
          <Code className="w-4 h-4" />
          <span className="text-sm font-medium">デバッグ情報を表示</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-red-700 hover:text-red-900 mb-4"
      >
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4" />
          <span className="text-sm font-medium">デバッグ情報</span>
        </div>
        <ChevronUp className="w-4 h-4" />
      </button>

      <div className="space-y-3">
        {/* AI分担結果 */}
        {debugData.assignments && (
          <div className="bg-white rounded-lg p-3 border">
            <button
              onClick={() => toggleSection('assignments')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                {getSectionIcon('assignments')}
                <span className="text-sm font-medium text-gray-900">
                  AI分担結果 ({debugData.assignments.length}件)
                </span>
              </div>
              {expandedSections.assignments ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.assignments && (
              <div className="mt-3 space-y-2">
                {debugData.assignments.map((assignment, index) => (
                  <div key={index} className="bg-gray-50 rounded p-2 text-xs">
                    <div className="font-mono text-gray-800">
                      <div><strong>タスク:</strong> {assignment.taskName}</div>
                      <div><strong>担当者:</strong> {assignment.assignedMember}</div>
                      <div><strong>理由:</strong> {assignment.reason}</div>
                      {assignment.score && (
                        <div><strong>スコア:</strong> {assignment.score}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ワークロード分析 */}
        {debugData.workloadAnalysis && (
          <div className="bg-white rounded-lg p-3 border">
            <button
              onClick={() => toggleSection('workload')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                {getSectionIcon('workload')}
                <span className="text-sm font-medium text-gray-900">
                  ワークロード分析
                </span>
              </div>
              {expandedSections.workload ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.workload && (
              <div className="mt-3">
                <pre className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-800 overflow-x-auto">
                  {formatJson(debugData.workloadAnalysis)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* AI応答 */}
        {debugData.aiResponse && (
          <div className="bg-white rounded-lg p-3 border">
            <button
              onClick={() => toggleSection('aiResponse')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                {getSectionIcon('aiResponse')}
                <span className="text-sm font-medium text-gray-900">
                  AI応答データ
                </span>
              </div>
              {expandedSections.aiResponse ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.aiResponse && (
              <div className="mt-3">
                <pre className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-800 overflow-x-auto max-h-40 overflow-y-auto">
                  {formatJson(debugData.aiResponse)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* メトリクス */}
        {debugData.metrics && (
          <div className="bg-white rounded-lg p-3 border">
            <button
              onClick={() => toggleSection('metrics')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                {getSectionIcon('metrics')}
                <span className="text-sm font-medium text-gray-900">
                  公平性メトリクス
                </span>
              </div>
              {expandedSections.metrics ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.metrics && (
              <div className="mt-3">
                <pre className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-800 overflow-x-auto">
                  {formatJson(debugData.metrics)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 全体公平性スコア */}
        {debugData.overallFairnessScore && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                全体公平性スコア
              </span>
              <span className="text-lg font-bold text-blue-700">
                {Math.round(debugData.overallFairnessScore * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-red-200">
        <p className="text-xs text-red-600">
          このデバッグ情報は開発者向けです。本番環境では非表示になります。
        </p>
      </div>
    </div>
  )
}

export default DebugConsole