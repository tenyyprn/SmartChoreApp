// Voice command service for hands-free operation
class VoiceCommandService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.commands = new Map()
    this.init()
  }

  init() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'ja-JP'
      
      this.recognition.onresult = this.handleResult.bind(this)
      this.recognition.onerror = this.handleError.bind(this)
      this.recognition.onend = this.handleEnd.bind(this)
      
      this.setupCommands()
    }
  }

  setupCommands() {
    // 家事分担コマンド
    this.commands.set('分担して', () => this.executeAIAssignment())
    this.commands.set('分担実行', () => this.executeAIAssignment())
    this.commands.set('えーあい分担', () => this.executeAIAssignment())
    
    // タスク操作コマンド
    this.commands.set('完了', () => this.markTaskCompleted())
    this.commands.set('終了', () => this.markTaskCompleted())
    this.commands.set('できた', () => this.markTaskCompleted())
    
    // ナビゲーションコマンド
    this.commands.set('ホーム', () => this.navigateTo('/'))
    this.commands.set('カレンダー', () => this.navigateTo('/calendar'))
    this.commands.set('設定', () => this.navigateTo('/settings'))
    
    // タスク追加コマンド
    this.commands.set('タスク追加', () => this.openManualTaskForm())
    this.commands.set('手動追加', () => this.openManualTaskForm())
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.isListening = true
      this.recognition.start()
      console.log('🎤 音声認識開始')
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false
      this.recognition.stop()
      console.log('🔇 音声認識停止')
    }
  }

  handleResult(event) {
    const transcript = event.results[0][0].transcript.toLowerCase().trim()
    console.log('🎤 認識結果:', transcript)
    
    // コマンドマッチング
    for (const [command, action] of this.commands) {
      if (transcript.includes(command)) {
        console.log('✅ コマンド実行:', command)
        action()
        this.speak(`${command}を実行します`)
        return
      }
    }
    
    // 特定のタスク名での完了コマンド
    if (transcript.includes('完了') || transcript.includes('終了')) {
      this.handleTaskNameCompletion(transcript)
      return
    }
    
    this.speak('コマンドが認識できませんでした')
  }

  handleTaskNameCompletion(transcript) {
    // 現在のタスクから該当するものを探す
    const currentTasks = this.getCurrentTasks()
    
    for (const task of currentTasks) {
      if (transcript.includes(task.name)) {
        this.completeSpecificTask(task.id)
        this.speak(`${task.name}を完了にしました`)
        return
      }
    }
    
    this.speak('該当するタスクが見つかりませんでした')
  }

  handleError(event) {
    console.error('音声認識エラー:', event.error)
    this.isListening = false
  }

  handleEnd() {
    this.isListening = false
  }

  // 音声合成でフィードバック
  speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 1.1
      utterance.pitch = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  // コマンド実行メソッド
  executeAIAssignment() {
    // AI分担実行のトリガー
    window.dispatchEvent(new CustomEvent('voice-command:ai-assignment'))
  }

  markTaskCompleted() {
    // 最初の未完了タスクを完了にする
    window.dispatchEvent(new CustomEvent('voice-command:complete-task'))
  }

  navigateTo(path) {
    // ページナビゲーション
    window.dispatchEvent(new CustomEvent('voice-command:navigate', { 
      detail: { path } 
    }))
  }

  openManualTaskForm() {
    // 手動タスク追加フォームを開く
    window.dispatchEvent(new CustomEvent('voice-command:add-task'))
  }

  completeSpecificTask(taskId) {
    // 特定のタスクを完了にする
    window.dispatchEvent(new CustomEvent('voice-command:complete-specific-task', { 
      detail: { taskId } 
    }))
  }

  getCurrentTasks() {
    // ChoreContextから現在のタスクを取得
    // これは実際のコンテキストから取得する必要がある
    return []
  }

  // トグル機能
  toggleListening() {
    if (this.isListening) {
      this.stopListening()
    } else {
      this.startListening()
    }
  }

  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }
}

export const voiceCommandService = new VoiceCommandService()
