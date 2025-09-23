// Debug Control Component
import React from 'react'
import { Eye, EyeOff, Bug, XCircle } from 'lucide-react'

const DebugControl = ({ debugMode, setDebugMode, showDebugInfo = false }) => {
  if (!showDebugInfo && !debugMode) return null

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bug className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-800">
            開発者向けデバッグ情報
          </span>
          {debugMode && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
              表示中
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {debugMode ? (
            <button
              onClick={() => setDebugMode(false)}
              className="flex items-center space-x-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded transition-colors"
            >
              <EyeOff className="h-4 w-4" />
              <span>非表示</span>
            </button>
          ) : (
            <button
              onClick={() => setDebugMode(true)}
              className="flex items-center space-x-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>表示</span>
            </button>
          )}
        </div>
      </div>
      
      {debugMode && (
        <div className="mt-3 text-xs text-red-600">
          デバッグモードが有効です。追加の削除ボタンやシステム情報が表示されています。
        </div>
      )}
    </div>
  )
}

export default DebugControl
