import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, BarChart3, Calendar, FileText } from 'lucide-react'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'ホーム',
      description: '今日のタスク'
    },
    { 
      path: '/setup', 
      icon: Users, 
      label: '家族設定',
      description: 'メンバー管理'
    },
    { 
      path: '/assignment', 
      icon: BarChart3, 
      label: 'AI分担',
      description: '分担設定'
    },
    { 
      path: '/calendar', 
      icon: Calendar, 
      label: 'カレンダー',
      description: '予定管理'
    },
    { 
      path: '/reports', 
      icon: FileText, 
      label: 'レポート',
      description: '分析'
    }
  ]

  return (
    <>
      {/* デスクトップナビゲーション */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SmartChoreApp</h1>
                  <p className="text-xs text-gray-600">AI家事分担システム</p>
                </div>
              </Link>
            </div>

            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                    <div>
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-700' : ''}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 hidden lg:block">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* モバイルナビゲーション */}
      <div className="md:hidden">
        {/* モバイルヘッダー */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">SmartChoreApp</h1>
                <p className="text-xs text-gray-600">AI家事分担システム</p>
              </div>
            </Link>
          </div>
        </nav>

        {/* モバイル下部ナビゲーション */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-5 h-16">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center transition-colors ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}

export default Navigation
