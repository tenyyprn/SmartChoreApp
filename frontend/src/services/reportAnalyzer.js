// レポート分析とサマライズ機能

import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, eachDayOfInterval, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'

export class ReportAnalyzer {
  constructor() {
    this.periodTypes = {
      WEEK: 'week',
      MONTH: 'month'
    }
  }

  // 週間レポートを生成
  generateWeeklyReport(familyMembers, choreAssignments, calendarEvents = [], targetDate = new Date()) {
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }) // 月曜始まり
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 })
    
    const weeklyData = this.analyzePerformance(
      familyMembers, 
      choreAssignments, 
      weekStart, 
      weekEnd,
      this.periodTypes.WEEK
    )

    return {
      period: {
        type: 'week',
        start: weekStart,
        end: weekEnd,
        label: `${format(weekStart, 'MM月dd日', { locale: ja })} - ${format(weekEnd, 'MM月dd日', { locale: ja })}`
      },
      ...weeklyData,
      insights: this.generateWeeklyInsights(weeklyData, familyMembers),
      recommendations: this.generateWeeklyRecommendations(weeklyData, familyMembers)
    }
  }

  // 月間レポートを生成
  generateMonthlyReport(familyMembers, choreAssignments, calendarEvents = [], targetDate = new Date()) {
    const monthStart = startOfMonth(targetDate)
    const monthEnd = endOfMonth(targetDate)
    
    const monthlyData = this.analyzePerformance(
      familyMembers, 
      choreAssignments, 
      monthStart, 
      monthEnd,
      this.periodTypes.MONTH
    )

    // 週別のトレンド分析
    const weeklyTrends = this.analyzeWeeklyTrends(familyMembers, choreAssignments, monthStart, monthEnd)

    return {
      period: {
        type: 'month',
        start: monthStart,
        end: monthEnd,
        label: format(monthStart, 'yyyy年MM月', { locale: ja })
      },
      ...monthlyData,
      weeklyTrends,
      insights: this.generateMonthlyInsights(monthlyData, weeklyTrends, familyMembers),
      recommendations: this.generateMonthlyRecommendations(monthlyData, weeklyTrends, familyMembers)
    }
  }

  // パフォーマンス分析
  analyzePerformance(familyMembers, choreAssignments, startDate, endDate, periodType) {
    const startDateStr = format(startDate, 'yyyy-MM-dd')
    const endDateStr = format(endDate, 'yyyy-MM-dd')
    
    // 対象期間の家事を抽出
    const periodChores = choreAssignments.filter(chore => {
      const choreDate = chore.date || chore.createdAt?.split('T')[0]
      return choreDate >= startDateStr && choreDate <= endDateStr
    })

    // メンバー別の統計
    const memberStats = {}
    familyMembers.forEach(member => {
      memberStats[member.id] = {
        member,
        totalChores: 0,
        completedChores: 0,
        totalTime: 0,
        completedTime: 0,
        averageDifficulty: 0,
        skillCategories: {},
        dailyActivity: this.getDailyActivity(member.id, periodChores, startDate, endDate),
        completionRate: 0,
        efficiency: 0,
        consistency: 0
      }
    })

    // 統計を計算
    periodChores.forEach(chore => {
      const memberId = chore.assignedTo?.memberId
      if (memberId && memberStats[memberId]) {
        const stats = memberStats[memberId]
        stats.totalChores += 1
        stats.totalTime += chore.estimatedTime || 0
        
        if (chore.status === 'completed') {
          stats.completedChores += 1
          stats.completedTime += chore.estimatedTime || 0
        }
        
        // カテゴリ別統計
        const category = chore.category || 'その他'
        if (!stats.skillCategories[category]) {
          stats.skillCategories[category] = { total: 0, completed: 0 }
        }
        stats.skillCategories[category].total += 1
        if (chore.status === 'completed') {
          stats.skillCategories[category].completed += 1
        }
      }
    })

    // 完了率と効率性を計算
    Object.values(memberStats).forEach(stats => {
      stats.completionRate = stats.totalChores > 0 ? stats.completedChores / stats.totalChores : 0
      stats.efficiency = stats.totalTime > 0 ? stats.completedTime / stats.totalTime : 0
      stats.averageDifficulty = this.calculateAverageDifficulty(stats, periodChores)
      stats.consistency = this.calculateConsistency(stats.dailyActivity)
    })

    // 全体統計
    const overallStats = {
      totalChores: periodChores.length,
      completedChores: periodChores.filter(c => c.status === 'completed').length,
      overallCompletionRate: 0,
      totalTimeSpent: Object.values(memberStats).reduce((sum, s) => sum + s.completedTime, 0),
      averageFairness: this.calculatePeriodFairness(memberStats),
      mostActiveDay: this.findMostActiveDay(periodChores, startDate, endDate),
      categoryBreakdown: this.getCategoryBreakdown(periodChores)
    }
    
    overallStats.overallCompletionRate = overallStats.totalChores > 0 
      ? overallStats.completedChores / overallStats.totalChores 
      : 0

    return {
      memberStats,
      overallStats,
      achievements: this.identifyAchievements(memberStats, overallStats, periodType),
      challenges: this.identifyChallenges(memberStats, overallStats)
    }
  }

  // 日別のアクティビティを取得
  getDailyActivity(memberId, choreAssignments, startDate, endDate) {
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const activity = {}
    
    days.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayChores = choreAssignments.filter(chore => 
        (chore.date || chore.createdAt?.split('T')[0]) === dayStr &&
        chore.assignedTo?.memberId === memberId
      )
      
      activity[dayStr] = {
        total: dayChores.length,
        completed: dayChores.filter(c => c.status === 'completed').length,
        timeSpent: dayChores.filter(c => c.status === 'completed')
          .reduce((sum, c) => sum + (c.estimatedTime || 0), 0)
      }
    })
    
    return activity
  }

  // 平均難易度を計算
  calculateAverageDifficulty(memberStats, allChores) {
    const memberChores = allChores.filter(c => c.assignedTo?.memberId === memberStats.member.id)
    if (memberChores.length === 0) return 0
    
    const totalDifficulty = memberChores.reduce((sum, c) => sum + (c.difficulty || 0), 0)
    return totalDifficulty / memberChores.length
  }

  // 一貫性を計算
  calculateConsistency(dailyActivity) {
    const activities = Object.values(dailyActivity)
    if (activities.length === 0) return 0
    
    const completionRates = activities.map(day => 
      day.total > 0 ? day.completed / day.total : 0
    )
    
    const avgRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - avgRate, 2), 0) / completionRates.length
    
    // 分散が小さいほど一貫性が高い
    return Math.max(0, 1 - Math.sqrt(variance))
  }

  // 期間の公平性を計算
  calculatePeriodFairness(memberStats) {
    const workloads = Object.values(memberStats).map(s => s.totalTime)
    if (workloads.length <= 1) return 1
    
    const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length
    if (avgWorkload === 0) return 1
    
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length
    const coefficient = Math.sqrt(variance) / avgWorkload
    
    return Math.max(0, 1 - coefficient)
  }

  // 最もアクティブな日を特定
  findMostActiveDay(choreAssignments, startDate, endDate) {
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    let maxActivity = 0
    let mostActiveDay = null
    
    days.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayChores = choreAssignments.filter(c => 
        (c.date || c.createdAt?.split('T')[0]) === dayStr && c.status === 'completed'
      )
      
      if (dayChores.length > maxActivity) {
        maxActivity = dayChores.length
        mostActiveDay = {
          date: day,
          completedChores: dayChores.length,
          dayOfWeek: format(day, 'EEEE', { locale: ja })
        }
      }
    })
    
    return mostActiveDay
  }

  // カテゴリ別の内訳を取得
  getCategoryBreakdown(choreAssignments) {
    const breakdown = {}
    
    choreAssignments.forEach(chore => {
      const category = chore.category || 'その他'
      if (!breakdown[category]) {
        breakdown[category] = { total: 0, completed: 0 }
      }
      breakdown[category].total += 1
      if (chore.status === 'completed') {
        breakdown[category].completed += 1
      }
    })
    
    return breakdown
  }

  // 実績を特定
  identifyAchievements(memberStats, overallStats, periodType) {
    const achievements = []
    
    // 高い完了率
    Object.values(memberStats).forEach(stats => {
      if (stats.completionRate >= 0.9 && stats.totalChores >= 5) {
        achievements.push({
          type: 'high_completion',
          member: stats.member,
          value: Math.round(stats.completionRate * 100),
          message: `${stats.member.name}さんが完了率${Math.round(stats.completionRate * 100)}%を達成`
        })
      }
    })
    
    // 一貫性の高さ
    Object.values(memberStats).forEach(stats => {
      if (stats.consistency >= 0.8 && stats.totalChores >= 7) {
        achievements.push({
          type: 'consistency',
          member: stats.member,
          value: Math.round(stats.consistency * 100),
          message: `${stats.member.name}さんが安定した家事実行を維持`
        })
      }
    })
    
    // 全体の完了率
    if (overallStats.overallCompletionRate >= 0.85) {
      achievements.push({
        type: 'team_completion',
        value: Math.round(overallStats.overallCompletionRate * 100),
        message: `家族全体で完了率${Math.round(overallStats.overallCompletionRate * 100)}%を達成`
      })
    }
    
    return achievements
  }

  // 課題を特定
  identifyChallenges(memberStats, overallStats) {
    const challenges = []
    
    // 低い完了率
    Object.values(memberStats).forEach(stats => {
      if (stats.completionRate < 0.6 && stats.totalChores >= 3) {
        challenges.push({
          type: 'low_completion',
          member: stats.member,
          value: Math.round(stats.completionRate * 100),
          message: `${stats.member.name}さんの完了率が${Math.round(stats.completionRate * 100)}%と低め`,
          suggestion: 'タスクの難易度や量を調整することを検討'
        })
      }
    })
    
    // 負荷の偏り
    const workloads = Object.values(memberStats).map(s => s.totalTime)
    const maxWorkload = Math.max(...workloads)
    const minWorkload = Math.min(...workloads)
    
    if (maxWorkload > minWorkload * 2 && maxWorkload > 0) {
      challenges.push({
        type: 'workload_imbalance',
        message: '家事の負荷に大きな偏りが見られます',
        suggestion: 'AI分担機能を使用して負荷を均等化'
      })
    }
    
    return challenges
  }

  // 週別トレンドを分析
  analyzeWeeklyTrends(familyMembers, choreAssignments, monthStart, monthEnd) {
    const weeks = []
    let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    
    while (weekStart <= monthEnd) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      const weekData = this.analyzePerformance(familyMembers, choreAssignments, weekStart, weekEnd, 'week')
      
      weeks.push({
        weekNumber: weeks.length + 1,
        start: weekStart,
        end: weekEnd,
        completionRate: weekData.overallStats.overallCompletionRate,
        totalChores: weekData.overallStats.totalChores,
        fairnessScore: weekData.overallStats.averageFairness
      })
      
      weekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    }
    
    return weeks
  }

  // 週間インサイトを生成
  generateWeeklyInsights(weeklyData, familyMembers) {
    const insights = []
    
    // パフォーマンストレンド
    if (weeklyData.overallStats.overallCompletionRate >= 0.8) {
      insights.push({
        type: 'positive',
        title: '順調な一週間',
        message: 'この週は家族全体で良いペースで家事が完了しています'
      })
    }
    
    // 最も貢献したメンバー
    const topPerformer = Object.values(weeklyData.memberStats)
      .sort((a, b) => b.completedTime - a.completedTime)[0]
    
    if (topPerformer && topPerformer.completedTime > 0) {
      insights.push({
        type: 'recognition',
        title: '今週のMVP',
        message: `${topPerformer.member.name}さんが最も多くの家事を完了しました`
      })
    }
    
    return insights
  }

  // 週間推奨事項を生成
  generateWeeklyRecommendations(weeklyData, familyMembers) {
    const recommendations = []
    
    // 来週への提案
    if (weeklyData.overallStats.overallCompletionRate < 0.7) {
      recommendations.push({
        priority: 'high',
        title: '来週の目標設定',
        action: '家事の優先順位を見直し、完了しやすいタスクから始める'
      })
    }
    
    // バランス改善
    if (weeklyData.overallStats.averageFairness < 0.6) {
      recommendations.push({
        priority: 'medium',
        title: '負荷バランスの調整',
        action: 'AI分担機能を使用して来週の分担を最適化'
      })
    }
    
    return recommendations
  }

  // 月間インサイトを生成
  generateMonthlyInsights(monthlyData, weeklyTrends, familyMembers) {
    const insights = []
    
    // 月間トレンド
    if (weeklyTrends.length >= 2) {
      const firstWeek = weeklyTrends[0].completionRate
      const lastWeek = weeklyTrends[weeklyTrends.length - 1].completionRate
      
      if (lastWeek > firstWeek + 0.1) {
        insights.push({
          type: 'trend',
          title: '改善トレンド',
          message: '月を通して家事の完了率が向上しています'
        })
      }
    }
    
    // 月間総括
    const totalTimeSpent = monthlyData.overallStats.totalTimeSpent
    if (totalTimeSpent > 0) {
      insights.push({
        type: 'summary',
        title: '月間実績',
        message: `家族全体で${Math.round(totalTimeSpent / 60)}時間の家事を完了しました`
      })
    }
    
    return insights
  }

  // 月間推奨事項を生成
  generateMonthlyRecommendations(monthlyData, weeklyTrends, familyMembers) {
    const recommendations = []
    
    // 来月への改善提案
    const challenges = monthlyData.challenges
    if (challenges.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '来月の改善目標',
        action: '特定されたチャレンジに焦点を当てた改善計画の実施'
      })
    }
    
    // 成功パターンの継続
    const achievements = monthlyData.achievements
    if (achievements.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: '成功パターンの維持',
        action: '今月の成功要因を来月も継続実施'
      })
    }
    
    return recommendations
  }
}

// シングルトンインスタンス
export const reportAnalyzer = new ReportAnalyzer()