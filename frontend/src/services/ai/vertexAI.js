// Vertex AI service for intelligent chore assignment
class VertexAIService {
  constructor() {
    this.projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID
    this.location = import.meta.env.VITE_VERTEX_AI_LOCATION || 'us-central1'
    this.endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/text-bison:predict`
  }

  async generateChoreAssignment(familyMembers, existingChores, calendarEvents, preferences = {}) {
    try {
      const prompt = this.buildAssignmentPrompt(familyMembers, existingChores, calendarEvents, preferences)
      
      const response = await this.callVertexAI(prompt)
      return this.parseAIResponse(response)
    } catch (error) {
      console.error('Vertex AI Assignment Error:', error)
      // Fallback to rule-based assignment
      return this.fallbackAssignment(familyMembers, existingChores)
    }
  }

  buildAssignmentPrompt(familyMembers, existingChores, calendarEvents, preferences) {
    return `
あなたは家事分担の専門AIです。以下の情報を基に、公平で効率的な家事分担を提案してください。

## 家族メンバー情報
${familyMembers.map(member => `
- ${member.name} (${member.avatar})
  - 年齢: ${member.age || '不明'}
  - スキル: ${JSON.stringify(member.skills || {})}
  - 好み: ${JSON.stringify(member.preferences || {})}
  - 利用可能時間: ${member.availableHours || '不明'}時間/日
`).join('')}

## 今日の予定
${calendarEvents.map(event => `
- ${event.title}: ${event.startTime}-${event.endTime} (${event.memberName || '全員'})
`).join('') || '特別な予定なし'}

## 必要な家事タスク
- 朝食の準備 (30分, 難易度4)
- 昼食の準備 (40分, 難易度5)  
- 夕食の準備 (60分, 難易度7)
- 食器洗い (15分, 難易度3)
- 洗濯 (20分, 難易度4)
- 掃除機かけ (25分, 難易度5)
- ゴミ出し (10分, 難易度2)
- 風呂掃除 (30分, 難易度6)

## 分担の優先順位
1. 公平性 - 時間と負荷の均等分散
2. 効率性 - スキルと好みの活用
3. 実現可能性 - 予定との重複回避
4. 継続性 - 無理のない分担

以下のJSON形式で分担案を提案してください：

{
  "assignments": [
    {
      "taskName": "タスク名",
      "assignedMember": "担当者名",
      "timeSlot": "morning/afternoon/evening",
      "estimatedTime": 時間(分),
      "difficulty": 難易度(1-10),
      "reason": "割り当て理由"
    }
  ],
  "fairnessScore": 公平性スコア(0-1),
  "recommendations": ["改善提案1", "改善提案2"],
  "totalWorkload": {
    "メンバー名": 総時間数
  }
}
`
  }

  async callVertexAI(prompt) {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt
        }],
        parameters: {
          temperature: 0.3,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Vertex AI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.predictions[0].content
  }

  async getAccessToken() {
    // In production, this would use service account authentication
    // For now, we'll use a placeholder or environment variable
    return import.meta.env.VITE_GOOGLE_ACCESS_TOKEN || 'placeholder-token'
  }

  parseAIResponse(aiResponse) {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('No valid JSON found in AI response')
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      return null
    }
  }

  fallbackAssignment(familyMembers, existingChores) {
    // Simple round-robin assignment as fallback
    const basicTasks = [
      { name: '朝食の準備', timeSlot: 'morning', estimatedTime: 30, difficulty: 4 },
      { name: '昼食の準備', timeSlot: 'afternoon', estimatedTime: 40, difficulty: 5 },
      { name: '夕食の準備', timeSlot: 'evening', estimatedTime: 60, difficulty: 7 },
      { name: '食器洗い', timeSlot: 'evening', estimatedTime: 15, difficulty: 3 },
      { name: '掃除機かけ', timeSlot: 'morning', estimatedTime: 25, difficulty: 5 }
    ]

    const assignments = basicTasks.map((task, index) => ({
      taskName: task.name,
      assignedMember: familyMembers[index % familyMembers.length].name,
      timeSlot: task.timeSlot,
      estimatedTime: task.estimatedTime,
      difficulty: task.difficulty,
      reason: 'ローテーション分担'
    }))

    return {
      assignments,
      fairnessScore: 0.7,
      recommendations: ['AIサービスが利用できない場合の基本分担です'],
      totalWorkload: familyMembers.reduce((acc, member) => {
        acc[member.name] = 40 // 平均的な負荷
        return acc
      }, {})
    }
  }

  async evaluateAssignment(assignments, familyMembers) {
    try {
      const prompt = `
以下の家事分担案を評価してください：

## 分担案
${assignments.map(a => `${a.taskName}: ${a.assignedMember} (${a.estimatedTime}分)`).join('\n')}

## 家族メンバー
${familyMembers.map(m => `${m.name}: スキル ${JSON.stringify(m.skills || {})}`).join('\n')}

以下の観点で0-1のスコアと改善提案を提供してください：
1. 公平性 (時間分散)
2. 効率性 (スキル適合)
3. 実現可能性

JSON形式で回答してください：
{
  "fairnessScore": 0.85,
  "efficiencyScore": 0.90,
  "feasibilityScore": 0.80,
  "overallScore": 0.85,
  "improvements": ["改善提案"]
}
`

      const response = await this.callVertexAI(prompt)
      return this.parseAIResponse(response) || {
        fairnessScore: 0.7,
        efficiencyScore: 0.7,
        feasibilityScore: 0.7,
        overallScore: 0.7,
        improvements: ['AI評価が利用できません']
      }
    } catch (error) {
      console.error('AI Evaluation Error:', error)
      return {
        fairnessScore: 0.7,
        efficiencyScore: 0.7, 
        feasibilityScore: 0.7,
        overallScore: 0.7,
        improvements: ['AI評価が利用できません']
      }
    }
  }
}

export const vertexAI = new VertexAIService()
