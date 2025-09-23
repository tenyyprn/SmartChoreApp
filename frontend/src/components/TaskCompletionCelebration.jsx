import React, { useState, useEffect } from 'react'
import { Heart, Star, Users, MessageCircle, X, Sparkles } from 'lucide-react'

const TaskCompletionCelebration = ({ completedTask, memberName, otherMembers, onClose, onSupportMessage }) => {
  const [showSupportPrompt, setShowSupportPrompt] = useState(false)
  const [selectedSupportAction, setSelectedSupportAction] = useState(null)

  useEffect(() => {
    // 3秒後にサポート促進を表示
    const timer = setTimeout(() => {
      setShowSupportPrompt(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const celebrationMessages = [
    {
      emoji: '🎉',
      message: 'お疲れさまでした！',
      subMessage: 'ひとつの家事を完了していただき、ありがとうございます！'
    },
    {
      emoji: '⭐',
      message: '素晴らしい！',
      subMessage: '家族のために貴重な時間を使っていただき感謝です！'
    },
    {
      emoji: '👏',
      message: 'よくできました！',
      subMessage: 'あなたの努力が家族の幸せにつながっています！'
    },
    {
      emoji: '🌟',
      message: 'ありがとうございます！',
      subMessage: '家事への取り組み、本当に助かります！'
    }
  ]

  const supportActions = [
    {
      id: 'thanks',
      icon: Heart,
      title: 'お疲れさまメッセージ',
      description: '他の家族メンバーに感謝の気持ちを伝える',
      message: `${memberName}さんが「${completedTask?.name}」を完了してくれました！お疲れさまでした✨`
    },
    {
      id: 'offer_help',
      icon: Users,
      title: 'サポート申し出',
      description: '他のタスクでお手伝いを申し出る',
      message: `${memberName}さん、「${completedTask?.name}」お疲れさまでした！何か他にお手伝いできることがあれば声をかけてください💪`
    },
    {
      id: 'encouragement',
      icon: Sparkles,
      title: '励ましメッセージ',
      description: 'チームワークを高める励ましの言葉',
      message: `${memberName}さんのおかげで家がきれいになりました！お疲れさまです。一緒に頑張りましょう🏠💕`
    },
    {
      id: 'appreciation',
      icon: Star,
      title: '努力を称賛',
      description: '具体的な努力を認めて感謝を表現',
      message: `${memberName}さん、「${completedTask?.name}」をていねいにやってくださってありがとうございます！とても助かります🙏`
    }
  ]

  const celebration = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)]

  const handleSupportAction = (action) => {
    setSelectedSupportAction(action)
    onSupportMessage?.(action.message)
  }

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(Math.min(difficulty || 1, 5))
  }

  const getTimeComment = (estimatedTime) => {
    if (estimatedTime >= 60) {
      return '長時間のタスク、本当にお疲れさまでした！'
    } else if (estimatedTime >= 30) {
      return 'しっかりと時間をかけて取り組んでいただき、ありがとうございます！'
    } else {
      return 'サクッと効率よく完了していただき、ありがとうございます！'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl relative">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* メイン祝福メッセージ */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce">{celebration.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{celebration.message}</h2>
          <p className="text-gray-600">{celebration.subMessage}</p>
        </div>

        {/* 完了したタスクの詳細 */}
        {completedTask && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{completedTask.icon || '📋'}</span>
                <span className="font-semibold text-green-800">{completedTask.name}</span>
              </div>
              <span className="text-sm text-green-600">
                {getDifficultyStars(completedTask.difficulty)}
              </span>
            </div>
            
            <div className="text-sm text-green-700">
              <p>{getTimeComment(completedTask.estimatedTime)}</p>
              <p className="mt-1">
                📅 {completedTask.estimatedTime}分 • 
                ⭐ 難易度 {completedTask.difficulty}/10 • 
                📂 {completedTask.category}
              </p>
            </div>
          </div>
        )}

        {/* サポート促進セクション */}
        {showSupportPrompt && !selectedSupportAction && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              家族への感謝を伝えませんか？
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              お互いをサポートし合うことで、より良いチームワークが生まれます。
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {supportActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSupportAction(action)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">{action.title}</span>
                    </div>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 選択されたサポートアクション */}
        {selectedSupportAction && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
              メッセージを送信しました！
            </h3>
            <div className="bg-green-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800">{selectedSupportAction.message}</p>
            </div>
            <p className="text-sm text-gray-600">
              家族間のコミュニケーションが家事分担をより楽しくします！🏠💕
            </p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex space-x-3 mt-6">
          {!showSupportPrompt && (
            <button
              onClick={() => setShowSupportPrompt(true)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>家族にメッセージ</span>
            </button>
          )}
          
          <button
            onClick={onClose}
            className={`${showSupportPrompt ? 'flex-1' : 'flex-1'} bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors`}
          >
            {selectedSupportAction ? '完了' : '閉じる'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskCompletionCelebration