const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 5000

// セキュリティとミドルウェア
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // 最大100リクエスト
})
app.use(limiter)

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SmartChoreApp Backend'
  })
})

// 家事分担計算API
app.post('/api/chore/calculate', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'フロントエンドでAI計算を実行してください',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 404ハンドラ
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'エンドポイントが見つかりません',
    path: req.originalUrl
  })
})

// エラーハンドラ
app.use((error, req, res, next) => {
  console.error('サーバーエラー:', error)
  res.status(500).json({
    error: 'サーバー内部エラー',
    message: process.env.NODE_ENV === 'development' ? error.message : 'エラーが発生しました'
  })
})

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 SmartChoreApp バックエンドサーバーがポート ${PORT} で起動しました`)
  console.log(`📍 ヘルスチェック: http://localhost:${PORT}/health`)
})

module.exports = app