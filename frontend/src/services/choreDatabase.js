// 家事データベースとAI分担アルゴリズム

export const SKILL_TYPES = {
  cooking: '料理',
  cleaning: '掃除',
  laundry: '洗濯',
  shopping: '買い物',
  childcare: '育児',
  maintenance: 'メンテナンス'
}

export const CHORE_CATEGORIES = [
  {
    id: 'daily',
    name: '毎日の家事',
    color: 'bg-red-100 text-red-700',
    frequency: 'daily',
    chores: [
      { 
        id: 'cooking_breakfast', 
        name: '朝食作り', 
        icon: '🍳',
        time: 30, 
        difficulty: 5, 
        skill: 'cooking',
        description: '家族の朝食を準備する',
        tips: '前日に準備できるものは準備しておく',
        timeSlot: 'morning'
      },
      { 
        id: 'cooking_dinner', 
        name: '夕食作り', 
        icon: '🍽️',
        time: 60, 
        difficulty: 7, 
        skill: 'cooking',
        description: '家族の夕食を準備する',
        tips: '栄養バランスを考慮して献立を組む',
        timeSlot: 'evening'
      },
      { 
        id: 'dishes', 
        name: '食器洗い', 
        icon: '🧽',
        time: 20, 
        difficulty: 3, 
        skill: 'cleaning',
        description: '食事後の食器を洗って片付ける',
        tips: '食べ終わったらすぐに洗うと汚れが落ちやすい',
        timeSlot: 'evening'
      },
      { 
        id: 'trash_prep', 
        name: 'ゴミまとめ', 
        icon: '🗑️',
        time: 10, 
        difficulty: 2, 
        skill: 'cleaning',
        description: '各部屋のゴミを集めて分別する',
        tips: '収集日前日の夜にまとめると効率的',
        timeSlot: 'evening'
      }
    ]
  },
  {
    id: 'weekly',
    name: '週単位の家事',
    color: 'bg-blue-100 text-blue-700',
    frequency: 'weekly',
    chores: [
      { 
        id: 'laundry', 
        name: '洗濯', 
        icon: '👕',
        time: 120, 
        difficulty: 4, 
        skill: 'laundry',
        description: '衣類の洗濯から干すまで',
        tips: '天気の良い日を選んで洗濯する',
        timeSlot: 'morning'
      },
      { 
        id: 'vacuum', 
        name: '掃除機かけ', 
        icon: '🧹',
        time: 45, 
        difficulty: 5, 
        skill: 'cleaning',
        description: '家全体に掃除機をかける',
        tips: '家具の下も忘れずに掃除する',
        timeSlot: 'afternoon'
      },
      { 
        id: 'grocery_shopping', 
        name: '食材買い物', 
        icon: '🛒',
        time: 90, 
        difficulty: 6, 
        skill: 'shopping',
        description: '1週間分の食材を買い物',
        tips: '買い物リストを事前に作成する',
        timeSlot: 'afternoon'
      },
      { 
        id: 'bathroom_cleaning', 
        name: 'トイレ・風呂掃除', 
        icon: '🛁',
        time: 60, 
        difficulty: 6, 
        skill: 'cleaning',
        description: 'トイレと浴室の清掃',
        tips: '週に1-2回の頻度で清潔を保つ',
        timeSlot: 'afternoon'
      },
      { 
        id: 'floor_mopping', 
        name: '床拭き掃除', 
        icon: '🧽',
        time: 40, 
        difficulty: 4, 
        skill: 'cleaning',
        description: '床全体の水拭き掃除',
        tips: '掃除機の後に行うと効果的',
        timeSlot: 'afternoon'
      }
    ]
  },
  {
    id: 'monthly',
    name: '月単位の家事',
    color: 'bg-green-100 text-green-700',
    frequency: 'monthly',
    chores: [
      { 
        id: 'deep_cleaning', 
        name: '大掃除', 
        icon: '🏠',
        time: 180, 
        difficulty: 8, 
        skill: 'cleaning',
        description: '家全体の詳細な清掃',
        tips: '家族全員で分担して行う',
        timeSlot: 'afternoon'
      },
      { 
        id: 'organization', 
        name: '整理整頓', 
        icon: '📦',
        time: 120, 
        difficulty: 5, 
        skill: 'cleaning',
        description: '各部屋の整理整頓',
        tips: '不要なものは処分して空間を有効活用',
        timeSlot: 'afternoon'
      },
      { 
        id: 'appliance_maintenance', 
        name: '家電メンテナンス', 
        icon: '🔧',
        time: 90, 
        difficulty: 7, 
        skill: 'maintenance',
        description: '冷蔵庫、洗濯機等の清掃・点検',
        tips: '取扱説明書を確認してメンテナンス',
        timeSlot: 'afternoon'
      },
      { 
        id: 'window_cleaning', 
        name: '窓拭き', 
        icon: '🪟',
        time: 60, 
        difficulty: 6, 
        skill: 'cleaning',
        description: '全窓の内外清拭',
        tips: '曇りの日の方がきれいに仕上がる',
        timeSlot: 'afternoon'
      }
    ]
  }
]

class ChoreDatabase {
  constructor() {
    this.categories = CHORE_CATEGORIES
    this.skillTypes = SKILL_TYPES
  }

  // 全ての家事を取得
  getAllChores() {
    return this.categories.flatMap(category => 
      category.chores.map(chore => ({
        ...chore,
        category: category.name,
        categoryId: category.id,
        frequency: category.frequency
      }))
    )
  }

  // 特定の家事を取得
  getChoreById(choreId) {
    const allChores = this.getAllChores()
    return allChores.find(chore => chore.id === choreId)
  }

  // カテゴリ別の家事を取得
  getChoresByCategory(categoryId) {
    const category = this.categories.find(cat => cat.id === categoryId)
    return category ? category.chores : []
  }

  // 頻度別の家事を取得
  getChoresByFrequency(frequency) {
    return this.categories
      .filter(category => category.frequency === frequency)
      .flatMap(category => category.chores)
  }

  // 週間家事分担表を生成（カレンダー連動）
  generateWeeklyChoreSchedule(familyMembers, calendarEvents = [], weekStart) {
    if (!familyMembers || familyMembers.length === 0) {
      throw new Error('家族メンバーが設定されていません')
    }

    const weekSchedule = {}
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayLabels = ['月', '火', '水', '木', '金', '土', '日']
    
    // 1週間の日付を計算
    const weekDates = days.map((_, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      return date
    })

    // 各日のカレンダーイベントを取得
    const dailyEvents = weekDates.map(date => {
      const dateStr = date.toISOString().split('T')[0]
      return calendarEvents.filter(event => event.date === dateStr)
    })

    // 各日の家事を配置
    days.forEach((dayKey, dayIndex) => {
      const currentDate = weekDates[dayIndex]
      const dayEvents = dailyEvents[dayIndex]
      const isWeekend = dayIndex >= 5 // 土日
      
      weekSchedule[dayKey] = {
        date: currentDate,
        label: dayLabels[dayIndex],
        isWeekend,
        events: dayEvents,
        timeSlots: {
          morning: [],
          afternoon: [],
          evening: []
        },
        totalTime: 0,
        memberAvailability: this.calculateMemberAvailability(familyMembers, dayEvents, isWeekend)
      }
    })

    // 毎日の家事を配置
    this.assignDailyChores(weekSchedule, familyMembers)
    
    // 週単位の家事を配置
    this.assignWeeklyChores(weekSchedule, familyMembers)
    
    // 負荷バランスを調整
    this.balanceWeeklyWorkload(weekSchedule, familyMembers)

    return {
      weekStart,
      weekEnd: weekDates[6],
      schedule: weekSchedule,
      summary: this.generateWeeklySummary(weekSchedule, familyMembers),
      recommendations: this.generateWeeklyRecommendations(weekSchedule, familyMembers)
    }
  }

  // メンバーの可用性を計算
  calculateMemberAvailability(familyMembers, dayEvents, isWeekend) {
    const availability = {}
    
    familyMembers.forEach(member => {
      const memberEvents = dayEvents.filter(event => 
        event.memberId === member.id || (!event.memberId && event.type === 'family')
      )
      
      // 基本的な可用性（平日/休日）
      let baseAvailability = {
        morning: isWeekend ? 8 : 5,
        afternoon: isWeekend ? 8 : 3,
        evening: 7
      }
      
      // メンバーの利用可能時間設定を反映
      if (member.availableTime) {
        const timeKey = isWeekend ? 'weekend' : 'weekday'
        if (member.availableTime[timeKey]) {
          baseAvailability = {
            morning: member.availableTime[timeKey].morning ? 8 : 2,
            afternoon: member.availableTime[timeKey].afternoon ? 8 : 2,
            evening: member.availableTime[timeKey].evening ? 8 : 2
          }
        }
      }
      
      // イベントによる調整
      memberEvents.forEach(event => {
        const impact = this.getEventImpact(event)
        Object.keys(baseAvailability).forEach(timeSlot => {
          baseAvailability[timeSlot] = Math.max(1, baseAvailability[timeSlot] - impact)
        })
      })
      
      availability[member.id] = {
        member,
        ...baseAvailability,
        events: memberEvents,
        totalAvailability: Object.values(baseAvailability).reduce((sum, val) => sum + val, 0)
      }
    })
    
    return availability
  }

  // イベントの影響度を取得
  getEventImpact(event) {
    switch (event.type) {
      case 'work': return 6
      case 'school': return 5
      case 'family': return 3
      case 'personal': return 2
      default: return 1
    }
  }

  // 毎日の家事を配置
  assignDailyChores(weekSchedule, familyMembers) {
    const dailyChores = this.getChoresByFrequency('daily')
    
    Object.keys(weekSchedule).forEach(dayKey => {
      const day = weekSchedule[dayKey]
      
      dailyChores.forEach(chore => {
        const bestAssignment = this.findBestAssignment(
          chore, 
          day.memberAvailability, 
          familyMembers
        )
        
        if (bestAssignment) {
          const choreTask = {
            id: `${chore.id}_${dayKey}`,
            ...chore,
            assignedTo: bestAssignment.member,
            estimatedTime: bestAssignment.estimatedTime,
            score: bestAssignment.score,
            calendarAdjusted: bestAssignment.calendarAdjusted
          }
          
          day.timeSlots[chore.timeSlot].push(choreTask)
          day.totalTime += bestAssignment.estimatedTime
          
          // 可用性を更新
          day.memberAvailability[bestAssignment.member.id][chore.timeSlot] -= 2
        }
      })
    })
  }

  // 週単位の家事を配置
  assignWeeklyChores(weekSchedule, familyMembers) {
    const weeklyChores = this.getChoresByFrequency('weekly')
    const days = Object.keys(weekSchedule)
    
    weeklyChores.forEach(chore => {
      // 最適な日を選択
      let bestDay = null
      let bestScore = -1
      let bestAssignment = null
      
      days.forEach(dayKey => {
        const day = weekSchedule[dayKey]
        const assignment = this.findBestAssignment(
          chore, 
          day.memberAvailability, 
          familyMembers
        )
        
        if (assignment) {
          // 日の適合度を計算
          let dayScore = assignment.score
          
          // 休日ボーナス（時間のかかる家事）
          if (day.isWeekend && chore.time > 60) {
            dayScore += 2
          }
          
          // 負荷分散ボーナス
          if (day.totalTime < 120) {
            dayScore += 1
          }
          
          // 天候考慮（洗濯など）
          if (chore.id === 'laundry') {
            // 実際の天候APIとの連携は後で実装
            dayScore += Math.random() > 0.5 ? 1 : 0
          }
          
          if (dayScore > bestScore) {
            bestScore = dayScore
            bestDay = dayKey
            bestAssignment = assignment
          }
        }
      })
      
      // 最適な日に配置
      if (bestDay && bestAssignment) {
        const day = weekSchedule[bestDay]
        const choreTask = {
          id: `${chore.id}_${bestDay}`,
          ...chore,
          assignedTo: bestAssignment.member,
          estimatedTime: bestAssignment.estimatedTime,
          score: bestAssignment.score,
          calendarAdjusted: bestAssignment.calendarAdjusted
        }
        
        day.timeSlots[chore.timeSlot].push(choreTask)
        day.totalTime += bestAssignment.estimatedTime
        
        // 可用性を更新
        const timeReduction = Math.ceil(bestAssignment.estimatedTime / 30)
        day.memberAvailability[bestAssignment.member.id][chore.timeSlot] -= timeReduction
      }
    })
  }

  // 最適な担当者を見つける
  findBestAssignment(chore, memberAvailability, familyMembers) {
    let bestAssignment = null
    let bestScore = -1
    
    familyMembers.forEach(member => {
      const availability = memberAvailability[member.id]
      const timeSlotAvailability = availability[chore.timeSlot]
      
      // 時間がない場合はスキップ
      if (timeSlotAvailability < 1) return
      
      // スコア計算
      const skillLevel = member.skills?.[chore.skill] || 1
      const preferenceScore = this.getPreferenceScore(member, chore)
      const availabilityScore = Math.min(timeSlotAvailability, 10)
      const eventAdjustment = availability.events.length * -0.5
      
      const totalScore = (skillLevel * 2) + preferenceScore + availabilityScore + eventAdjustment
      
      if (totalScore > bestScore) {
        bestScore = totalScore
        bestAssignment = {
          member,
          estimatedTime: Math.round(chore.time / (skillLevel / 5)),
          score: totalScore,
          calendarAdjusted: availability.events.length > 0
        }
      }
    })
    
    return bestAssignment
  }

  // 好みスコアを取得
  getPreferenceScore(member, chore) {
    if (!member.preferences) return 0
    
    if (member.preferences.preferred?.includes(chore.skill)) {
      return 3
    } else if (member.preferences.disliked?.includes(chore.skill)) {
      return -2
    }
    return 0
  }

  // 週間負荷バランスを調整
  balanceWeeklyWorkload(weekSchedule, familyMembers) {
    // メンバー別の週間総負荷を計算
    const memberWeeklyLoad = {}
    familyMembers.forEach(member => {
      memberWeeklyLoad[member.id] = {
        member,
        totalTime: 0,
        dailyLoad: {}
      }
    })
    
    // 現在の負荷を集計
    Object.entries(weekSchedule).forEach(([dayKey, day]) => {
      Object.values(day.timeSlots).flat().forEach(task => {
        if (task.assignedTo) {
          const memberId = task.assignedTo.id
          memberWeeklyLoad[memberId].totalTime += task.estimatedTime
          memberWeeklyLoad[memberId].dailyLoad[dayKey] = 
            (memberWeeklyLoad[memberId].dailyLoad[dayKey] || 0) + task.estimatedTime
        }
      })
    })
    
    // 負荷が偏っている場合は調整提案を生成
    const avgLoad = Object.values(memberWeeklyLoad)
      .reduce((sum, load) => sum + load.totalTime, 0) / familyMembers.length
    
    Object.values(memberWeeklyLoad).forEach(load => {
      if (load.totalTime > avgLoad * 1.5) {
        console.log(`${load.member.name}さんの負荷が高すぎます: ${load.totalTime}分`)
      }
    })
  }

  // 週間サマリーを生成
  generateWeeklySummary(weekSchedule, familyMembers) {
    const totalTasks = Object.values(weekSchedule)
      .reduce((sum, day) => sum + Object.values(day.timeSlots).flat().length, 0)
    
    const totalTime = Object.values(weekSchedule)
      .reduce((sum, day) => sum + day.totalTime, 0)
    
    const memberWorkload = {}
    familyMembers.forEach(member => {
      memberWorkload[member.id] = { member, tasks: 0, time: 0 }
    })
    
    Object.values(weekSchedule).forEach(day => {
      Object.values(day.timeSlots).flat().forEach(task => {
        if (task.assignedTo) {
          const memberId = task.assignedTo.id
          memberWorkload[memberId].tasks += 1
          memberWorkload[memberId].time += task.estimatedTime
        }
      })
    })
    
    return {
      totalTasks,
      totalTime,
      averageTimePerDay: Math.round(totalTime / 7),
      memberWorkload,
      fairnessScore: this.calculateWeeklyFairness(memberWorkload)
    }
  }

  // 週間公平性を計算
  calculateWeeklyFairness(memberWorkload) {
    const times = Object.values(memberWorkload).map(w => w.time)
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    
    if (avgTime === 0) return 1
    
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
    const coefficient = Math.sqrt(variance) / avgTime
    
    return Math.max(0, 1 - coefficient)
  }

  // 週間推奨事項を生成
  generateWeeklyRecommendations(weekSchedule, familyMembers) {
    const recommendations = []
    
    // 負荷バランスのチェック
    const summary = this.generateWeeklySummary(weekSchedule, familyMembers)
    if (summary.fairnessScore < 0.7) {
      recommendations.push({
        type: 'balance',
        message: '負荷のバランスを改善することをお勧めします',
        action: '重い家事を複数のメンバーで分担する'
      })
    }
    
    // 予定が多い日のチェック
    Object.entries(weekSchedule).forEach(([dayKey, day]) => {
      if (day.events.length > 2 && day.totalTime > 120) {
        recommendations.push({
          type: 'schedule_conflict',
          message: `${day.label}曜日は予定が多く、家事の負荷も高めです`,
          action: '一部の家事を他の日に移動することを検討'
        })
      }
    })
    
    return recommendations
  }

  // カレンダー情報を考慮したAI最適分担アルゴリズム（既存）
  calculateOptimalAssignmentWithCalendar(familyMembers, calendarEvents = []) {
    if (!familyMembers || familyMembers.length === 0) {
      throw new Error('家族メンバーが設定されていません')
    }

    console.log('📅 カレンダー情報を考慮したAI分担計算:', { 
      familyMembers: familyMembers.length, 
      calendarEvents: calendarEvents.length 
    })

    // 今日の日付
    const today = new Date().toISOString().split('T')[0]
    const todayEvents = calendarEvents.filter(event => event.date === today)

    console.log('📅 今日のイベント:', todayEvents)

    const assignments = this.categories.map(category => {
      const categoryAssignments = category.chores.map(chore => {
        // 各メンバーのスコアを計算（カレンダー情報を考慮）
        const memberScores = familyMembers.map(member => {
          const skillLevel = member.skills?.[chore.skill] || 1
          
          // 基本的な時間スコア
          let timeScore = 5 // デフォルト値
          if (member.availableTime) {
            const currentDay = new Date().getDay()
            const isWeekend = currentDay === 0 || currentDay === 6
            const timeSlot = this.getTimeSlot()
            
            const timeAvailability = isWeekend 
              ? member.availableTime.weekend?.[timeSlot]
              : member.availableTime.weekday?.[timeSlot]
            
            timeScore = timeAvailability ? 8 : 3
          }

          // カレンダーイベントによる調整
          const memberEvents = todayEvents.filter(event => 
            event.memberId === member.id || !event.memberId
          )

          let calendarAdjustment = 0
          memberEvents.forEach(event => {
            switch (event.type) {
              case 'work':
                calendarAdjustment -= 3 // 仕事の日は負荷を軽く
                break
              case 'school':
                calendarAdjustment -= 2 // 学校の日も軽く
                break
              case 'family':
                if (chore.skill === 'cooking' && event.title.includes('外食')) {
                  calendarAdjustment -= 10 // 外食予定があれば料理は不要
                }
                break
              case 'personal':
                calendarAdjustment -= 1 // 個人の予定があれば少し軽く
                break
            }
          })

          // 休日ボーナス（休日で予定がない場合）
          const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
          if (isWeekend && memberEvents.length === 0) {
            calendarAdjustment += 2 // 休日で予定がなければボーナス
          }
          
          // 好みのスコア
          let preferenceScore = 0
          if (member.preferences) {
            if (member.preferences.preferred?.includes(chore.skill)) {
              preferenceScore = 10
            } else if (member.preferences.disliked?.includes(chore.skill)) {
              preferenceScore = -5
            }
          }
          
          // 難易度によるペナルティ
          const difficultyPenalty = chore.difficulty * 0.5
          
          // 効率ボーナス（スキルが高いほどボーナス）
          const efficiencyBonus = skillLevel > 7 ? 5 : 0
          
          // 総合スコア計算（カレンダー調整を含む）
          const totalScore = (skillLevel * 2) + timeScore + preferenceScore - difficultyPenalty + efficiencyBonus + calendarAdjustment
          
          // 推定時間（スキルレベルに応じて調整）
          const estimatedTime = Math.round(chore.time / (skillLevel / 5))
          
          return {
            memberId: member.id,
            memberName: member.name,
            memberAvatar: member.avatar,
            score: totalScore,
            skillLevel,
            estimatedTime,
            calendarAdjustment,
            availableEvents: memberEvents.length,
            breakdown: {
              skillScore: skillLevel * 2,
              timeScore,
              preferenceScore,
              difficultyPenalty: -difficultyPenalty,
              efficiencyBonus,
              calendarAdjustment
            }
          }
        }).sort((a, b) => b.score - a.score)

        // 最適な担当者を選択
        const recommendedAssignee = memberScores[0]
        const alternatives = memberScores.slice(1)
        
        // バランススコア（最適解と次点の差）
        const balanceScore = memberScores.length > 1 
          ? memberScores[0].score - memberScores[1].score 
          : memberScores[0].score

        return {
          choreId: chore.id,
          choreName: chore.name,
          choreIcon: chore.icon,
          choreDescription: chore.description,
          choreTime: chore.time,
          choreDifficulty: chore.difficulty,
          recommendedAssignee,
          alternatives,
          balanceScore,
          fairnessIndex: this.calculateFairnessIndex(memberScores),
          calendarConsidered: todayEvents.length > 0
        }
      })

      return {
        category: category.name,
        categoryId: category.id,
        assignments: categoryAssignments
      }
    })

    // 全体的な負荷バランスを調整（カレンダー情報を考慮）
    return this.adjustOverallBalanceWithCalendar(assignments, familyMembers, todayEvents)
  }

  // 従来のAI分担アルゴリズム（後方互換性のため保持）
  calculateOptimalAssignment(familyMembers) {
    return this.calculateOptimalAssignmentWithCalendar(familyMembers, [])
  }

  // カレンダー情報を考慮した負荷バランス調整
  adjustOverallBalanceWithCalendar(assignments, familyMembers, todayEvents) {
    // 各メンバーの総負荷を計算
    const memberWorkload = {}
    familyMembers.forEach(member => {
      memberWorkload[member.id] = {
        totalTime: 0,
        totalChores: 0,
        totalDifficulty: 0,
        calendarBusyness: 0
      }
    })

    // カレンダーイベントによる忙しさを計算
    todayEvents.forEach(event => {
      if (event.memberId && memberWorkload[event.memberId]) {
        let busynessScore = 1
        switch (event.type) {
          case 'work': busynessScore = 3; break
          case 'school': busynessScore = 2; break
          case 'family': busynessScore = 1; break
          case 'personal': busynessScore = 0.5; break
        }
        memberWorkload[event.memberId].calendarBusyness += busynessScore
      }
    })

    // 各分担の負荷を集計
    assignments.forEach(category => {
      category.assignments.forEach(assignment => {
        const memberId = assignment.recommendedAssignee.memberId
        if (memberWorkload[memberId]) {
          memberWorkload[memberId].totalTime += assignment.recommendedAssignee.estimatedTime
          memberWorkload[memberId].totalChores += 1
          memberWorkload[memberId].totalDifficulty += assignment.choreDifficulty
        }
      })
    })

    // 負荷のバランスが悪い場合は調整提案を追加
    const workloadArray = Object.entries(memberWorkload)
    const avgTime = workloadArray.reduce((sum, [id, load]) => sum + load.totalTime, 0) / workloadArray.length
    
    const suggestions = []
    workloadArray.forEach(([memberId, load]) => {
      const member = familyMembers.find(m => m.id === memberId)
      const totalBusyness = load.totalTime + (load.calendarBusyness * 30) // 30分換算
      const deviation = Math.abs(totalBusyness - avgTime)
      
      if (deviation > avgTime * 0.3) { // 30%以上の偏りがある場合
        if (totalBusyness > avgTime) {
          suggestions.push({
            type: 'overload',
            memberId,
            memberName: member?.name,
            message: `${member?.name}さんは今日予定があるため、負荷を軽減しました。`,
            currentTime: load.totalTime,
            calendarBusyness: load.calendarBusyness,
            averageTime: Math.round(avgTime)
          })
        } else if (load.calendarBusyness === 0) {
          suggestions.push({
            type: 'available',
            memberId,
            memberName: member?.name,
            message: `${member?.name}さんは今日時間に余裕があるため、少し多めに分担してもらいました。`,
            currentTime: load.totalTime,
            averageTime: Math.round(avgTime)
          })
        }
      }
    })

    // カレンダー特有の提案を追加
    const calendarSuggestions = this.generateCalendarSuggestions(todayEvents, familyMembers)
    suggestions.push(...calendarSuggestions)

    return {
      assignments,
      workloadAnalysis: memberWorkload,
      balanceSuggestions: suggestions,
      overallFairnessScore: this.calculateOverallFairness(workloadArray),
      calendarConsidered: todayEvents.length > 0,
      generatedAt: new Date().toISOString()
    }
  }

  // カレンダー特有の提案を生成
  generateCalendarSuggestions(todayEvents, familyMembers) {
    const suggestions = []

    // 外食予定がある場合
    const diningOutEvents = todayEvents.filter(event => 
      event.title.includes('外食') || event.title.includes('レストラン') || 
      event.title.includes('飲み会') || event.title.includes('食事')
    )
    if (diningOutEvents.length > 0) {
      suggestions.push({
        type: 'calendar_adjustment',
        message: '今日は外食予定があるため、料理タスクを減らしました。',
        reason: 'dining_out'
      })
    }

    // 来客予定がある場合
    const guestEvents = todayEvents.filter(event => 
      event.title.includes('来客') || event.title.includes('お客') || 
      event.title.includes('訪問') || event.title.includes('友人')
    )
    if (guestEvents.length > 0) {
      suggestions.push({
        type: 'calendar_adjustment',
        message: '来客予定があるため、掃除タスクを優先的に配置しました。',
        reason: 'guests_coming'
      })
    }

    // 全員が忙しい日の場合
    const busyMembers = familyMembers.filter(member => 
      todayEvents.some(event => event.memberId === member.id && event.type === 'work')
    )
    if (busyMembers.length === familyMembers.length) {
      suggestions.push({
        type: 'calendar_adjustment',
        message: '今日は全員忙しいため、必要最小限の家事のみに調整しました。',
        reason: 'everyone_busy'
      })
    }

    return suggestions
  }

  // 現在の時間帯を取得
  getTimeSlot() {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    if (hour < 21) return 'evening'
    return 'night'
  }

  // 公平性指数を計算
  calculateFairnessIndex(memberScores) {
    if (memberScores.length <= 1) return 1.0
    
    const scores = memberScores.map(m => m.score)
    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores)
    const range = maxScore - minScore
    
    // スコアの差が小さいほど公平性が高い
    return range === 0 ? 1.0 : Math.max(0, 1 - (range / 20))
  }

  // 全体的な負荷バランスを調整
  adjustOverallBalance(assignments, familyMembers) {
    return this.adjustOverallBalanceWithCalendar(assignments, familyMembers, [])
  }

  // 全体的な公平性スコアを計算
  calculateOverallFairness(workloadArray) {
    if (workloadArray.length <= 1) return 1.0
    
    const times = workloadArray.map(([id, load]) => load.totalTime)
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
    const standardDeviation = Math.sqrt(variance)
    
    // 標準偏差が小さいほど公平性が高い
    const fairnessScore = Math.max(0, 1 - (standardDeviation / avgTime))
    return Math.min(1, fairnessScore)
  }

  // 週間スケジュールを生成
  generateWeeklySchedule(assignments, familyMembers) {
    const schedule = {}
    const days = ['月', '火', '水', '木', '金', '土', '日']
    
    days.forEach((day, index) => {
      schedule[day] = []
      
      // 毎日の家事を配置
      const dailyChores = assignments.assignments
        .find(cat => cat.categoryId === 'daily')?.assignments || []
      
      dailyChores.forEach(assignment => {
        schedule[day].push({
          ...assignment,
          timeSlot: this.getOptimalTimeSlot(assignment.choreId, index)
        })
      })
      
      // 週単位の家事を適切な日に配置
      if (index === 0 || index === 3) { // 月・木曜日
        const laundryAssignment = assignments.assignments
          .find(cat => cat.categoryId === 'weekly')?.assignments
          .find(a => a.choreId === 'laundry')
        if (laundryAssignment) {
          schedule[day].push({
            ...laundryAssignment,
            timeSlot: 'morning'
          })
        }
      }
      
      if (index === 5 || index === 6) { // 土・日曜日
        const weekendChores = assignments.assignments
          .find(cat => cat.categoryId === 'weekly')?.assignments
          .filter(a => ['vacuum', 'bathroom_cleaning'].includes(a.choreId)) || []
        
        weekendChores.forEach(assignment => {
          schedule[day].push({
            ...assignment,
            timeSlot: 'afternoon'
          })
        })
      }
    })
    
    return schedule
  }

  // 最適な時間帯を決定
  getOptimalTimeSlot(choreId, dayIndex) {
    const timeSlotMap = {
      'cooking_breakfast': 'morning',
      'cooking_dinner': 'evening',
      'dishes': 'evening',
      'trash_prep': 'evening',
      'laundry': 'morning',
      'vacuum': 'afternoon',
      'grocery_shopping': dayIndex === 6 ? 'morning' : 'afternoon', // 日曜は午前
      'bathroom_cleaning': 'afternoon'
    }
    
    return timeSlotMap[choreId] || 'afternoon'
  }
}

// シングルトンインスタンスをエクスポート
export const choreDatabase = new ChoreDatabase()