// ChoreContext.jsx の calculateAIAssignment 関数の修正版

import ImprovedChoreAssignmentAI from '../services/improvedAI'

// ChoreContextの中のcalculateAIAssignment関数を以下に置き換え
const calculateAIAssignment = async () => {
  if (state.familyMembers.length === 0) {
    console.warn('家族メンバーが設定されていません')
    return
  }
  
  console.log('🤖 改良版AI分担計算を開始:', state.familyMembers.length + '人の家族メンバー')
  
  try {
    // 改良版AIアルゴリズムを使用
    const improvedAI = new ImprovedChoreAssignmentAI()
    
    // 現在の家事リストを取得
    const availableChores = await choreDatabase.getTodaysChores()
    
    // 空の場合はサンプル家事を生成
    if (availableChores.length === 0) {
      const sampleChores = choreDatabase.generateSampleChores()
      console.log('📋 サンプル家事を生成:', sampleChores.length + '件')
    }
    
    // 最新の家事リストを再取得
    const chores = await choreDatabase.getTodaysChores()
    
    // AI分担計算実行
    const result = await improvedAI.calculateOptimalAssignment(
      state.familyMembers,
      chores,
      {
        prioritizeFairness: true,
        considerSkills: true,
        considerCalendar: true
      }
    )
    
    console.log('✅ 改良版AI分担計算完了 - 公平性スコア:', Math.round(result.overallFairnessScore * 100) + '%')
    
    // 結果を状態に保存
    dispatch({
      type: ACTION_TYPES.CALCULATE_AI_ASSIGNMENT,
      payload: result
    })
    
    // 家事割り当ても更新
    const updatedAssignments = await choreDatabase.applyAIAssignments(result.assignments, state.familyMembers)
    
    dispatch({
      type: ACTION_TYPES.SET_CHORE_ASSIGNMENTS,
      payload: updatedAssignments
    })
    
    return result
    
  } catch (error) {
    console.error('AI分担計算エラー:', error)
    
    // フォールバック: 簡単な分担を実行
    const fallbackResult = await choreDatabase.generateBasicAssignment(state.familyMembers)
    
    dispatch({
      type: ACTION_TYPES.CALCULATE_AI_ASSIGNMENT,
      payload: fallbackResult
    })
    
    return fallbackResult
  }
}
