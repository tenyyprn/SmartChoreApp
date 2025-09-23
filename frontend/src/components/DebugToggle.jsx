// Simple fix for the debug mode toggle
// This creates a floating debug control that can be easily toggled

import React from 'react'
import { Eye, EyeOff, X } from 'lucide-react'

const DebugToggle = ({ debugMode, setDebugMode }) => {
  // Only show in development or when debug mode is active
  if (process.env.NODE_ENV === 'production' && !debugMode) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-100 border border-red-300 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-red-800 font-medium">
            デバッグ情報
          </span>
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`
              flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors
              ${debugMode 
                ? 'bg-red-200 text-red-800 hover:bg-red-300' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            {debugMode ? (
              <>
                <EyeOff className="h-3 w-3" />
                <span>非表示</span>
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                <span>表示</span>
              </>
            )}
          </button>
        </div>
        
        {debugMode && (
          <div className="text-xs text-red-600 mt-2">
            デバッグ情報とテスト機能が有効です
          </div>
        )}
      </div>
    </div>
  )
}

export default DebugToggle
