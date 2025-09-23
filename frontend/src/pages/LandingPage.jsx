import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Calendar, 
  Users, 
  Smartphone, 
  Zap, 
  Award,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI最適分担",
      description: "Google Vertex AIが家族のスキルと予定を考慮して最適な家事分担を自動計算"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "カレンダー統合",
      description: "Google Calendarと完全連携。タスクが自動でスケジュールに追加される"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "公平性保証",
      description: "負荷バランスを自動計算し、家族全員が納得できる公平な分担を実現"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "リアルタイム同期",
      description: "Firebase でデータを同期。家族全員が常に最新の状況を共有"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "音声操作",
      description: "「分担して」と言うだけで実行。料理中でもハンズフリーで操作可能"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "成果可視化",
      description: "完了率や貢献度を統計で表示。家族のモチベーション向上をサポート"
    }
  ]

  const stats = [
    { number: "30秒", label: "分担計算時間" },
    { number: "85%", label: "公平性スコア" },
    { number: "24/7", label: "リアルタイム同期" },
    { number: "3食", label: "毎日の食事自動追加" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            家事分担の悩みを
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AIで解決
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Google Vertex AI を活用した革新的な家事分担システム。<br />
            公平性・効率性・実用性を兼ね備えた次世代の家族サポートアプリ。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              to="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>デモを開始</span>
            </Link>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-colors flex items-center space-x-2">
              <span>技術詳細</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              最先端技術による革新的機能
            </h2>
            <p className="text-xl text-gray-600">
              Google Cloud エコシステムを活用した本格的なAIアプリケーション
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">エンタープライズグレードの技術基盤</h2>
            <p className="text-xl text-gray-300">
              Google Cloud Platform の最新サービスを統合活用
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold mb-2">Vertex AI</h3>
              <p className="text-sm text-gray-300">機械学習による最適化</p>
            </div>
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-lg font-semibold mb-2">Firebase</h3>
              <p className="text-sm text-gray-300">リアルタイムデータベース</p>
            </div>
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-lg font-semibold mb-2">Cloud Run</h3>
              <p className="text-sm text-gray-300">サーバーレス実行環境</p>
            </div>
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold mb-2">Calendar API</h3>
              <p className="text-sm text-gray-300">スケジュール統合</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo CTA */}
      <div className="bg-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            実際に体験してみませんか？
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            30秒で家族の分担が完成。AIの力を実感してください。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/dashboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>今すぐ無料で開始</span>
            </Link>
            <div className="text-sm text-gray-500">
              * アカウント登録不要 | 即座に利用開始
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Smart Chore App</h3>
          <p className="text-gray-400 mb-6">
            AI-powered family chore assignment system
          </p>
          <div className="text-sm text-gray-500">
            Built with Google Cloud Platform | Made for Hackathon 2025
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
