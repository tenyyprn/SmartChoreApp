import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, X, AlertTriangle, Users, Home } from 'lucide-react'

// 簡易版カレンダーサービス（ローカル実装）
const useLocalCalendar = () => {
  const [schedule, setSchedule] = useState([])

  const loadSchedule = () => {
    try {
      const saved = localStorage.getItem('smartChore_familySchedule')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('予定読み込みエラー:', error)
      return []
    }
  }

  const saveSchedule = (newSchedule) => {
    try {
      localStorage.setItem('smartChore_familySchedule', JSON.stringify(newSchedule))
      setSchedule(newSchedule)
    } catch (error) {
      console.error('予定保存エラー:', error)
    }
  }

  const addEvent = (event) => {
    const newEvent = {
      id: Date.now(),
      ...event,
      createdAt: new Date().toISOString()
    }
    const currentSchedule = loadSchedule()
    const updatedSchedule = [...currentSchedule, newEvent]
    saveSchedule(updatedSchedule)
    return newEvent
  }

  const deleteEvent = (eventId) => {
    const currentSchedule = loadSchedule()
    const updatedSchedule = currentSchedule.filter(event => event.id !== eventId)
    saveSchedule(updatedSchedule)
  }

  useEffect(() => {
    setSchedule(loadSchedule())
  }, [])

  return { schedule, addEvent, deleteEvent, loadSchedule }
}

const ScheduleManager = ({ familyMembers = [], onAvailabilityChange }) => {
  const { schedule, addEvent, deleteEvent } = useLocalCalendar()
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    memberId: '',
    startTime: '',
    endTime: '',
    type: 'out',
    location: '',
    description: ''
  })

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return ''
    try {
      const date = new Date(dateTimeString)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const dayNames = ['日', '月', '火', '水', '木', '金', '土']
      const dayOfWeek = dayNames[date.getDay()]
      
      return `${month}月${day}日(${dayOfWeek}) ${hours}:${minutes}`
    } catch (error) {
      return dateTimeString
    }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    
    if (!newEvent.title || !newEvent.memberId || !newEvent.startTime || !newEvent.endTime) {
      alert('必須項目を入力してください')
      return
    }

    const event = {
      ...newEvent,
      startTime: new Date(newEvent.startTime).toISOString(),
      endTime: new Date(newEvent.endTime).toISOString()
    }

    addEvent(event)
    setShowAddForm(false)
    setNewEvent({
      title: '',
      memberId: '',
      startTime: '',
      endTime: '',
      type: 'out',
      location: '',
      description: ''
    })
  }

  const handleDeleteEvent = (eventId) => {
    if (confirm('この予定を削除しますか？')) {
      deleteEvent(eventId)
    }
  }

  const getEventTypeColor = (type) => {
    const colors = {
      'out': 'bg-red-100 text-red-700 border-red-200',
      'work': 'bg-blue-100 text-blue-700 border-blue-200',
      'travel': 'bg-purple-100 text-purple-700 border-purple-200',
      'other': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[type] || colors['other']
  }

  const getEventTypeLabel = (type) => {
    const labels = {
      'out': '外出',
      'work': '仕事',
      'travel': '旅行',
      'other': 'その他'
    }
    return labels[type] || 'その他'
  }

  const getMemberName = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId)
    return member ? member.name : '不明'
  }

  const getMemberAvatar = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId)
    return member ? member.avatar : '👤'
  }

  // 今週の予定をフィルター（簡易版）
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  const thisWeekEvents = schedule.filter(event => {
    try {
      const eventDate = new Date(event.startTime)
      return eventDate >= weekStart && eventDate <= weekEnd
    } catch (error) {
      return false
    }
  })

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">家族の予定管理</h2>
            <p className="text-white/80">
              外出予定を登録して家事分担を最適化
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            予定追加
          </button>
        </div>
      </div>

      {/* 今週の予定一覧 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          今週の予定 ({thisWeekEvents.length}件)
        </h3>
        
        {thisWeekEvents.length > 0 ? (
          <div className="space-y-3">
            {thisWeekEvents
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
              .map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getMemberAvatar(event.memberId)}
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {getMemberName(event.memberId)} • 
                        {formatDateTime(event.startTime)} 〜 
                        {formatDateTime(event.endTime).split(' ')[1]}
                      </div>
                      {event.location && (
                        <div className="text-xs text-gray-500">📍 {event.location}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded border ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            今週は予定が登録されていません
          </div>
        )}
      </div>

      {/* 簡易在宅状況表示 */}
      {familyMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            家族の状況
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyMembers.map(member => {
              const memberEvents = thisWeekEvents.filter(event => event.memberId === member.id)
              return (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{member.avatar}</span>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-600">
                        今週の予定: {memberEvents.length}件
                      </div>
                    </div>
                  </div>
                  
                  {memberEvents.length > 0 && (
                    <div className="text-xs text-gray-500">
                      次の予定: {memberEvents[0]?.title}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {thisWeekEvents.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  外出予定がある日は、在宅メンバーに家事が調整されます
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 予定追加モーダル */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新しい予定を追加</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  予定名 *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 会社出張"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  対象メンバー *
                </label>
                <select
                  value={newEvent.memberId}
                  onChange={(e) => setNewEvent({...newEvent, memberId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {familyMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.avatar} {member.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始日時 *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    終了日時 *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  予定の種類
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="out">外出</option>
                  <option value="work">仕事</option>
                  <option value="travel">旅行</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  場所
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 東京オフィス"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScheduleManager