// Emergency fix for App.jsx with error boundaries
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ChoreProvider } from './contexts/ChoreContext'

// Components with error boundaries
import Navigation from './components/Navigation'
import ErrorBoundary from './components/ErrorBoundary'

// Pages - using dynamic imports with fallbacks
const DashboardPage = React.lazy(() => 
  import('./pages/DashboardPage').catch(() => ({ 
    default: () => <div className="text-center py-16">ダッシュボードページの読み込みに失敗しました</div> 
  }))
)

const SetupPage = React.lazy(() => 
  import('./pages/SetupPage').catch(() => ({ 
    default: () => <div className="text-center py-16">セットアップページの読み込みに失敗しました</div> 
  }))
)

const AssignmentPage = React.lazy(() => 
  import('./pages/AssignmentPage').catch(() => ({ 
    default: () => <div className="text-center py-16">分担ページの読み込みに失敗しました</div> 
  }))
)

const CalendarPage = React.lazy(() => 
  import('./pages/CalendarPage').catch(() => ({ 
    default: () => <div className="text-center py-16">カレンダーページの読み込みに失敗しました</div> 
  }))
)

const ReportsPage = React.lazy(() => 
  import('./pages/ReportsPage').catch(() => ({ 
    default: () => <div className="text-center py-16">レポートページの読み込みに失敗しました</div> 
  }))
)

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <div className="text-gray-600">読み込み中...</div>
    </div>
  </div>
)

function App() {
  try {
    return (
      <ErrorBoundary>
        <ChoreProvider>
          <div className="min-h-screen bg-gray-50">
            <ErrorBoundary>
              <Navigation />
            </ErrorBoundary>
            
            <main className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-6">
              <ErrorBoundary>
                <React.Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/setup" element={<SetupPage />} />
                    <Route path="/assignment" element={<AssignmentPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </React.Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </ChoreProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('App.jsx 重大エラー:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            アプリケーションエラー
          </h1>
          <p className="text-gray-600 mb-8">
            アプリの初期化中に問題が発生しました
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }
}

export default App
