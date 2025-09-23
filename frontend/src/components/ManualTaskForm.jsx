import React, { useState } from 'react'
import { useChore } from '../contexts/ChoreContext'
import { Plus, X, Clock, Target, User, Calendar } from 'lucide-react'

const ManualTaskForm = ({ isOpen, onClose }) => {
  const { familyMembers, addManualTask } = useChore()
  
  const [formData, setFormData] = useState({
    name: '',
    estimatedTime: 30,
    difficulty: 5,
    category: '',
    icon: '📋',
    assignedMemberId: '',
    timeSlot: 'morning'
  })

  // よく使うタスクのテンプレート
  const taskTemplates = [
    { name: '朝食の準備', icon: '🍳', estimatedTime: 30, difficulty: 4, category: '料理' },
    { name: '昼食の準備', icon: '🍜', estimatedTime: 40, difficulty: 5, category: '料理' },
    { name: '夕食の準備', icon: '🍽️', estimatedTime: 60, difficulty: 7, category: '料理' },
    { name: '食器洗い', icon: '🍽️', estimatedTime: 15, difficulty: 3, category: 'キッチン' },
    { name: '洗濯物を干す', icon: '👕', estimatedTime: 20, difficulty: 4, category: '洗濯' },
    { name: '掃除機かけ', icon: '🧹', estimatedTime: 25, difficulty: 5, category: '掃除' },
    { name: 'ゴミ出し', icon: '🗑️', estimatedTime: 10, difficulty: 2, category: 'ゴミ' },
    { name: '風呂掃除', icon: '🛁', estimatedTime: 30, difficulty: 6, category: '掃除' },
    { name: '買い物', icon: '🛒', estimatedTime: 45, difficulty: 4, category: '買い物' },
    { name: '窓拭き', icon: '🪟', estimatedTime: 35, difficulty: 6, category: '掃除' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('タスク名を入力してください')
      return
    }
    
    if (!formData.assignedMemberId) {
      alert('担当者を選択してください')
      return
    }

    const assignedMember = familyMembers.find(m => m.id === formData.assignedMemberId)
    
    const taskData = {
      ...formData,
      assignedMemberName: assignedMember.name,
      assignedMemberAvatar: assignedMember.avatar
    }

    addManualTask(taskData)
    
    // フォームをリセット
    setFormData({
      name: '',
      estimatedTime: 30,
      difficulty: 5,
      category: '',
      icon: '📋',
      assignedMemberId: '',
      timeSlot: 'morning'
    })
    
    alert('タスクを追加しました！')
    onClose()
  }

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      ...template
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">手動タスク追加</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* テンプレート選択 */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">よく使うタスク</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {taskTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => applyTemplate(template)}
                className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="text-2xl mb-1">{template.icon}</div>
                <div className="text-sm font-medium text-gray-900">{template.name}</div>
                <div className="text-xs text-gray-600">{template.estimatedTime}分</div>
              </button>
            ))}
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タスク名とアイコン */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アイコン
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl"
                placeholder="📋"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タスク名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例: 食器洗い"
                required
              />
            </div>
          </div>

          {/* 時間と難易度 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                推定時間（分）
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Target className="w-4 h-4 inline mr-1" />
                難易度（1-10）
              </label>
              <input
                type="number"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* カテゴリと時間帯 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例: キッチン、掃除"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                時間帯
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="morning">朝</option>
                <option value="afternoon">昼</option>
                <option value="evening">夜</option>
              </select>
            </div>
          </div>

          {/* 担当者選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              担当者 *
            </label>
            <select
              value={formData.assignedMemberId}
              onChange={(e) => setFormData({...formData, assignedMemberId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">担当者を選択してください</option>
              {familyMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.avatar} {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>タスクを追加</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManualTaskForm
