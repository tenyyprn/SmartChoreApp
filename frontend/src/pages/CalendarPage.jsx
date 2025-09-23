import React, { useState, useMemo } from 'react'
import { useChore } from '../contexts/ChoreContext'
import { 
  Calendar, Clock, Plus, ChevronLeft, ChevronRight, 
  CheckCircle2, BarChart3, Users, TrendingUp 
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameDay, startOfWeek, endOfWeek, isToday, isThisMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import ScheduleManager from '../components/ScheduleManager'

const CalendarPage = () => {
  const { choreAssignments = [], familyMembers = [] } = useChore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week' | 'stats' | 'schedule'
  const [availabilityData, setAvailabilityData] = useState([])

  // 在宅状況の変更を処理
  const handleAvailabilityChange = (weeklyAnalysis) => {
    setAvailabilityData(weeklyAnalysis)
  }

  // 月間の日付範囲を計算
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // 各日の家事データを取得
  const getDayChores = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return choreAssignments.filter(chore => {
      const choreDate = chore.date || (chore.createdAt ? chore.createdAt.split('T')[0] : null)
      return choreDate === dateStr
    })
  }

  // 週間統計
  const weekStats = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    const weekChores = weekDays.flatMap(getDayChores)
    const completedChores = weekChores.filter(c => c.status === 'completed')
    
    return {
      total: weekChores.length,
      completed: completedChores.length,
      completionRate: weekChores.length > 0 ? Math.round((completedChores.length / weekChores.length) * 100) : 0,
      totalTime: completedChores.reduce((sum, chore) => sum + (chore.estimatedTime || 30), 0)
    }
  }, [currentDate, choreAssignments])

  // 月間統計
  const monthStats = useMemo(() => {
    const monthChores = choreAssignments.filter(chore => {
      const choreDate = chore.date || (chore.createdAt ? chore.createdAt.split('T')[0] : null)
      if (!choreDate) return false
      const chDate = new Date(choreDate)
      return chDate >= monthStart && chDate <= monthEnd
    })
    
    const completedChores = monthChores.filter(c => c.status === 'completed')
    
    // メンバー別統計
    const memberStats = familyMembers.map(member => {
      const memberChores = monthChores.filter(c => c.assignedTo?.memberId === member.id)
      const memberCompleted = memberChores.filter(c => c.status === 'completed')
      
      return {
        id: member.id,
        name: member.name,
        avatar: member.avatar || '👤',
        total: memberChores.length,
        completed: memberCompleted.length,
        completionRate: memberChores.length > 0 ? Math.round((memberCompleted.length / memberChores.length) * 100) : 0,
        totalTime: memberCompleted.reduce((sum, chore) => sum + (chore.estimatedTime || 30), 0)
      }
    })
    
    return {
      total: monthChores.length,
      completed: completedChores.length,
      completionRate: monthChores.length > 0 ? Math.round((completedChores.length / monthChores.length) * 100) : 0,
      totalTime: completedChores.reduce((sum, chore) => sum + (chore.estimatedTime || 30), 0),
      memberStats
    }
  }, [currentDate, choreAssignments, familyMembers, monthStart, monthEnd])

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const getChoreCategoryColor = (category) => {
    const colors = {
      '料理': 'bg-orange-100 text-orange-700 border-orange-200',
      '掃除': 'bg-blue-100 text-blue-700 border-blue-200',
      '洗濯': 'bg-purple-100 text-purple-700 border-purple-200',
      '買い物': 'bg-green-100 text-green-700 border-green-200',
      'その他': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[category] || colors['その他']
  }

  const renderCalendarView = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">月間カレンダー</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="font-medium min-w-32 text-center">
            {format(currentDate, 'yyyy年MM月', { locale: ja })}
          </span>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50 rounded">
            {day}
          </div>
        ))}
        
        {calendarDays.map((date, index) => {
          const dayChores = getDayChores(date)
          const isCurrentMonth = isThisMonth(date)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          
          return (
            <div
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`
                p-2 border rounded-lg min-h-24 cursor-pointer transition-all
                ${isCurrentMonth 
                  ? 'bg-white border-gray-200 hover:bg-blue-50' 
                  : 'bg-gray-50 border-gray-100 text-gray-400'
                }
                ${isToday(date) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
              `}
            >
              <div className="font-medium text-sm mb-1">{format(date, 'd')}</div>
              
              {isCurrentMonth && dayChores.length > 0 && (
                <div className="space-y-1">
                  {dayChores.slice(0, 2).map((chore, idx) => (
                    <div
                      key={idx}
                      className={`
                        text-xs px-1 py-0.5 rounded border text-center
                        ${getChoreCategoryColor(chore.category)}
                        ${chore.status === 'completed' ? 'opacity-75' : ''}
                      `}
                    >
                      {chore.status === 'completed' && (
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      )}
                      {chore.name.length > 6 ? chore.name.substring(0, 6) + '...' : chore.name}
                    </div>
                  ))}
                  
                  {dayChores.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayChores.length - 2}件
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 選択された日の詳細 */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            {format(selectedDate, 'MM月dd日(E)', { locale: ja })}の家事
          </h3>
          
          {getDayChores(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getDayChores(selectedDate).map((chore, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{chore.icon || '📋'}</span>
                    <div>
                      <div className={`font-medium ${chore.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {chore.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {chore.estimatedTime || 30}分 • {chore.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {chore.status === 'completed' ? (
                      <span className="text-green-600 font-medium">完了</span>
                    ) : (
                      <span className="text-gray-400">未完了</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">この日に予定されている家事はありません</p>
          )}
        </div>
      )}
    </div>
  )

  const renderStatsView = () => (
    <div className="space-y-6">
      {/* 週間統計 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          今週の実績
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{weekStats.total}</div>
            <div className="text-sm text-gray-600">総タスク数</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{weekStats.completed}</div>
            <div className="text-sm text-gray-600">完了タスク</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{weekStats.completionRate}%</div>
            <div className="text-sm text-gray-600">完了率</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{Math.round(weekStats.totalTime / 60)}h</div>
            <div className="text-sm text-gray-600">作業時間</div>
          </div>
        </div>
      </div>

      {/* 月間統計 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          {format(currentDate, 'yyyy年MM月', { locale: ja })}の実績
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{monthStats.total}</div>
            <div className="text-sm text-gray-600">総タスク数</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{monthStats.completed}</div>
            <div className="text-sm text-gray-600">完了タスク</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{monthStats.completionRate}%</div>
            <div className="text-sm text-gray-600">完了率</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">{Math.round(monthStats.totalTime / 60)}h</div>
            <div className="text-sm text-gray-600">作業時間</div>
          </div>
        </div>

        {/* メンバー別統計 */}
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          メンバー別実績
        </h3>
        
        <div className="space-y-4">
          {monthStats.memberStats.map(member => (
            <div key={member.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{member.avatar}</span>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">
                      {member.completed}/{member.total} タスク完了
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{member.completionRate}%</div>
                  <div className="text-sm text-gray-600">{Math.round(member.totalTime / 60)}時間</div>
                </div>
              </div>
              
              {/* 進捗バー */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${member.completionRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">家事カレンダー</h1>
            <p className="text-white/80">
              家事の予定と実績を統合管理
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold">
              {format(currentDate, 'yyyy年MM月', { locale: ja })}
            </div>
            <div className="text-white/80 text-sm">
              完了率: {monthStats.completionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* ビュー切り替え */}
      <div className="flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            viewMode === 'month' 
              ? 'bg-purple-100 text-purple-700 border border-purple-300' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          カレンダー
        </button>
        
        <button
          onClick={() => setViewMode('schedule')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            viewMode === 'schedule' 
              ? 'bg-purple-100 text-purple-700 border border-purple-300' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          予定管理
        </button>
        
        <button
          onClick={() => setViewMode('stats')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            viewMode === 'stats' 
              ? 'bg-purple-100 text-purple-700 border border-purple-300' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          統計
        </button>
      </div>

      {/* コンテンツ表示 */}
      {viewMode === 'month' && renderCalendarView()}
      {viewMode === 'schedule' && (
        <ScheduleManager 
          familyMembers={familyMembers}
          onAvailabilityChange={handleAvailabilityChange}
        />
      )}
      {viewMode === 'stats' && renderStatsView()}
    </div>
  )
}

export default CalendarPage
