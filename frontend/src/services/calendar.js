// 在宅状況を考慮したカレンダーサービス
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export class CalendarService {
  constructor() {
    this.storageKey = 'smartChore_familySchedule'
  }

  // 家族の予定を保存
  saveFamilySchedule(schedule) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(schedule))
    } catch (error) {
      console.error('予定保存エラー:', error)
    }
  }

  // 家族の予定を読み込み
  loadFamilySchedule() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('予定読み込みエラー:', error)
      return []
    }
  }

  // 新しい予定を追加
  addEvent(event) {
    const schedule = this.loadFamilySchedule()
    const newEvent = {
      id: Date.now(),
      ...event,
      createdAt: new Date().toISOString()
    }
    schedule.push(newEvent)
    this.saveFamilySchedule(schedule)
    return newEvent
  }

  // 予定を削除
  deleteEvent(eventId) {
    const schedule = this.loadFamilySchedule()
    const updatedSchedule = schedule.filter(event => event.id !== eventId)
    this.saveFamilySchedule(updatedSchedule)
  }

  // 特定の日時でメンバーが在宅かどうかチェック
  isAvailableAt(memberId, dateTime) {
    const schedule = this.loadFamilySchedule()
    const memberEvents = schedule.filter(event => event.memberId === memberId)
    
    const checkDateTime = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
    
    return !memberEvents.some(event => {
      const startTime = parseISO(event.startTime)
      const endTime = parseISO(event.endTime)
      
      return isWithinInterval(checkDateTime, { start: startTime, end: endTime })
    })
  }

  // 特定の日に在宅可能なメンバーを取得
  getAvailableMembersForDay(date, familyMembers) {
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)
    
    return familyMembers.filter(member => {
      // その日の朝6時から夜10時までの間で在宅時間があるかチェック
      const morningCheck = new Date(date)
      morningCheck.setHours(6, 0, 0, 0)
      
      const eveningCheck = new Date(date)
      eveningCheck.setHours(22, 0, 0, 0)
      
      // 朝または夜に在宅していれば家事が可能とみなす
      return this.isAvailableAt(member.id, morningCheck) || 
             this.isAvailableAt(member.id, eveningCheck)
    })
  }

  // 特定の期間でメンバーの在宅率を計算
  calculateAvailabilityRate(memberId, startDate, endDate) {
    const schedule = this.loadFamilySchedule()
    const memberEvents = schedule.filter(event => 
      event.memberId === memberId &&
      parseISO(event.startTime) >= startDate &&
      parseISO(event.endTime) <= endDate
    )

    // 簡易計算：イベント数から在宅率を推定
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    const busyDays = memberEvents.length
    
    return Math.max(0, (totalDays - busyDays) / totalDays)
  }

  // 家事分担時の在宅状況分析
  analyzeAvailabilityForChores(familyMembers, targetDate) {
    const availableMembers = this.getAvailableMembersForDay(targetDate, familyMembers)
    
    const analysis = {
      date: format(targetDate, 'yyyy-MM-dd'),
      totalMembers: familyMembers.length,
      availableMembers: availableMembers.length,
      availabilityRate: familyMembers.length > 0 ? availableMembers.length / familyMembers.length : 0,
      unavailableMembers: familyMembers.filter(member => 
        !availableMembers.some(available => available.id === member.id)
      ),
      recommendations: []
    }

    // 推奨事項を生成
    if (analysis.availabilityRate < 0.5) {
      analysis.recommendations.push({
        type: 'warning',
        message: `${format(targetDate, 'M月d日')}は在宅メンバーが少ないため、前日または翌日に家事を調整することをお勧めします`
      })
    }

    if (analysis.availableMembers.length === 1) {
      analysis.recommendations.push({
        type: 'info',
        message: `在宅メンバーが${availableMembers[0].name}さんのみです。負荷を軽減するため簡単な家事を中心に計画しましょう`
      })
    }

    return analysis
  }

  // 週間の在宅パターンを分析
  analyzeWeeklyPattern(familyMembers, weekStart) {
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      weekDays.push(date)
    }

    const dayNames = ['日', '月', '火', '水', '木', '金', '土']

    return weekDays.map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      dayOfWeek: dayNames[date.getDay()],
      availableMembers: this.getAvailableMembersForDay(date, familyMembers),
      analysis: this.analyzeAvailabilityForChores(familyMembers, date)
    }))
  }
}

export default CalendarService