// Real-time notification service
import { toast } from 'react-hot-toast'

class NotificationService {
  constructor() {
    this.permission = null
    this.init()
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission()
    }
  }

  // タスク完了通知
  notifyTaskCompleted(taskName, memberName) {
    this.showNotification({
      title: '✅ タスク完了！',
      body: `${memberName}さんが「${taskName}」を完了しました`,
      icon: '🎉'
    })
  }

  // 新しい分担通知
  notifyNewAssignment(tasksCount) {
    this.showNotification({
      title: '🤖 新しい分担が完成！',
      body: `AI が ${tasksCount} 件のタスクを最適分担しました`,
      icon: '🏠'
    })
  }

  // リマインダー通知
  notifyReminder(taskName, minutesLeft) {
    this.showNotification({
      title: '⏰ タスクリマインダー',
      body: `「${taskName}」まで あと ${minutesLeft} 分です`,
      icon: '🔔'
    })
  }

  showNotification({ title, body, icon }) {
    // ブラウザ通知
    if (this.permission === 'granted') {
      new Notification(title, { body, icon })
    }

    // トースト通知
    toast.success(`${icon} ${title}: ${body}`, {
      duration: 4000,
      position: 'top-right'
    })
  }

  // 音声フィードバック
  playNotificationSound() {
    const audio = new Audio('/notification.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {
      // 音声再生失敗時は無視
    })
  }
}

export const notificationService = new NotificationService()
