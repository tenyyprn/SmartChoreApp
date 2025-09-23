import React from 'react'
import { Cloud, CloudOff, Wifi, WifiOff, Database, AlertCircle } from 'lucide-react'

const FirebaseStatus = ({ connectionStatus }) => {
  const { isConnected, isLoading, error, familyId } = connectionStatus

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm">Firebase接続中...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
      isConnected 
        ? 'text-green-700 bg-green-50' 
        : 'text-orange-700 bg-orange-50'
    }`}>
      {isConnected ? (
        <>
          <Cloud className="h-4 w-4" />
          <span className="text-sm">Firebase同期中</span>
          {familyId && (
            <span className="text-xs opacity-70">({familyId.slice(0, 8)}...)</span>
          )}
        </>
      ) : (
        <>
          <CloudOff className="h-4 w-4" />
          <span className="text-sm">ローカルモード</span>
          {error && (
            <AlertCircle className="h-4 w-4" title={error} />
          )}
        </>
      )}
    </div>
  )
}

export default FirebaseStatus
