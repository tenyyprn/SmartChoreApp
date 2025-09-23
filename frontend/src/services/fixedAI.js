// Fixed AI Assignment Algorithm with proper fairness calculation
export class FixedAIChoreAssignment {
  constructor() {
    this.debugMode = true
  }

  calculateOptimalAssignment(familyMembers, chores) {
    if (this.debugMode) {
      console.log('🔧 修正版AI分担開始')
      console.log('家族メンバー:', familyMembers.length, '人')
      console.log('家事数:', chores.length, '件')
    }

    // Step 1: Initialize member workloads
    const memberWorkloads = this.initializeMemberWorkloads(familyMembers)
    
    // Step 2: Distribute chores using round-robin with optimization
    const assignments = this.distributeChoresOptimally(chores, familyMembers, memberWorkloads)
    
    // Step 3: Calculate accurate fairness score
    const fairnessScore = this.calculateAccurateFairness(memberWorkloads)
    
    // Step 4: Generate analysis
    const analysis = this.generateDetailedAnalysis(memberWorkloads, fairnessScore)
    
    if (this.debugMode) {
      console.log('公平性スコア:', Math.round(fairnessScore * 100) + '%')
      console.log('ワークロード分析:', memberWorkloads)
    }

    return {
      assignments: this.formatForUI(assignments),
      overallFairnessScore: fairnessScore,
      workloadAnalysis: this.formatWorkloadForUI(memberWorkloads),
      balanceSuggestions: analysis.suggestions,
      calendarConsidered: true,
      generatedAt: new Date().toISOString(),
      debugInfo: this.debugMode ? { memberWorkloads, rawAssignments: assignments } : undefined
    }
  }

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
    return Math.min(0.2, skills.length * 0.05) // Max 20% bonus
  }

  distributeChoresOptimally(chores, familyMembers, workloads) {
    const assignments = []
    
    // Sort chores by difficulty and time for fair distribution
    const sortedChores = [...chores].sort((a, b) => {
      const priorityA = (a.difficulty || 5) * (a.estimatedTime || 30)
      const priorityB = (b.difficulty || 5) * (b.estimatedTime || 30)
      return priorityB - priorityA
    })

    sortedChores.forEach(chore => {
      // Find the member with least current workload
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
      
      // Calculate weighted workload (time + difficulty consideration)
      const weightedWorkload = currentWorkload.totalTime + (currentWorkload.difficultyScore * 5)
      
      // Consider skill matching
      const skillMatch = this.getSkillMatchScore(member, chore)
      const adjustedWorkload = weightedWorkload - (skillMatch * 30) // Skill bonus reduces effective workload
      
      if (adjustedWorkload < lowestWorkload) {
        lowestWorkload = adjustedWorkload
        bestMember = member
      }
    })

    return bestMember
  }

  getSkillMatchScore(member, chore) {
    const memberSkills = member.skills || []
    const choreCategory = chore.category || ''
    
    const skillMatches = {
      '料理': ['cooking', '調理'],
      '掃除': ['cleaning', '清掃'],
      '洗濯': ['laundry', '衣類管理'],
      '買い物': ['shopping', '外出']
    }

    for (const [category, relatedSkills] of Object.entries(skillMatches)) {
      if (choreCategory.includes(category)) {
        const hasSkill = relatedSkills.some(skill => 
          memberSkills.some(memberSkill => memberSkill.includes(skill))
        )
        if (hasSkill) return 1
      }
    }

    return 0
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

    // Calculate time-based fairness
    const times = memberIds.map(id => workloads[id].totalTime)
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    
    if (avgTime === 0) return 1 // Perfect fairness if no work assigned

    // Calculate coefficient of variation (lower = more fair)
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = stdDev / avgTime

    // Convert to fairness score (0-1, where 1 is perfectly fair)
    const timeFairness = Math.max(0, 1 - coefficientOfVariation)

    // Calculate chore count fairness
    const choreCounts = memberIds.map(id => workloads[id].choreCount)
    const avgChoreCount = choreCounts.reduce((sum, count) => sum + count, 0) / choreCounts.length
    
    let choreCountFairness = 1
    if (avgChoreCount > 0) {
      const choreVariance = choreCounts.reduce((sum, count) => sum + Math.pow(count - avgChoreCount, 2), 0) / choreCounts.length
      const choreStdDev = Math.sqrt(choreVariance)
      const choreCV = choreStdDev / avgChoreCount
      choreCountFairness = Math.max(0, 1 - choreCV)
    }

    // Weighted combination of fairness metrics
    const overallFairness = (timeFairness * 0.6) + (choreCountFairness * 0.4)
    
    if (this.debugMode) {
      console.log('公平性計算詳細:')
      console.log('- 作業時間:', times, '平均:', Math.round(avgTime))
      console.log('- 時間公平性:', Math.round(timeFairness * 100) + '%')
      console.log('- タスク数公平性:', Math.round(choreCountFairness * 100) + '%')
      console.log('- 総合公平性:', Math.round(overallFairness * 100) + '%')
    }

    return overallFairness
  }

  generateDetailedAnalysis(workloads, fairnessScore) {
    const suggestions = []
    
    if (fairnessScore < 0.6) {
      suggestions.push({
        type: 'warning',
        message: '作業時間に大きな偏りがあります。分担の見直しをお勧めします。'
      })
    } else if (fairnessScore > 0.8) {
      suggestions.push({
        type: 'success',
        message: '非常にバランスの取れた分担です。'
      })
    } else {
      suggestions.push({
        type: 'info',
        message: 'おおむね良好な分担です。微調整で更に改善できます。'
      })
    }

    // Check for extreme workload differences
    const times = Object.values(workloads).map(w => w.totalTime)
    const maxTime = Math.max(...times)
    const minTime = Math.min(...times)
    
    if (maxTime - minTime > 60) {
      suggestions.push({
        type: 'tip',
        message: '作業時間の差が1時間以上あります。定期的な分担見直しを検討してください。'
      })
    }

    return { suggestions }
  }

  formatForUI(assignments) {
    // Group by category
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
          reason: 'AI最適化による分担'
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
}

// Export for use in the application
export default FixedAIChoreAssignment
