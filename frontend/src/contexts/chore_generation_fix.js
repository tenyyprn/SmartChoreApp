  // Generate today's chores from CHORE_CATEGORIES
  const generateTodaysChores = () => {
    try {
      const today = new Date()
      const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const dayOfMonth = today.getDate()
      const currentHour = today.getHours()
      
      const todaysChores = []
      
      // より多くの家事を生成するため、フィルタリングを緩和
      CHORE_CATEGORIES.forEach(category => {
        category.chores.forEach(chore => {
          let shouldAdd = false
          
          // 毎日の家事 - 時間帯制限を緩和
          if (category.frequency === 'daily') {
            shouldAdd = true // 時間帯に関係なく追加
          }
          
          // 週単位の家事 - より頻繁に追加
          if (category.frequency === 'weekly') {
            // 毎日何かしらの週単位家事を追加
            shouldAdd = Math.random() > 0.3 // 70%の確率で追加
          }
          
          // 月単位の家事 - 月の最初の2週間に追加
          if (category.frequency === 'monthly') {
            if (dayOfMonth <= 14) { // 月前半
              shouldAdd = Math.random() > 0.7 // 30%の確率で追加
            }
          }
          
          if (shouldAdd) {
            todaysChores.push({
              id: `${chore.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              choreId: chore.id,
              name: chore.name,
              icon: chore.icon,
              estimatedTime: chore.time,
              difficulty: chore.difficulty,
              category: category.name,
              timeSlot: chore.timeSlot || 'anytime',
              skill: chore.skill,
              description: chore.description,
              tips: chore.tips,
              status: 'pending',
              date: today.toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              generatedFromSchedule: true
            })
          }
        })
      })
      
      // 最低限の家事を保証
      if (todaysChores.length < 3) {
        const essentialChores = [
          {
            id: `essential_1_${Date.now()}`,
            choreId: 'essential_cooking',
            name: '食事の準備',
            icon: '🍳',
            estimatedTime: 45,
            difficulty: 3,
            category: '料理',
            timeSlot: 'morning',
            skill: 'cooking',
            description: '朝食または昼食の準備',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          },
          {
            id: `essential_2_${Date.now()}`,
            choreId: 'essential_cleaning',
            name: '部屋の片付け',
            icon: '🧹',
            estimatedTime: 30,
            difficulty: 2,
            category: '掃除',
            timeSlot: 'anytime',
            skill: 'cleaning',
            description: 'リビングや寝室の整理整頓',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          },
          {
            id: `essential_3_${Date.now()}`,
            choreId: 'essential_dishes',
            name: '食器洗い',
            icon: '🍽️',
            estimatedTime: 20,
            difficulty: 1,
            category: '掃除',
            timeSlot: 'evening',
            skill: 'cleaning',
            description: '食後の食器洗いと片付け',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          },
          {
            id: `essential_4_${Date.now()}`,
            choreId: 'essential_laundry',
            name: '洗濯',
            icon: '👕',
            estimatedTime: 15,
            difficulty: 2,
            category: '洗濯',
            timeSlot: 'morning',
            skill: 'laundry',
            description: '洗濯機を回す（乾燥まで）',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          },
          {
            id: `essential_5_${Date.now()}`,
            choreId: 'essential_grocery',
            name: '買い物',
            icon: '🛒',
            estimatedTime: 60,
            difficulty: 2,
            category: '買い物',
            timeSlot: 'afternoon',
            skill: 'shopping',
            description: '食材や日用品の買い物',
            status: 'pending',
            date: today.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            generatedFromSchedule: true
          }
        ]
        
        // 不足分を補填
        const needed = Math.max(0, 5 - todaysChores.length)
        todaysChores.push(...essentialChores.slice(0, needed))
      }
      
      console.log('✅ 今日の家事を生成:', todaysChores.length, '件')
      console.log('📋 生成された家事:', todaysChores.map(c => c.name).join(', '))
      return todaysChores
      
    } catch (error) {
      console.error('Error generating today\'s chores:', error)
      
      // エラー時のフォールバック：最低限の家事を生成
      return [
        {
          id: `fallback_1_${Date.now()}`,
          choreId: 'fallback_cooking',
          name: '食事の準備',
          icon: '🍳',
          estimatedTime: 30,
          difficulty: 3,
          category: '料理',
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          generatedFromSchedule: true
        },
        {
          id: `fallback_2_${Date.now()}`,
          choreId: 'fallback_cleaning',
          name: '掃除',
          icon: '🧹',
          estimatedTime: 25,
          difficulty: 2,
          category: '掃除',
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          generatedFromSchedule: true
        }
      ]
    }
  }