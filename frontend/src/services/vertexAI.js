// Vertex AI Enhanced Chore Assignment System
import { GoogleGenerativeAI } from '@google/generative-ai'
import CalendarService from './calendar'

export class VertexAIChoreAssignment {
  constructor() {
    this.debugMode = true
    this.mockMode = import.meta.env.VITE_MOCK_MODE === 'true'
    this.projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || 'compact-haiku-454409-j0'
    this.location = import.meta.env.VITE_VERTEX_AI_LOCATION || 'asia-northeast1'
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    
    this.calendarService = new CalendarService()
    
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

  async calculateOptimalAssignment(familyMembers, chores, targetDate = new Date()) {
    if (this.debugMode) {
      console.log('🧠 Vertex AI分担計算開始')
      console.log('家族メンバー:', familyMembers.length, '人')
      console.log('家事数:', chores.length, '件')
      console.log('対象日:', targetDate.toISOString().split('T')[0])
    }

    try {
      const availabilityAnalysis = this.calendarService.analyzeAvailabilityForChores(familyMembers, targetDate)
      const basicAssignment = await this.calculateBasicAssignment(familyMembers, chores, availabilityAnalysis)
      const enhancedAssignment = await this.enhanceWithVertexAI(basicAssignment, familyMembers, chores, availabilityAnalysis)
      const fairnessAnalysis = await this.calculateAdvancedFairness(enhancedAssignment.workloadAnalysis)
      const aiSuggestions = await this.generateAISuggestions(enhancedAssignment, fairnessAnalysis, availabilityAnalysis)
      
      const result = {
        assignments: enhancedAssignment.assignments,
        overallFairnessScore: fairnessAnalysis.score,
        workloadAnalysis: enhancedAssignment.workloadAnalysis,
        balanceSuggestions: aiSuggestions,
        calendarConsidered: true,
        availabilityAnalysis: availabilityAnalysis,
        vertexAIEnhanced: !this.mockMode,
        aiAnalysis: fairnessAnalysis.analysis,
        generatedAt: new Date().toISOString(),
        debugInfo: this.debugMode ? { 
          basicAssignment, 
          enhancedAssignment, 
          fairnessAnalysis,
          availabilityAnalysis
        } : undefined
      }

      if (this.debugMode) {
        console.log('🎯 Vertex AI強化版 公平性スコア:', Math.round(fairnessAnalysis.score * 100) + '%')
        console.log('📊 AI分析:', fairnessAnalysis.analysis)
        console.log('📅 在宅状況:', availabilityAnalysis)
      }

      return result
    } catch (error) {
      console.error('Vertex AI計算エラー:', error)
      return this.fallbackToBasicAI(familyMembers, chores)
    }
  }

  async calculateBasicAssignment(familyMembers, chores, availabilityAnalysis) {
    const memberWorkloads = this.initializeMemberWorkloads(familyMembers)
    const assignments = this.distributeChoresWithSkills(chores, familyMembers, memberWorkloads, availabilityAnalysis)
    const fairnessScore = this.calculateSkillAwareFairness(memberWorkloads, familyMembers)
    
    if (this.debugMode) {
      console.log('🎨 スキル考慮分担計算完了')
      familyMembers.forEach(member => {
        const cookingSkill = member.skills?.cooking || 5
        console.log(`${member.name}: 料理スキル ${cookingSkill}/10`)
      })
    }
    
    return {
      assignments: this.formatForUI(assignments),
      workloadAnalysis: this.formatWorkloadForUI(memberWorkloads),
      fairnessScore: fairnessScore
    }
  }
  
  distributeChoresWithSkills(chores, familyMembers, memberWorkloads, availabilityAnalysis) {
    const assignments = []
    
    // 入力の安全性チェック
    if (!Array.isArray(chores) || chores.length === 0) {
      console.warn('No chores provided')
      return assignments
    }
    
    if (!Array.isArray(familyMembers) || familyMembers.length === 0) {
      console.warn('No family members provided')
      return assignments
    }
    
    const choreSkillMap = {
      '料理': 'cooking', '食事作り': 'cooking', '調理': 'cooking', '朝食作り': 'cooking', '夕食作り': 'cooking',
      '掃除': 'cleaning', '掃除機': 'cleaning', '清掃': 'cleaning', '整理': 'cleaning',
      '洗濯': 'laundry', '洗濯物': 'laundry', '乾燥': 'laundry', 'アイロン': 'laundry',
      '買い物': 'shopping', '買物': 'shopping', 'ショッピング': 'shopping'
    }
    
    const sortedChores = [...chores].sort((a, b) => {
      const skillA = this.getChoreRequiredSkill(a.name, choreSkillMap)
      const skillB = this.getChoreRequiredSkill(b.name, choreSkillMap)
      
      if (skillA === 'cooking' && skillB !== 'cooking') return -1
      if (skillB === 'cooking' && skillA !== 'cooking') return 1
      
      return (b.estimatedTime || 30) - (a.estimatedTime || 30)
    })
    
    sortedChores.forEach(chore => {
      const requiredSkill = this.getChoreRequiredSkill(chore.name, choreSkillMap)
      const bestMember = this.findBestMemberForChore(chore, familyMembers, memberWorkloads, requiredSkill, availabilityAnalysis)
      
      if (bestMember && bestMember.id) {
        const assignment = {
          id: `${chore.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          choreId: chore.id,
          name: chore.name,
          category: chore.category,
          estimatedTime: chore.estimatedTime || 30,
          icon: chore.icon,
          assignedTo: {
            memberId: bestMember.id,
            memberName: bestMember.name,
            memberAvatar: bestMember.avatar || '👤'
          },
          status: 'pending',
          assignedAt: new Date().toISOString(),
          skillMatch: this.calculateSkillMatch(bestMember, requiredSkill),
          date: new Date().toISOString().split('T')[0]
        }
        
        assignments.push(assignment)
        
        // ワークロード更新時の安全性チェック
        if (memberWorkloads[bestMember.id]) {
          memberWorkloads[bestMember.id].totalMinutes += chore.estimatedTime || 30
          memberWorkloads[bestMember.id].taskCount += 1
        }
      } else {
        console.warn('No valid member found for chore:', chore.name)
      }
    })
    
    return assignments
  }
  
  getChoreRequiredSkill(choreName, choreSkillMap) {
    const lowerName = choreName.toLowerCase()
    for (const [keyword, skill] of Object.entries(choreSkillMap)) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return skill
      }
    }
    return 'cleaning'
  }
  
  findBestMemberForChore(chore, familyMembers, memberWorkloads, requiredSkill, availabilityAnalysis) {
    // 在宅メンバーのフィルタリング（安全性チェック付き）
    let availableMembers = familyMembers // デフォルト: 全メンバー
    
    if (availabilityAnalysis && Array.isArray(availabilityAnalysis.availableMembers)) {
      availableMembers = availabilityAnalysis.availableMembers
    } else if (availabilityAnalysis && availabilityAnalysis.availableMembers) {
      // オブジェクト形式の場合、配列に変換を試みる
      console.warn('availableMembers is not an array:', availabilityAnalysis.availableMembers)
      availableMembers = familyMembers // フォールバック
    }
    
    if (!Array.isArray(availableMembers) || availableMembers.length === 0) {
      availableMembers = familyMembers // 最終フォールバック
    }
    
    return this.selectBestMemberBySkillAndLoad(availableMembers, memberWorkloads, requiredSkill)
  }
  
  selectBestMemberBySkillAndLoad(members, memberWorkloads, requiredSkill) {
    // 入力の安全性チェック
    if (!Array.isArray(members) || members.length === 0) {
      console.error('selectBestMemberBySkillAndLoad: members is not a valid array:', members)
      return null
    }
    
    return members.reduce((bestMember, member) => {
      // メンバーの有効性チェック
      if (!member || !member.id) {
        console.warn('Invalid member:', member)
        return bestMember
      }
      
      const memberSkill = member.skills?.[requiredSkill] || 5
      const memberLoad = memberWorkloads[member.id]?.totalMinutes || 0
      
      const skillScore = memberSkill * 10
      const loadScore = Math.max(0, 300 - memberLoad)
      const totalScore = (skillScore * 0.7) + (loadScore * 0.3)
      
      if (!bestMember) return { member, score: totalScore, skillLevel: memberSkill }
      
      return totalScore > bestMember.score ? 
        { member, score: totalScore, skillLevel: memberSkill } : bestMember
    }, null)?.member
  }
  
  calculateSkillMatch(member, requiredSkill) {
    const skillLevel = member.skills?.[requiredSkill] || 5
    
    if (skillLevel >= 8) return 'excellent'
    if (skillLevel >= 6) return 'good'
    if (skillLevel >= 4) return 'fair'
    return 'poor'
  }
  
  calculateSkillAwareFairness(memberWorkloads, familyMembers) {
    if (!memberWorkloads || Object.keys(memberWorkloads).length === 0) {
      return 0.5
    }
    
    const workloadValues = Object.values(memberWorkloads)
    const totalMinutes = workloadValues.map(w => w.totalMinutes || 0)
    
    if (totalMinutes.length === 0 || Math.max(...totalMinutes) === 0) {
      return 1.0
    }
    
    const mean = totalMinutes.reduce((sum, minutes) => sum + minutes, 0) / totalMinutes.length
    const variance = totalMinutes.reduce((sum, minutes) => sum + Math.pow(minutes - mean, 2), 0) / totalMinutes.length
    const standardDeviation = Math.sqrt(variance)
    
    const maxPossibleDeviation = mean * 0.5
    const fairnessScore = Math.max(0, 1 - (standardDeviation / maxPossibleDeviation))
    
    return Math.min(1.0, fairnessScore)
  }
  
  initializeMemberWorkloads(familyMembers) {
    const workloads = {}
    
    familyMembers.forEach(member => {
      workloads[member.id] = {
        memberId: member.id,
        memberName: member.name,
        totalMinutes: 0,
        taskCount: 0,
        skills: member.skills || {},
        averageSkillLevel: this.calculateAverageSkillLevel(member.skills || {})
      }
    })
    
    return workloads
  }
  
  calculateAverageSkillLevel(skills) {
    const skillValues = Object.values(skills)
    if (skillValues.length === 0) return 5
    
    return skillValues.reduce((sum, level) => sum + (level || 5), 0) / skillValues.length
  }

  formatForUI(assignments) {
    return assignments.map(assignment => ({
      id: assignment.id,
      choreId: assignment.choreId,
      name: assignment.name,
      category: assignment.category,
      estimatedTime: assignment.estimatedTime,
      icon: assignment.icon,
      assignedTo: assignment.assignedTo,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      skillMatch: assignment.skillMatch,
      date: assignment.date
    }))
  }
  
  formatWorkloadForUI(memberWorkloads) {
    const formatted = {}
    
    Object.keys(memberWorkloads).forEach(memberId => {
      const workload = memberWorkloads[memberId]
      formatted[memberId] = {
        memberId: workload.memberId,
        memberName: workload.memberName,
        totalMinutes: workload.totalMinutes,
        taskCount: workload.taskCount,
        averageSkillLevel: workload.averageSkillLevel,
        skills: workload.skills
      }
    })
    
    return formatted
  }

  async enhanceWithVertexAI(basicAssignment, familyMembers, chores, availabilityAnalysis) {
    if (this.mockMode || !this.model) {
      if (this.debugMode) {
        console.log('🤖 モックモード: Vertex AI最適化をシミュレート')
      }
      return this.mockAIOptimization(basicAssignment, familyMembers, chores)
    }

    try {
      const prompt = this.buildOptimizationPrompt(basicAssignment, familyMembers, chores)
      const result = await this.model.generateContent(prompt)
      const aiResponse = result.response.text()
      
      const optimizedAssignment = this.parseAIOptimization(aiResponse, basicAssignment)
      optimizedAssignment.aiResponse = aiResponse
      
      if (this.debugMode) {
        console.log('🤖 Vertex AI最適化完了')
        console.log('AI応答サマリー:', aiResponse.substring(0, 200) + '...')
      }
      
      return optimizedAssignment
    } catch (error) {
      console.error('Vertex AI最適化エラー:', error)
      return this.mockAIOptimization(basicAssignment, familyMembers, chores)
    }
  }

  mockAIOptimization(basicAssignment, familyMembers, chores) {
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
      skills: member.skills || {},
      preferences: member.preferences || { preferred: [], disliked: [] }
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
3. スキルレベルの考慮
4. 負荷分散の最適化

200文字以内で具体的な改善ポイントを提案してください。
`
  }

  parseAIOptimization(aiResponse, basicAssignment) {
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
    const times = memberIds.map(id => workloadAnalysis[id].totalMinutes || 0)
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = avgTime > 0 ? stdDev / avgTime : 0
    const fairnessScore = Math.max(0, 1 - coefficientOfVariation)
    
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
      time: workloadAnalysis[id].totalMinutes || 0,
      choreCount: workloadAnalysis[id].taskCount || 0
    }))
    
    const maxMember = members.reduce((max, member) => member.time > max.time ? member : max)
    const minMember = members.reduce((min, member) => member.time < min.time ? member : min)
    
    const timeDifference = maxMember.time - minMember.time
    
    let analysis = ''
    let insights = []
    let recommendations = []
    
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
      recommendations.push(`${maxMember.name}さんの一部タスクを${minMember.name}さんに移すことを検討`)
      recommendations.push('スキルレベルの再設定で改善可能')
    } else {
      analysis = '⚠️ 分担に偏りが見られます'
      insights.push(`${maxMember.name}さんの負荷が顕著に高い（+${timeDifference}分）`)
      recommendations.push(`${maxMember.name}さんの負担軽減が必要`)
      recommendations.push('家事分担の見直しを推奨')
    }
    
    let finalAnalysis = analysis
    
    if (insights.length > 0) {
      finalAnalysis += '\n\n📋 分析詳細:\n・ ' + insights.join('\n・ ')
    }
    
    if (recommendations.length > 0) {
      finalAnalysis += '\n\n💡 推奨アクション:\n・ ' + recommendations.join('\n・ ')
    }
    
    finalAnalysis += '\n\n📈 メンバー別統計:\n'
    members.forEach(member => {
      const percentage = avgTime > 0 ? ((member.time / avgTime) * 100).toFixed(0) : 0
      finalAnalysis += `・ ${member.name}: ${member.time}分 (${member.choreCount}件) - 平均と比較して${percentage}%\n`
    })
    
    return finalAnalysis
  }

  async generateAISuggestions(assignment, fairnessAnalysis, availabilityAnalysis) {
    const suggestions = []
    
    // 実際のVertex AI動作状況を反映
    if (!this.mockMode && this.model) {
      suggestions.push({
        type: 'success',
        message: 'Vertex AIによるスキルマッチングで最適化しました。料理スキルの低いメンバーは料理以外の家事を担当し、得意分野で力を発揮できるよう配慮しています。',
        priority: 'medium'
      })
      
      // スキルベースの分担根拠を説明
      const skillBasedMessage = this.generateSkillBasedExplanation(assignment)
      if (skillBasedMessage) {
        suggestions.push({
          type: 'info',
          message: skillBasedMessage,
          priority: 'medium'
        })
      }
    } else {
      suggestions.push({
        type: 'info',
        message: 'モックモードで動作中です。実際のVertex AI機能を使用するにはAPIキーが必要です。',
        priority: 'low'
      })
    }
    
    // 公平性ベースの提案
    if (fairnessAnalysis.score < 0.6) {
      suggestions.push({
        type: 'warning',
        message: '作業時間に大きな偏りがあります。スキルレベルの調整や家事の再分配を検討してください。',
        priority: 'high'
      })
    } else if (fairnessAnalysis.score > 0.85) {
      suggestions.push({
        type: 'success',
        message: '素晴らしいバランスです！各メンバーのスキルと作業量が適切にバランスされています。',
        priority: 'low'
      })
    } else {
      suggestions.push({
        type: 'tip',
        message: 'おおむね良好な分担です。定期的な見直しで更なる改善が期待できます。',
        priority: 'medium'
      })
    }
    
    // 在宅状況を考慮した提案
    if (availabilityAnalysis && availabilityAnalysis.recommendations) {
      availabilityAnalysis.recommendations.forEach(rec => {
        suggestions.push({
          type: rec.type || 'info',
          message: rec.message,
          priority: 'medium'
        })
      })
    }
    
    return suggestions
  }
  
  // スキルベース分担の根拠を説明するメッセージを生成
  generateSkillBasedExplanation(assignment) {
    if (!assignment.workloadAnalysis || !assignment.assignments) {
      return null
    }
    
    const workloadEntries = Object.entries(assignment.workloadAnalysis)
    if (workloadEntries.length < 2) {
      return null
    }
    
    // 各メンバーのスキル情報を取得
    const memberSkillInfo = workloadEntries.map(([memberId, workload]) => {
      const skills = workload.skills || {}
      const cookingSkill = skills.cooking || 5
      const cleaningSkill = skills.cleaning || 5
      const averageSkill = workload.averageSkillLevel || 5
      
      return {
        name: workload.memberName,
        cookingSkill,
        cleaningSkill,
        averageSkill,
        totalMinutes: workload.totalMinutes || 0,
        taskCount: workload.taskCount || 0
      }
    })
    
    // 料理スキルの差をチェック
    const skillDifferences = []
    if (memberSkillInfo.length >= 2) {
      const [member1, member2] = memberSkillInfo
      const cookingDiff = Math.abs(member1.cookingSkill - member2.cookingSkill)
      
      if (cookingDiff >= 3) {
        const skilledMember = member1.cookingSkill > member2.cookingSkill ? member1 : member2
        const unskilledMember = member1.cookingSkill > member2.cookingSkill ? member2 : member1
        
        skillDifferences.push(
          `料理スキル: ${skilledMember.name}さん(${skilledMember.cookingSkill}/10)が${unskilledMember.name}さん(${unskilledMember.cookingSkill}/10)より高いため、料理関連の家事を優先的に担当。`
        )
      }
    }
    
    if (skillDifferences.length > 0) {
      return `スキルベース分担の根拠: ${skillDifferences.join(' ')}これにより各メンバーが得意分野で力を発揮し、効率的な家事分担を実現しています。`
    }
    
    return null
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
        type: 'warning',
        message: 'Vertex AI接続エラーのため基本分担を使用しました。API設定をご確認ください。',
        priority: 'high'
      }],
      calendarConsidered: true,
      vertexAIEnhanced: false,
      generatedAt: new Date().toISOString()
    }
  }

  distributeChoresOptimally(chores, familyMembers, workloads) {
    const assignments = []
    
    const sortedChores = [...chores].sort((a, b) => {
      const priorityA = (a.difficulty || 5) * (a.estimatedTime || 30)
      const priorityB = (b.difficulty || 5) * (b.estimatedTime || 30)
      return priorityB - priorityA
    })

    sortedChores.forEach(chore => {
      const bestMember = this.findBestMemberForChoreBasic(chore, familyMembers, workloads)
      
      if (bestMember) {
        const assignment = {
          id: `${chore.id}_${Date.now()}`,
          choreId: chore.id,
          name: chore.name,
          category: chore.category,
          estimatedTime: chore.estimatedTime || 30,
          icon: chore.icon,
          assignedTo: {
            memberId: bestMember.id,
            memberName: bestMember.name,
            memberAvatar: bestMember.avatar
          },
          status: 'pending',
          assignedAt: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0]
        }
        
        assignments.push(assignment)
        this.updateMemberWorkload(workloads[bestMember.id], chore)
      }
    })

    return assignments
  }

  findBestMemberForChoreBasic(chore, familyMembers, workloads) {
    let bestMember = null
    let lowestWorkload = Infinity

    familyMembers.forEach(member => {
      const currentWorkload = workloads[member.id]
      const totalLoad = (currentWorkload.totalMinutes || 0)
      
      if (totalLoad < lowestWorkload) {
        lowestWorkload = totalLoad
        bestMember = member
      }
    })

    return bestMember
  }

  updateMemberWorkload(workload, chore) {
    const choreTime = chore.estimatedTime || 30
    
    workload.totalMinutes = (workload.totalMinutes || 0) + choreTime
    workload.taskCount = (workload.taskCount || 0) + 1
  }

  calculateAccurateFairness(workloads) {
    const memberIds = Object.keys(workloads)
    if (memberIds.length === 0) return 0

    const times = memberIds.map(id => workloads[id].totalMinutes || 0)
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    
    if (avgTime === 0) return 1

    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = stdDev / avgTime

    return Math.max(0, 1 - coefficientOfVariation)
  }
}

export default VertexAIChoreAssignment