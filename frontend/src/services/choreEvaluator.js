// 家事分担評価とサポート機能

export class ChoreAssignmentEvaluator {
  constructor() {
    this.fairnessThreshold = 0.7 // 70%未満は不公平と判定
    this.overloadThreshold = 1.5 // 平均の1.5倍以上は過負荷
    this.underloadThreshold = 0.5 // 平均の0.5倍未満は負荷不足
  }

  // 分担の公平性を評価
  evaluateAssignment(familyMembers, choreAssignments, calendarEvents = []) {
    const workloadAnalysis = this.analyzeWorkload(familyMembers, choreAssignments)
    const fairnessScore = this.calculateFairnessScore(workloadAnalysis)
    const detailedScores = this.getDetailedScores(workloadAnalysis) // 詳細スコアを追加
    const personalizedSuggestions = this.generatePersonalizedSuggestions(
      workloadAnalysis, 
      familyMembers, 
      calendarEvents
    )
    
    return {
      fairnessScore,
      detailedScores, // 詳細スコアを追加
      workloadAnalysis,
      personalizedSuggestions,
      overallAssessment: this.getOverallAssessment(fairnessScore),
      actionItems: this.generateActionItems(workloadAnalysis, fairnessScore)
    }
  }
  
  // 詳細スコアを取得
  getDetailedScores(workloadAnalysis) {
    const workloads = Object.values(workloadAnalysis)
    
    return {
      timeBalance: this.calculateTimeBalanceScore(workloads),
      taskCount: this.calculateTaskCountScore(workloads),
      difficulty: this.calculateDifficultyScore(workloads),
      skillAlignment: this.calculateSkillAlignmentScore(workloads),
      completion: this.calculateCompletionScore(workloads)
    }
  }

  // 各メンバーの負荷を分析
  analyzeWorkload(familyMembers, choreAssignments) {
    const today = new Date().toISOString().split('T')[0]
    const todayChores = choreAssignments.filter(chore => 
      (chore.date || chore.createdAt?.split('T')[0]) === today
    )

    const workload = {}
    familyMembers.forEach(member => {
      workload[member.id] = {
        member,
        totalTime: 0,
        totalChores: 0,
        averageDifficulty: 0,
        chores: [],
        completedChores: 0,
        skillAlignment: 0 // スキルとタスクの適合度
      }
    })

    // 負荷を計算
    todayChores.forEach(chore => {
      const memberId = chore.assignedTo?.memberId
      if (memberId && workload[memberId]) {
        workload[memberId].totalTime += chore.estimatedTime || 0
        workload[memberId].totalChores += 1
        workload[memberId].chores.push(chore)
        if (chore.status === 'completed') {
          workload[memberId].completedChores += 1
        }
        
        // スキル適合度を計算
        const member = workload[memberId].member
        const choreSkill = this.getChoreMainSkill(chore)
        const memberSkillLevel = member.skills?.[choreSkill] || 1
        workload[memberId].skillAlignment += memberSkillLevel
      }
    })

    // 平均難易度とスキル適合度を計算
    Object.values(workload).forEach(memberData => {
      if (memberData.totalChores > 0) {
        const totalDifficulty = memberData.chores.reduce((sum, chore) => sum + (chore.difficulty || 0), 0)
        memberData.averageDifficulty = totalDifficulty / memberData.totalChores
        memberData.skillAlignment = memberData.skillAlignment / memberData.totalChores
      }
    })

    return workload
  }

  // 公平性スコアを計算（改善版）
  calculateFairnessScore(workloadAnalysis) {
    const workloads = Object.values(workloadAnalysis)
    if (workloads.length <= 1) return 1.0

    // 1. 時間バランススコア（40%）
    const timeScore = this.calculateTimeBalanceScore(workloads)
    
    // 2. タスク数バランススコア（25%）
    const taskCountScore = this.calculateTaskCountScore(workloads)
    
    // 3. 難易度バランススコア（20%）
    const difficultyScore = this.calculateDifficultyScore(workloads)
    
    // 4. スキル適合度スコア（10%）
    const skillScore = this.calculateSkillAlignmentScore(workloads)
    
    // 5. 完了率スコア（5%）
    const completionScore = this.calculateCompletionScore(workloads)
    
    // 重み付き総合スコア
    const totalScore = (
      timeScore * 0.40 +
      taskCountScore * 0.25 +
      difficultyScore * 0.20 +
      skillScore * 0.10 +
      completionScore * 0.05
    )
    
    console.log('📊 公平性スコア詳細:', {
      総合スコア: Math.round(totalScore * 100) + '%',
      時間バランス: Math.round(timeScore * 100) + '%',
      タスク数バランス: Math.round(taskCountScore * 100) + '%',
      難易度バランス: Math.round(difficultyScore * 100) + '%',
      スキル適合度: Math.round(skillScore * 100) + '%',
      完了率: Math.round(completionScore * 100) + '%'
    })
    
    return Math.max(0, Math.min(1, totalScore))
  }
  
  // 時間バランススコアを計算
  calculateTimeBalanceScore(workloads) {
    const times = workloads.map(w => w.totalTime)
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    
    if (avgTime === 0) return 1.0
    
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
    const coefficient = Math.sqrt(variance) / avgTime
    
    // 変動係数が小さいほど公平性が高い
    return Math.max(0, 1 - coefficient)
  }
  
  // タスク数バランススコアを計算
  calculateTaskCountScore(workloads) {
    const taskCounts = workloads.map(w => w.totalChores)
    const avgTasks = taskCounts.reduce((sum, count) => sum + count, 0) / taskCounts.length
    
    if (avgTasks === 0) return 1.0
    
    const variance = taskCounts.reduce((sum, count) => sum + Math.pow(count - avgTasks, 2), 0) / taskCounts.length
    const coefficient = Math.sqrt(variance) / avgTasks
    
    return Math.max(0, 1 - coefficient)
  }
  
  // 難易度バランススコアを計算
  calculateDifficultyScore(workloads) {
    const difficulties = workloads
      .filter(w => w.totalChores > 0)
      .map(w => w.averageDifficulty)
    
    if (difficulties.length <= 1) return 1.0
    
    const avgDifficulty = difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length
    
    if (avgDifficulty === 0) return 1.0
    
    const variance = difficulties.reduce((sum, diff) => sum + Math.pow(diff - avgDifficulty, 2), 0) / difficulties.length
    const coefficient = Math.sqrt(variance) / avgDifficulty
    
    return Math.max(0, 1 - coefficient)
  }
  
  // スキル適合度スコアを計算
  calculateSkillAlignmentScore(workloads) {
    const validWorkloads = workloads.filter(w => w.totalChores > 0)
    
    if (validWorkloads.length === 0) return 1.0
    
    const avgSkillAlignment = validWorkloads.reduce((sum, w) => sum + w.skillAlignment, 0) / validWorkloads.length
    
    // スキル適合度が5点満点で3点以上なら良好とする
    return Math.min(1.0, avgSkillAlignment / 5.0)
  }
  
  // 完了率スコアを計算
  calculateCompletionScore(workloads) {
    const validWorkloads = workloads.filter(w => w.totalChores > 0)
    
    if (validWorkloads.length === 0) return 1.0
    
    const completionRates = validWorkloads.map(w => w.completedChores / w.totalChores)
    const avgCompletionRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    
    return avgCompletionRate
  }

  // 個人向けの提案を生成
  generatePersonalizedSuggestions(workloadAnalysis, familyMembers, calendarEvents) {
    const suggestions = []
    const workloads = Object.values(workloadAnalysis)
    const avgTime = workloads.reduce((sum, w) => sum + w.totalTime, 0) / workloads.length

    workloads.forEach(memberData => {
      const member = memberData.member
      const memberSuggestions = []

      // 過負荷の場合
      if (memberData.totalTime > avgTime * this.overloadThreshold) {
        memberSuggestions.push({
          type: 'appreciation',
          message: `${member.name}さん、いつもたくさんの家事をありがとうございます！`,
          icon: '🙏'
        })
        memberSuggestions.push({
          type: 'support',
          message: '負荷が高めです。他の家族に分担をお願いしましょう。',
          icon: '🤝',
          actionable: true,
          action: 'redistribute_tasks'
        })
        memberSuggestions.push({
          type: 'wellness',
          message: '無理をせず、適度に休憩を取ってくださいね。',
          icon: '💆‍♀️'
        })
      }

      // 負荷が少ない場合
      else if (memberData.totalTime < avgTime * this.underloadThreshold && avgTime > 0) {
        memberSuggestions.push({
          type: 'encouragement',
          message: `${member.name}さん、もう少し家事を手伝っていただけると助かります。`,
          icon: '📈'
        })
        memberSuggestions.push({
          type: 'opportunity',
          message: 'スキルアップのチャンスです！新しい家事に挑戦してみませんか？',
          icon: '🌟',
          actionable: true,
          action: 'suggest_new_tasks'
        })
      }

      // スキル適合度が低い場合
      if (memberData.skillAlignment < 3 && memberData.totalChores > 0) {
        memberSuggestions.push({
          type: 'skill_development',
          message: 'より得意な分野の家事を担当すると効率的です。',
          icon: '🎯',
          actionable: true,
          action: 'optimize_skills'
        })
      }

      // 完了率が高い場合の褒め言葉
      const completionRate = memberData.totalChores > 0 ? memberData.completedChores / memberData.totalChores : 0
      if (completionRate >= 0.8) {
        memberSuggestions.push({
          type: 'praise',
          message: `素晴らしい！完了率${Math.round(completionRate * 100)}%は立派です。`,
          icon: '🎉'
        })
      }

      // カレンダーイベントを考慮した提案
      const todayEvents = calendarEvents.filter(event => 
        event.date === new Date().toISOString().split('T')[0] && 
        event.memberId === member.id
      )
      
      if (todayEvents.length > 0 && memberData.totalTime > avgTime) {
        memberSuggestions.push({
          type: 'understanding',
          message: `今日は予定があるのに家事もお疲れ様です。`,
          icon: '😌'
        })
      }

      if (memberSuggestions.length > 0) {
        suggestions.push({
          memberId: member.id,
          memberName: member.name,
          memberAvatar: member.avatar,
          suggestions: memberSuggestions,
          workloadLevel: this.getWorkloadLevel(memberData.totalTime, avgTime)
        })
      }
    })

    return suggestions
  }

  // 全体的な評価を取得
  getOverallAssessment(fairnessScore) {
    if (fairnessScore >= 0.8) {
      return {
        level: 'excellent',
        message: '家事分担が非常に公平でバランスが取れています',
        color: 'text-green-600 bg-green-100',
        icon: '🌟'
      }
    } else if (fairnessScore >= 0.6) {
      return {
        level: 'good',
        message: '家事分担は概ね良好ですが、少し調整の余地があります',
        color: 'text-blue-600 bg-blue-100',
        icon: '👍'
      }
    } else if (fairnessScore >= 0.4) {
      return {
        level: 'needs_improvement',
        message: '家事分担に偏りがあります。調整をお勧めします',
        color: 'text-yellow-600 bg-yellow-100',
        icon: '⚠️'
      }
    } else {
      return {
        level: 'poor',
        message: '家事分担が大きく偏っています。早急な調整が必要です',
        color: 'text-red-600 bg-red-100',
        icon: '🚨'
      }
    }
  }

  // アクションアイテムを生成
  generateActionItems(workloadAnalysis, fairnessScore) {
    const actionItems = []
    const workloads = Object.values(workloadAnalysis)
    const avgTime = workloads.reduce((sum, w) => sum + w.totalTime, 0) / workloads.length

    // 公平性が低い場合の対策
    if (fairnessScore < this.fairnessThreshold) {
      actionItems.push({
        priority: 'high',
        title: '家事の再分担',
        description: '負荷の高いメンバーから負荷の低いメンバーへ家事を移動',
        action: 'redistribute_workload'
      })
    }

    // 過負荷メンバーがいる場合
    const overloadedMembers = workloads.filter(w => w.totalTime > avgTime * this.overloadThreshold)
    if (overloadedMembers.length > 0) {
      actionItems.push({
        priority: 'high',
        title: '負荷軽減',
        description: `${overloadedMembers.map(w => w.member.name).join('、')}さんの負荷を軽減`,
        action: 'reduce_overload',
        affectedMembers: overloadedMembers.map(w => w.member.id)
      })
    }

    // スキル最適化の提案
    const skillMismatchMembers = workloads.filter(w => w.skillAlignment < 3 && w.totalChores > 0)
    if (skillMismatchMembers.length > 0) {
      actionItems.push({
        priority: 'medium',
        title: 'スキル最適化',
        description: 'メンバーの得意分野に応じた家事の再配置',
        action: 'optimize_skills',
        affectedMembers: skillMismatchMembers.map(w => w.member.id)
      })
    }

    return actionItems
  }

  // 負荷レベルを取得
  getWorkloadLevel(memberTime, avgTime) {
    if (avgTime === 0) return 'normal'
    
    const ratio = memberTime / avgTime
    if (ratio > this.overloadThreshold) return 'high'
    if (ratio < this.underloadThreshold) return 'low'
    return 'normal'
  }

  // 家事の主要スキルを取得
  getChoreMainSkill(chore) {
    // 家事名から主要スキルを推定
    const skillMapping = {
      '料理': 'cooking',
      '朝食': 'cooking',
      '夕食': 'cooking',
      '掃除': 'cleaning',
      '洗濯': 'laundry',
      '買い物': 'shopping',
      '育児': 'childcare',
      'メンテナンス': 'maintenance'
    }

    for (const [keyword, skill] of Object.entries(skillMapping)) {
      if (chore.name.includes(keyword) || chore.category?.includes(keyword)) {
        return skill
      }
    }

    return 'cleaning' // デフォルト
  }

  // 具体的な改善提案を生成
  generateImprovementSuggestions(workloadAnalysis, familyMembers) {
    const suggestions = []
    const workloads = Object.values(workloadAnalysis)
    const avgTime = workloads.reduce((sum, w) => sum + w.totalTime, 0) / workloads.length

    // 負荷の再分散提案
    const overloaded = workloads.filter(w => w.totalTime > avgTime * 1.3)
    const underloaded = workloads.filter(w => w.totalTime < avgTime * 0.7)

    if (overloaded.length > 0 && underloaded.length > 0) {
      overloaded.forEach(overloadedMember => {
        // 移動可能な家事を特定
        const transferableChores = overloadedMember.chores
          .filter(chore => chore.difficulty <= 6) // 難易度6以下
          .sort((a, b) => a.estimatedTime - b.estimatedTime) // 時間の短い順

        if (transferableChores.length > 0) {
          const targetMember = underloaded[0] // 最も負荷の少ないメンバー
          suggestions.push({
            type: 'task_transfer',
            from: overloadedMember.member,
            to: targetMember.member,
            chore: transferableChores[0],
            reason: '負荷バランスの改善',
            expectedImprovement: '公平性の向上'
          })
        }
      })
    }

    return suggestions
  }
}

// シングルトンインスタンス
export const choreEvaluator = new ChoreAssignmentEvaluator()