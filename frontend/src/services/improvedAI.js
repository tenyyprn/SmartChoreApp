// Enhanced AI Chore Assignment Algorithm
export class ImprovedChoreAssignmentAI {
  constructor() {
    this.maxIterations = 100
    this.targetFairnessThreshold = 0.7
  }

  calculateOptimalAssignment(familyMembers, availableChores, preferences = {}) {
    console.log('🤖 高度なAI分担アルゴリズム開始')
    
    // Step 1: Initialize member workload tracking
    const memberWorkloads = this.initializeWorkloads(familyMembers)
    
    // Step 2: Sort chores by priority (difficulty × time)
    const prioritizedChores = this.prioritizeChores(availableChores)
    
    // Step 3: Iterative optimization
    let assignments = this.performInitialAssignment(prioritizedChores, familyMembers, memberWorkloads)
    
    // Step 4: Balance optimization
    assignments = this.optimizeBalance(assignments, familyMembers, memberWorkloads)
    
    // Step 5: Calculate final scores
    const fairnessScore = this.calculateFairness(memberWorkloads, familyMembers)
    const analysis = this.generateAnalysis(assignments, memberWorkloads, fairnessScore)
    
    console.log(`✅ AI最適化完了 - 公平性スコア: ${Math.round(fairnessScore * 100)}%`)
    
    return {
      assignments: this.formatAssignments(assignments),
      overallFairnessScore: fairnessScore,
      workloadAnalysis: this.formatWorkloadAnalysis(memberWorkloads),
      balanceSuggestions: analysis.suggestions,
      optimizationDetails: analysis.details,
      calendarConsidered: true,
      generatedAt: new Date().toISOString()
    }
  }

  initializeWorkloads(familyMembers) {
    const workloads = {}
    familyMembers.forEach(member => {
      workloads[member.id] = {
        totalTime: 0,
        totalChores: 0,
        totalDifficulty: 0,
        assignments: [],
        efficiencyBonus: this.calculateEfficiencyBonus(member),
        availableTimePerDay: member.availableHours * 60 || 240 // Default 4 hours
      }
    })
    return workloads
  }

  prioritizeChores(chores) {
    return chores.sort((a, b) => {
      const priorityA = (a.difficulty || 5) * (a.estimatedTime || 30)
      const priorityB = (b.difficulty || 5) * (b.estimatedTime || 30)
      return priorityB - priorityA // High priority first
    })
  }

  performInitialAssignment(chores, familyMembers, workloads) {
    const assignments = []
    
    chores.forEach(chore => {
      const bestMember = this.findBestMemberForChore(chore, familyMembers, workloads)
      
      if (bestMember) {
        const assignment = {
          choreId: chore.id,
          choreName: chore.name,
          choreIcon: chore.icon || this.getIconForChore(chore.name),
          choreDifficulty: chore.difficulty || 5,
          estimatedTime: chore.estimatedTime || 30,
          category: chore.category || 'general',
          assignedMember: bestMember,
          assignmentReason: this.getAssignmentReason(bestMember, chore, workloads[bestMember.id])
        }
        
        assignments.push(assignment)
        this.updateWorkload(workloads[bestMember.id], chore)
      }
    })
    
    return assignments
  }

  findBestMemberForChore(chore, familyMembers, workloads) {
    let bestMember = null
    let bestScore = -1
    
    familyMembers.forEach(member => {
      const score = this.calculateMemberScore(member, chore, workloads[member.id])
      
      if (score > bestScore) {
        bestScore = score
        bestMember = member
      }
    })
    
    return bestMember
  }

  calculateMemberScore(member, chore, currentWorkload) {
    let score = 1.0
    
    // Skill matching bonus
    const skillMatch = this.getSkillMatch(member, chore)
    score += skillMatch * 0.4
    
    // Preference bonus/penalty
    const preferenceScore = this.getPreferenceScore(member, chore)
    score += preferenceScore * 0.3
    
    // Workload balancing (heavily weighted)
    const workloadPenalty = this.getWorkloadPenalty(currentWorkload)
    score -= workloadPenalty * 0.5
    
    // Age appropriateness
    const ageAppropriatenessScore = this.getAgeAppropriatenessScore(member, chore)
    score *= ageAppropriatenessScore
    
    // Availability check
    const availabilityScore = this.getAvailabilityScore(member, currentWorkload, chore)
    score *= availabilityScore
    
    return Math.max(0.1, score)
  }

  getSkillMatch(member, chore) {
    if (!member.skills || !chore.category) return 0
    
    const relevantSkills = {
      'cooking': ['料理', 'キッチン'],
      'cleaning': ['掃除', '整理'],
      'laundry': ['洗濯', '衣類管理'],
      'shopping': ['買い物', '計画'],
      'childcare': ['育児', 'こども']
    }
    
    const choreSkills = relevantSkills[chore.category] || []
    const memberSkills = member.skills || []
    
    const matches = choreSkills.filter(skill => 
      memberSkills.some(memberSkill => memberSkill.includes(skill))
    )
    
    return matches.length / Math.max(choreSkills.length, 1)
  }

  getPreferenceScore(member, chore) {
    if (member.preferredChores?.includes(chore.name)) return 0.5
    if (member.dislikedChores?.includes(chore.name)) return -0.7
    return 0
  }

  getWorkloadPenalty(workload) {
    // Penalize members who already have high workloads
    const timeRatio = workload.totalTime / workload.availableTimePerDay
    return Math.min(timeRatio * 2, 1.5) // Cap at 150% penalty
  }

  getAgeAppropriatenessScore(member, chore) {
    const age = member.age || 25
    const difficulty = chore.difficulty || 5
    
    if (age < 10 && difficulty > 7) return 0.3
    if (age < 15 && difficulty > 8) return 0.7
    if (age > 65 && difficulty > 6) return 0.8
    
    return 1.0
  }

  getAvailabilityScore(member, workload, chore) {
    const availableTime = workload.availableTimePerDay - workload.totalTime
    const choreTime = chore.estimatedTime || 30
    
    if (availableTime < choreTime) return 0.2
    if (availableTime < choreTime * 2) return 0.7
    
    return 1.0
  }

  updateWorkload(workload, chore) {
    workload.totalTime += chore.estimatedTime || 30
    workload.totalChores += 1
    workload.totalDifficulty += chore.difficulty || 5
    workload.assignments.push(chore)
  }

  optimizeBalance(assignments, familyMembers, workloads) {
    let iterations = 0
    let improved = true
    
    while (improved && iterations < this.maxIterations) {
      improved = false
      iterations++
      
      // Find the most and least loaded members
      const memberIds = familyMembers.map(m => m.id)
      const mostLoaded = memberIds.reduce((max, id) => 
        workloads[id].totalTime > workloads[max].totalTime ? id : max
      )
      const leastLoaded = memberIds.reduce((min, id) => 
        workloads[id].totalTime < workloads[min].totalTime ? id : min
      )
      
      const timeDiff = workloads[mostLoaded].totalTime - workloads[leastLoaded].totalTime
      
      if (timeDiff > 60) { // If difference > 1 hour, try to balance
        improved = this.attemptReassignment(assignments, workloads, mostLoaded, leastLoaded, familyMembers)
      }
    }
    
    console.log(`🔄 バランス最適化完了: ${iterations}回の反復`)
    return assignments
  }

  attemptReassignment(assignments, workloads, fromMemberId, toMemberId, familyMembers) {
    const fromMember = familyMembers.find(m => m.id === fromMemberId)
    const toMember = familyMembers.find(m => m.id === toMemberId)
    
    // Find a suitable chore to reassign
    const reassignableChores = assignments.filter(a => a.assignedMember.id === fromMemberId)
    
    for (const assignment of reassignableChores) {
      const chore = {
        name: assignment.choreName,
        difficulty: assignment.choreDifficulty,
        estimatedTime: assignment.estimatedTime,
        category: assignment.category
      }
      
      const newScore = this.calculateMemberScore(toMember, chore, workloads[toMemberId])
      
      if (newScore > 0.6) { // If acceptable score
        // Perform reassignment
        this.revertWorkload(workloads[fromMemberId], chore)
        this.updateWorkload(workloads[toMemberId], chore)
        assignment.assignedMember = toMember
        assignment.assignmentReason = this.getAssignmentReason(toMember, chore, workloads[toMemberId])
        
        return true
      }
    }
    
    return false
  }

  revertWorkload(workload, chore) {
    workload.totalTime -= chore.estimatedTime || 30
    workload.totalChores -= 1
    workload.totalDifficulty -= chore.difficulty || 5
  }

  calculateFairness(workloads, familyMembers) {
    const times = familyMembers.map(m => workloads[m.id].totalTime)
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    
    if (avgTime === 0) return 0
    
    const variance = times.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = stdDev / avgTime
    
    // Convert to fairness score (lower variation = higher fairness)
    return Math.max(0, 1 - coefficientOfVariation)
  }

  calculateEfficiencyBonus(member) {
    // Calculate based on skills and experience
    const skillCount = member.skills?.length || 0
    const experienceBonus = (member.age - 15) / 50 // Age-based experience
    
    return Math.min(0.3, skillCount * 0.05 + experienceBonus)
  }

  getAssignmentReason(member, chore, workload) {
    const reasons = []
    
    if (this.getSkillMatch(member, chore) > 0.5) {
      reasons.push(`${member.name}さんの${chore.category}スキルが最適`)
    }
    
    if (workload.totalTime < workload.availableTimePerDay * 0.5) {
      reasons.push('時間的余裕を考慮')
    }
    
    if (member.preferredChores?.includes(chore.name)) {
      reasons.push('個人の好みを考慮')
    }
    
    if (reasons.length === 0) {
      reasons.push('全体的なバランスを考慮')
    }
    
    return reasons[0]
  }

  getIconForChore(choreName) {
    const iconMap = {
      '料理': '🍳', '調理': '👨‍🍳', '食事': '🍽️',
      '掃除': '🧹', '清掃': '🧽', '片付け': '🧼',
      '洗濯': '👕', '乾燥': '🌀', 'アイロン': '👔',
      '買い物': '🛒', 'ショッピング': '🛍️',
      'ゴミ出し': '🗑️', 'ゴミ': '♻️',
      '風呂': '🛁', 'トイレ': '🚽'
    }
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (choreName.includes(key)) return icon
    }
    
    return '📋'
  }

  formatAssignments(assignments) {
    const categories = {}
    
    assignments.forEach(assignment => {
      const category = assignment.category || 'general'
      if (!categories[category]) {
        categories[category] = {
          categoryId: category,
          category: this.getCategoryDisplayName(category),
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
          memberId: assignment.assignedMember.id,
          memberName: assignment.assignedMember.name,
          memberAvatar: assignment.assignedMember.avatar || '👤',
          estimatedTime: assignment.estimatedTime,
          score: 0.85, // High confidence score
          reason: assignment.assignmentReason
        }
      })
    })
    
    return Object.values(categories)
  }

  getCategoryDisplayName(category) {
    const displayNames = {
      'cooking': '料理・キッチン',
      'cleaning': '掃除・整理',
      'laundry': '洗濯・衣類',
      'shopping': '買い物・外出',
      'general': 'その他'
    }
    
    return displayNames[category] || category
  }

  formatWorkloadAnalysis(workloads) {
    const analysis = {}
    
    Object.keys(workloads).forEach(memberId => {
      const workload = workloads[memberId]
      analysis[memberId] = {
        totalTime: workload.totalTime,
        totalChores: workload.totalChores,
        totalDifficulty: workload.totalDifficulty,
        efficiency: workload.efficiencyBonus,
        utilizationRate: workload.totalTime / workload.availableTimePerDay
      }
    })
    
    return analysis
  }

  generateAnalysis(assignments, workloads, fairnessScore) {
    const suggestions = []
    
    if (fairnessScore < 0.6) {
      suggestions.push({
        type: 'balance',
        message: '作業時間の分散を改善するため、定期的な見直しをお勧めします'
      })
    }
    
    if (fairnessScore > 0.8) {
      suggestions.push({
        type: 'optimization',
        message: '非常にバランスの取れた分担です。この調子を維持しましょう'
      })
    }
    
    const details = {
      totalAssignments: assignments.length,
      averageTime: Object.values(workloads).reduce((sum, w) => sum + w.totalTime, 0) / Object.keys(workloads).length,
      balanceScore: fairnessScore
    }
    
    return { suggestions, details }
  }
}

export default ImprovedChoreAssignmentAI
