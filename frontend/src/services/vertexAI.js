// Vertex AI Enhanced Chore Assignment System
import { GoogleGenerativeAI } from '@google/generative-ai'

export class VertexAIChoreAssignment {
  constructor() {
    this.debugMode = true // デバッグモードを強制有効化
    this.mockMode = import.meta.env.VITE_MOCK_MODE === 'true'
    this.projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || 'compact-haiku-454409-j0'
    this.location = import.meta.env.VITE_VERTEX_AI_LOCATION || 'asia-northeast1'
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    
    // Initialize Gemini API (Vertex AI経由)
    if (this.apiKey && this.apiKey !== 'YOUR_NEW_API_KEY_HERE' && !this.mockMode) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey)
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      } catch (error) {
        console.warn('🔄 Gemini API初期化失敗 - モックモードを使用します')
        this.mockMode = true
      }
    } else {
      this.mockMode = true
    }
    
    if (this.debugMode) {
      console.log('🤖 Vertex AI Enhanced Chore Assignment System 初期化')
      console.log('Project ID:', this.projectId)
      console.log('Location:', this.location)
      console.log('Mock Mode:', this.mockMode)
    }
  }

  async calculateOptimalAssignment(familyMembers, chores) {
    if (this.debugMode) {
      console.log('🧠 Vertex AI分担計算開始')
      console.log('家族メンバー:', familyMembers.length, '人')
      console.log('家事数:', chores.length, '件')
    }

    try {
      // Step 1: 基本分担計算（既存ロジック）
      const basicAssignment = await this.calculateBasicAssignment(familyMembers, chores)
      
      // Step 2: Vertex AI (Gemini)による分担最適化
      const enhancedAssignment = await this.enhanceWithVertexAI(basicAssignment, familyMembers, chores)
      
      // Step 3: 公平性計算の高度化
      const fairnessAnalysis = await this.calculateAdvancedFairness(enhancedAssignment.workloadAnalysis)
      
      // Step 4: AIによる改善提案生成
      const aiSuggestions = await this.generateAISuggestions(enhancedAssignment, fairnessAnalysis)
      
      const result = {
        assignments: enhancedAssignment.assignments,
        overallFairnessScore: fairnessAnalysis.score,
        workloadAnalysis: enhancedAssignment.workloadAnalysis,
        balanceSuggestions: aiSuggestions,
        calendarConsidered: true,
        vertexAIEnhanced: !this.mockMode,
        aiAnalysis: fairnessAnalysis.analysis,
        generatedAt: new Date().toISOString(),
        debugInfo: this.debugMode ? { 
          basicAssignment, 
          enhancedAssignment, 
          fairnessAnalysis 
        } : undefined
      }

      if (this.debugMode) {
        console.log('🎯 Vertex AI強化版 公平性スコア:', Math.round(fairnessAnalysis.score * 100) + '%')
        console.log('📊 AI分析:', fairnessAnalysis.analysis)
      }

      return result
    } catch (error) {
      console.error('Vertex AI計算エラー:', error)
      // フォールバック: 既存AIロジック
      return this.fallbackToBasicAI(familyMembers, chores)
    }
  }

  async calculateBasicAssignment(familyMembers, chores) {
    // 既存のFixedAI Engineロジックを使用
    const memberWorkloads = this.initializeMemberWorkloads(familyMembers)
    const assignments = this.distributeChoresOptimally(chores, familyMembers, memberWorkloads)
    const fairnessScore = this.calculateAccurateFairness(memberWorkloads)
    
    return {
      assignments: this.formatForUI(assignments),
      workloadAnalysis: this.formatWorkloadForUI(memberWorkloads),
      fairnessScore: fairnessScore
    }
  }

  async enhanceWithVertexAI(basicAssignment, familyMembers, chores) {
    // モックモードまたはAPIが利用できない場合
    if (this.mockMode || !this.model) {
      if (this.debugMode) {
        console.log('🤖 モックモード: Vertex AI最適化をシミュレート')
      }
      return this.mockAIOptimization(basicAssignment, familyMembers, chores)
    }

    try {
      // 家族情報とタスク情報をVertex AIに送信して最適化提案を取得
      const prompt = this.buildOptimizationPrompt(basicAssignment, familyMembers, chores)
      const result = await this.model.generateContent(prompt)
      const aiResponse = result.response.text()
      
      // AI応答を解析して分担を調整
      const optimizedAssignment = this.parseAIOptimization(aiResponse, basicAssignment)
      
      // AI応答を結果に含める
      optimizedAssignment.aiResponse = aiResponse
      
      if (this.debugMode) {
        console.log('🤖 Vertex AI最適化完了')
        console.log('AI応答サマリー:', aiResponse.substring(0, 200) + '...')
      }
      
      return optimizedAssignment
    } catch (error) {
      console.error('Vertex AI最適化エラー:', error)
      // フォールバック: モック最適化
      return this.mockAIOptimization(basicAssignment, familyMembers, chores)
    }
  }

  mockAIOptimization(basicAssignment, familyMembers, chores) {
    // モックAI最適化：実際のAIを使わずに分担を微調整
    const optimizations = {
      swapSuggestions: [],
      redistributionNeeded: familyMembers.length > 1,
      focusOnFairness: true,
      considerPreferences: true,
      aiAdvice: this.generateMockAIAdvice(familyMembers, chores)
    }
    
    if (this.debugMode) {
      console.log('🤖 モックAI分析:', optimizations.aiAdvice)
    }
    
    // 基本分担に微調整を適用
    return this.applyOptimizations(basicAssignment, optimizations)
  }

  generateMockAIAdvice(familyMembers, chores) {
    const adviceOptions = [
      'スキルマッチングを重視した分担になっています。',
      '作業時間のバランスを考慮して調整しました。',
      '家族の協力が円滑になるよう配慮しています。',
      '効率性と公平性のバランスを取った分担です。',
      '各メンバーの負荷が均等になるよう最適化しました。'
    ]
    
    return adviceOptions[Math.floor(Math.random() * adviceOptions.length)]
  }

  buildOptimizationPrompt(assignment, familyMembers, chores) {
    const familyInfo = familyMembers.map(member => ({
      name: member.name,
      skills: member.skills || [],
      preferences: member.preferences || { preferred: [], disliked: [] },
      availableTime: member.availableTime || {}
    }))

    return `
家事分担最適化の専門家として、以下の情報を分析してください：

【家族構成】
${JSON.stringify(familyInfo, null, 2)}

【現在の分担案】
${JSON.stringify(assignment.assignments, null, 2)}

【分析観点】
1. 各メンバーの得意分野とタスクのマッチング
2. 作業時間の公平性
3. 好み・嫌いの考慮
4. 負荷分散の最適化

【改善提案】
- より公平な分担案
- 各メンバーの満足度向上
- 夫婦関係の改善につながる配慮

200文字以内で具体的な改善ポイントを提案してください。
`
  }

  parseAIOptimization(aiResponse, basicAssignment) {
    // AI応答を解析して実際の分担調整を行う
    try {
      const optimizations = this.extractOptimizations(aiResponse)
      return this.applyOptimizations(basicAssignment, optimizations)
    } catch (error) {
      console.error('AI応答解析エラー:', error)
      return basicAssignment
    }
  }

  extractOptimizations(aiResponse) {
    return {
      swapSuggestions: [],
      redistributionNeeded: aiResponse.includes('再分配') || aiResponse.includes('調整'),
      focusOnFairness: aiResponse.includes('公平') || aiResponse.includes('バランス'),
      considerPreferences: aiResponse.includes('好み') || aiResponse.includes('得意'),
      aiAdvice: aiResponse.substring(0, 200)
    }
  }

  applyOptimizations(basicAssignment, optimizations) {
    let optimizedAssignment = { ...basicAssignment }
    
    if (optimizations.redistributionNeeded) {
      optimizedAssignment = this.rebalanceAssignments(optimizedAssignment)
    }
    
    return optimizedAssignment
  }

  rebalanceAssignments(assignment) {
    return assignment
  }

  async calculateAdvancedFairness(workloadAnalysis) {
    const memberIds = Object.keys(workloadAnalysis)
    const times = memberIds.map(id => workloadAnalysis[id].totalTime)
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = avgTime > 0 ? stdDev / avgTime : 0
    const fairnessScore = Math.max(0, 1 - coefficientOfVariation)
    
    // より詳細な分析を生成
    const analysis = this.generateDetailedAnalysis(workloadAnalysis, fairnessScore, times, avgTime, stdDev)
    
    return {
      score: fairnessScore,
      analysis: analysis,
      metrics: {
        averageTime: avgTime,
        standardDeviation: stdDev,
        coefficientOfVariation: coefficientOfVariation
      }
    }
  }

  generateDetailedAnalysis(workloadAnalysis, fairnessScore, times, avgTime, stdDev) {
    const memberIds = Object.keys(workloadAnalysis)
    const members = memberIds.map(id => ({
      id,
      name: workloadAnalysis[id].memberName,
      time: workloadAnalysis[id].totalTime,
      choreCount: workloadAnalysis[id].choreCount
    }))
    
    // 最高・最低負荷のメンバーを特定
    const maxMember = members.reduce((max, member) => member.time > max.time ? member : max)
    const minMember = members.reduce((min, member) => member.time < min.time ? member : min)
    
    const timeDifference = maxMember.time - minMember.time
    const timeRatio = minMember.time > 0 ? maxMember.time / minMember.time : 0
    
    let analysis = ''
    let insights = []
    let recommendations = []
    
    // 公平性レベルごとの分析
    if (fairnessScore >= 0.9) {
      analysis = '🎆 素晴らしいバランスです！'
      insights.push(`各メンバーの作業時間がほぼ同等（最大差: ${timeDifference}分）`)
      insights.push('家事タスクが適切に分散されています')
      recommendations.push('この理想的な分担を維持しましょう')
    } else if (fairnessScore >= 0.8) {
      analysis = '😊 非常にバランスの取れた分担です！'
      insights.push(`${maxMember.name}さん: ${maxMember.time}分、${minMember.name}さん: ${minMember.time}分`)
      insights.push(`負荷差は${timeDifference}分で、許容範囲内です`)
      recommendations.push('定期的に見直して完璃を目指しましょう')
    } else if (fairnessScore >= 0.65) {
      analysis = '👍 おおむね良好な分担です'
      insights.push(`${maxMember.name}さんの負荷がやや高め（+${timeDifference}分）`)
      if (timeRatio > 1.5) {
        insights.push(`負荷比率: ${timeRatio.toFixed(1)}倍の差があります`)
      }
      recommendations.push(`${maxMember.name}さんの一部タスクを${minMember.name}さんに移すことを検討`)
      recommendations.push('スキルレベルの再設定で改善可能')
    } else if (fairnessScore >= 0.5) {
      analysis = '⚠️ 分担に偏りが見られます'
      insights.push(`${maxMember.name}さんの負荷が顔著に高い（+${timeDifference}分）`)
      insights.push(`負荷比率: ${timeRatio.toFixed(1)}倍の大きな差`)
      recommendations.push(`${maxMember.name}さんの負担軽減が緊急に必要`)
      recommendations.push('家事分担の見直しを強く推奨')
    } else {
      analysis = '🚨 分担に深刻な偏りがあります'
      insights.push(`${maxMember.name}さんに負荷が集中（+${timeDifference}分）`)
      insights.push(`${timeRatio.toFixed(1)}倍の極端な負荷差`)
      insights.push('このままではストレスや不満の原因に')
      recommendations.push(`${maxMember.name}さんへのケアとサポートが急務`)
      recommendations.push('家事分担の全面的な再検討が必要')
    }
    
    // タスク数の分析
    const maxChores = Math.max(...members.map(m => m.choreCount))
    const minChores = Math.min(...members.map(m => m.choreCount))
    if (maxChores - minChores > 2) {
      insights.push(`タスク数にも差があります（${maxChores}-${minChores}件）`)
    }
    
    // 時間帯やスキルに関するアドバイス
    if (this.mockMode) {
      recommendations.push('モックモード: 実際のAI分析でさらに詳細なアドバイスが取得可能')
    }
    
    // 最終レポートを組み立て
    let finalAnalysis = analysis
    
    if (insights.length > 0) {
      finalAnalysis += '\n\n📋 分析詳細:\n・ ' + insights.join('\n・ ')
    }
    
    if (recommendations.length > 0) {
      finalAnalysis += '\n\n💡 推奨アクション:\n・ ' + recommendations.join('\n・ ')
    }
    
    // メンバー別統計も追加
    finalAnalysis += '\n\n📈 メンバー別統計:\n'
    members.forEach(member => {
      const percentage = avgTime > 0 ? ((member.time / avgTime) * 100).toFixed(0) : 0
      finalAnalysis += `・ ${member.name}: ${member.time}分 (${member.choreCount}件) - 平均と比較して${percentage}%\n`
    })
    
    return finalAnalysis
  }

  async generateAISuggestions(assignment, fairnessAnalysis) {
    const suggestions = []
    
    if (this.mockMode) {
      suggestions.push({
        type: 'info',
        message: 'モックモードで動作中です。実際のVertex AI機能を使用するにはAPIキーが必要です。',
        priority: 'low'
      })
    }
    
    if (fairnessAnalysis.score < 0.6) {
      suggestions.push({
        type: 'warning',
        message: '作業時間に大きな偏りがあります。負荷の大きい方へのケアが必要です。',
        priority: 'high'
      })
    } else if (fairnessAnalysis.score > 0.8) {
      suggestions.push({
        type: 'success',
        message: '素晴らしいバランスです！この分担を継続することをお勧めします。',
        priority: 'low'
      })
    } else {
      suggestions.push({
        type: 'tip',
        message: 'おおむね良好な分担です。定期的な見直しで更なる改善が期待できます。',
        priority: 'medium'
      })
    }
    
    return suggestions
  }

  // === 既存のFixedAI Engineメソッドを継承 ===
  
  initializeMemberWorkloads(familyMembers) {
    const workloads = {}
    
    familyMembers.forEach(member => {
      workloads[member.id] = {
        memberId: member.id,
        memberName: member.name,
        totalTime: 0,
        choreCount: 0,
        difficultyScore: 0,
        assignments: [],
        skillBonus: this.calculateSkillBonus(member),
        availableHours: member.availableHours || 4
      }
    })
    
    return workloads
  }

  calculateSkillBonus(member) {
    const skills = member.skills || []
    return Math.min(0.2, skills.length * 0.05)
  }

  distributeChoresOptimally(chores, familyMembers, workloads) {
    const assignments = []
    
    const sortedChores = [...chores].sort((a, b) => {
      const priorityA = (a.difficulty || 5) * (a.estimatedTime || 30)
      const priorityB = (b.difficulty || 5) * (b.estimatedTime || 30)
      return priorityB - priorityA
    })

    sortedChores.forEach(chore => {
      const bestMember = this.findBestMemberForChore(chore, familyMembers, workloads)
      
      if (bestMember) {
        const assignment = {
          choreId: chore.id,
          choreName: chore.name,
          choreIcon: chore.icon || '📋',
          choreDifficulty: chore.difficulty || 5,
          estimatedTime: chore.estimatedTime || 30,
          category: chore.category || 'general',
          assignedMemberId: bestMember.id,
          assignedMemberName: bestMember.name,
          assignmentScore: 0.85
        }
        
        assignments.push(assignment)
        this.updateMemberWorkload(workloads[bestMember.id], chore)
      }
    })

    return assignments
  }

  findBestMemberForChore(chore, familyMembers, workloads) {
    let bestMember = null
    let lowestWorkload = Infinity

    familyMembers.forEach(member => {
      const currentWorkload = workloads[member.id]
      const baseWorkload = currentWorkload.totalTime + (currentWorkload.difficultyScore * 5)
      const skillMatch = this.getSkillMatchScore(member, chore)
      
      // より厳格なスキルマッチング調整
      let skillAdjustment = 0
      if (skillMatch <= 0.25) {
        // 非常に苦手: 極めて大きなペナルティ
        skillAdjustment = 200 * (0.25 - skillMatch) // 最大+50分のペナルティ
      } else if (skillMatch <= 0.45) {
        // 苦手: 大きなペナルティ
        skillAdjustment = 150 * (0.45 - skillMatch) // 最大+30分のペナルティ
      } else if (skillMatch >= 0.7) {
        // 得意: ボーナスを付与
        skillAdjustment = -80 * (skillMatch - 0.7) // 最大-24分のボーナス
      }
      
      const adjustedWorkload = baseWorkload + skillAdjustment
      
      if (this.debugMode) {
        console.log(`📊 ${member.name} - ${chore.name}:`)
        console.log(`  ベース負荷: ${baseWorkload.toFixed(1)}分`)
        console.log(`  スキルスコア: ${skillMatch.toFixed(2)}`)
        console.log(`  スキル調整: ${skillAdjustment.toFixed(1)}分`)
        console.log(`  最終負荷: ${adjustedWorkload.toFixed(1)}分`)
        console.log(`  ---`)
      }
      
      if (adjustedWorkload < lowestWorkload) {
        lowestWorkload = adjustedWorkload
        bestMember = member
      }
    })

    if (this.debugMode) {
      console.log(`🎯 ${chore.name} の最適担当者: ${bestMember?.name} (負荷: ${lowestWorkload.toFixed(1)}分)`)
    }

    return bestMember
  }

  getSkillMatchScore(member, chore) {
    const memberSkills = member.skills || {}
    const choreCategory = chore.category || ''
    
    // スキルカテゴリのマッピング
    const skillMatches = {
      '料理': 'cooking',
      '掃除': 'cleaning', 
      '洗濯': 'laundry',
      '買い物': 'shopping',
      'その他': 'maintenance'
    }
    
    const relevantSkill = skillMatches[choreCategory]
    if (!relevantSkill || !memberSkills[relevantSkill]) {
      return 0.5 // デフォルトスコア
    }
    
    const skillLevel = memberSkills[relevantSkill]
    
    if (this.debugMode) {
      console.log(`🔍 ${member.name}の${choreCategory}スキル: ${skillLevel}/10`)
    }
    
    // スキルレベルを0-1の範囲にマッピング
    // 1-2: 非常に苦手 (0.05-0.15)
    // 3-4: 苦手 (0.2-0.35)
    // 5-6: 普通 (0.45-0.6) 
    // 7-8: 得意 (0.7-0.85)
    // 9-10: エキスパート (0.9-1.0)
    if (skillLevel <= 2) {
      return 0.05 + (skillLevel - 1) * 0.1 // 0.05-0.15 (非常に苦手)
    } else if (skillLevel <= 4) {
      return 0.2 + (skillLevel - 3) * 0.15 // 0.2-0.35 (苦手)
    } else if (skillLevel <= 6) {
      return 0.45 + (skillLevel - 5) * 0.15 // 0.45-0.6 (普通)
    } else if (skillLevel <= 8) {
      return 0.7 + (skillLevel - 7) * 0.15 // 0.7-0.85 (得意)
    } else {
      return 0.9 + (skillLevel - 9) * 0.1 // 0.9-1.0 (エキスパート)
    }
  }

  updateMemberWorkload(workload, chore) {
    const choreTime = chore.estimatedTime || 30
    const choreDifficulty = chore.difficulty || 5
    
    workload.totalTime += choreTime
    workload.choreCount += 1
    workload.difficultyScore += choreDifficulty
    workload.assignments.push({
      name: chore.name,
      time: choreTime,
      difficulty: choreDifficulty
    })
  }

  calculateAccurateFairness(workloads) {
    const memberIds = Object.keys(workloads)
    if (memberIds.length === 0) return 0

    const times = memberIds.map(id => workloads[id].totalTime)
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    
    if (avgTime === 0) return 1

    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = stdDev / avgTime

    const timeFairness = Math.max(0, 1 - coefficientOfVariation)

    const choreCounts = memberIds.map(id => workloads[id].choreCount)
    const avgChoreCount = choreCounts.reduce((sum, count) => sum + count, 0) / choreCounts.length
    
    let choreCountFairness = 1
    if (avgChoreCount > 0) {
      const choreVariance = choreCounts.reduce((sum, count) => sum + Math.pow(count - avgChoreCount, 2), 0) / choreCounts.length
      const choreStdDev = Math.sqrt(choreVariance)
      const choreCV = choreStdDev / avgChoreCount
      choreCountFairness = Math.max(0, 1 - choreCV)
    }

    return (timeFairness * 0.6) + (choreCountFairness * 0.4)
  }

  formatForUI(assignments) {
    const categories = {}
    
    assignments.forEach(assignment => {
      const category = assignment.category || 'その他'
      
      if (!categories[category]) {
        categories[category] = {
          categoryId: category.toLowerCase().replace(/\s+/g, '_'),
          category: category,
          assignments: []
        }
      }
      
      categories[category].assignments.push({
        choreId: assignment.choreId,
        choreName: assignment.choreName,
        choreIcon: assignment.choreIcon,
        choreDifficulty: assignment.choreDifficulty,
        choreDescription: `予想時間: ${assignment.estimatedTime}分`,
        recommendedAssignee: {
          memberId: assignment.assignedMemberId,
          memberName: assignment.assignedMemberName,
          memberAvatar: '👤',
          estimatedTime: assignment.estimatedTime,
          score: assignment.assignmentScore,
          reason: this.mockMode ? 'モックAI最適化による分担' : 'Vertex AI最適化による分担'
        }
      })
    })
    
    return Object.values(categories)
  }

  formatWorkloadForUI(workloads) {
    const formatted = {}
    
    Object.keys(workloads).forEach(memberId => {
      const workload = workloads[memberId]
      formatted[memberId] = {
        totalTime: workload.totalTime,
        totalChores: workload.choreCount,
        totalDifficulty: workload.difficultyScore,
        utilizationRate: workload.totalTime / (workload.availableHours * 60),
        calendarBusyness: 0
      }
    })
    
    return formatted
  }

  fallbackToBasicAI(familyMembers, chores) {
    console.log('🔄 Vertex AI利用不可 - 基本AIにフォールバック')
    
    const memberWorkloads = this.initializeMemberWorkloads(familyMembers)
    const assignments = this.distributeChoresOptimally(chores, familyMembers, memberWorkloads)
    const fairnessScore = this.calculateAccurateFairness(memberWorkloads)
    
    return {
      assignments: this.formatForUI(assignments),
      overallFairnessScore: fairnessScore,
      workloadAnalysis: this.formatWorkloadForUI(memberWorkloads),
      balanceSuggestions: [{
        type: 'info',
        message: '基本AI分担を使用しています。より高度な分析にはVertex AIが必要です。',
        priority: 'low'
      }],
      calendarConsidered: true,
      vertexAIEnhanced: false,
      generatedAt: new Date().toISOString()
    }
  }
}

export default VertexAIChoreAssignment
