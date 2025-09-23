import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChore } from '../contexts/ChoreContext'
import { Plus, Trash2, Save, User, Settings, Edit, X, Check } from 'lucide-react'

const SetupPage = () => {
  const navigate = useNavigate()
  const { familyMembers, addFamilyMember, updateFamilyMember, removeFamilyMember } = useChore()
  
  const [editingMember, setEditingMember] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    avatar: '👤',
    age: '',
    skills: {
      cooking: 5,
      cleaning: 5,
      laundry: 5,
      shopping: 5,
      childcare: 5,
      maintenance: 5
    }
  })

  const avatarOptions = ['👨', '👩', '👧', '👦', '👴', '👵', '🧑', '👶']

  const SKILL_TYPES = {
    cooking: '料理・調理',
    cleaning: '掃除・整理',
    laundry: '洗濯・衣類管理',
    shopping: '買い物・外出',
    childcare: '育児・子守',
    maintenance: 'メンテナンス・修理'
  }

  const SKILL_DESCRIPTIONS = {
    1: '全くできない',
    2: '苦手',
    3: 'あまり得意ではない',
    4: '普通',
    5: '標準的',
    6: 'やや得意',
    7: '得意',
    8: 'とても得意',
    9: 'かなり得意',
    10: 'エキスパート'
  }

  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.age) return

    try {
      const memberData = {
        ...newMember,
        age: parseInt(newMember.age),
        id: Date.now().toString()
      }
      
      await addFamilyMember(memberData)
      setNewMember({
        name: '',
        avatar: '👤',
        age: '',
        skills: {
          cooking: 5,
          cleaning: 5,
          laundry: 5,
          shopping: 5,
          childcare: 5,
          maintenance: 5
        }
      })
      setShowAddMember(false)
    } catch (error) {
      console.error('メンバー追加エラー:', error)
    }
  }

  const handleUpdateMember = async (memberId, updates) => {
    try {
      await updateFamilyMember(memberId, updates)
      setEditingMember(null)
    } catch (error) {
      console.error('メンバー更新エラー:', error)
    }
  }

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('このメンバーを削除しますか？')) {
      try {
        await removeFamilyMember(memberId)
      } catch (error) {
        console.error('メンバー削除エラー:', error)
      }
    }
  }

  const SkillSlider = ({ skill, value, onChange, readOnly = false }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">
          {SKILL_TYPES[skill]}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">({SKILL_DESCRIPTIONS[value]})</span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(skill, parseInt(e.target.value))}
          disabled={readOnly}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            readOnly ? 'bg-gray-200' : 'bg-gray-200'
          } ${
            value <= 3 ? 'slider-red' : 
            value <= 6 ? 'slider-yellow' : 
            'slider-green'
          }`}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>苦手</span>
          <span>普通</span>
          <span>得意</span>
        </div>
      </div>
    </div>
  )

  const MemberCard = ({ member }) => {
    const isEditing = editingMember?.id === member.id
    const [editData, setEditData] = useState(member)

    const handleSkillChange = (skill, value) => {
      setEditData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [skill]: value
        }
      }))
    }

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{member.avatar}</span>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-semibold border rounded px-2 py-1"
                />
              ) : (
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
              )}
              <p className="text-sm text-gray-600">
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="w-16 border rounded px-1"
                  />
                ) : (
                  `${member.age}歳`
                )}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleUpdateMember(member.id, editData)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingMember(null)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingMember(member)
                    setEditData(member)
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* アバター選択（編集時） */}
        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">アバター</label>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setEditData(prev => ({ ...prev, avatar }))}
                  className={`p-2 text-2xl rounded-lg border-2 ${
                    editData.avatar === avatar 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* スキル設定 */}
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            スキルレベル
          </h4>
          
          <div className="space-y-3">
            {Object.keys(SKILL_TYPES).map((skill) => (
              <SkillSlider
                key={skill}
                skill={skill}
                value={isEditing ? editData.skills[skill] : member.skills[skill]}
                onChange={handleSkillChange}
                readOnly={!isEditing}
              />
            ))}
          </div>
        </div>

        {/* 総合評価表示 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">総合評価</h5>
          <div className="flex justify-between text-xs">
            <span>
              得意分野: {Object.entries(isEditing ? editData.skills : member.skills)
                .filter(([_, level]) => level >= 7)
                .map(([skill, _]) => SKILL_TYPES[skill])
                .join(', ') || 'なし'}
            </span>
            <span>
              平均レベル: {(Object.values(isEditing ? editData.skills : member.skills)
                .reduce((sum, level) => sum + level, 0) / 6).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">家族設定</h1>
            <p className="text-white/80">
              家族メンバーの情報とスキルレベルを管理
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{familyMembers.length}</div>
            <div className="text-white/80 text-sm">メンバー</div>
          </div>
        </div>
      </div>

      {/* 既存メンバー一覧 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">登録済みメンバー</h2>
          <button
            onClick={() => setShowAddMember(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>メンバー追加</span>
          </button>
        </div>

        {familyMembers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              まだメンバーが登録されていません
            </h3>
            <p className="text-gray-600 mb-6">
              家族メンバーを追加してAI分担システムを開始しましょう
            </p>
            <button
              onClick={() => setShowAddMember(true)}
              className="btn-primary"
            >
              最初のメンバーを追加
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {familyMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>

      {/* メンバー追加フォーム */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新しいメンバーを追加</h3>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 基本情報 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="名前を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">年齢</label>
                <input
                  type="number"
                  value={newMember.age}
                  onChange={(e) => setNewMember(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="年齢"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">アバター</label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setNewMember(prev => ({ ...prev, avatar }))}
                      className={`p-2 text-2xl rounded-lg border-2 ${
                        newMember.avatar === avatar 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* スキル設定 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">スキルレベル設定</h4>
                {Object.keys(SKILL_TYPES).map((skill) => (
                  <SkillSlider
                    key={skill}
                    skill={skill}
                    value={newMember.skills[skill]}
                    onChange={(skill, value) => 
                      setNewMember(prev => ({
                        ...prev,
                        skills: { ...prev.skills, [skill]: value }
                      }))
                    }
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddMember(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddMember}
                disabled={!newMember.name.trim() || !newMember.age}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI分担開始ボタン */}
      {familyMembers.length >= 2 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            設定完了！
          </h3>
          <p className="text-green-700 mb-4">
            {familyMembers.length}名のメンバーが登録されました。AI家事分担システムを開始できます。
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            AI分担システム開始
          </button>
        </div>
      )}

      {/* スライダーのスタイル */}
      <style jsx>{`
        .slider-red::-webkit-slider-thumb {
          background: #ef4444;
        }
        .slider-yellow::-webkit-slider-thumb {
          background: #f59e0b;
        }
        .slider-green::-webkit-slider-thumb {
          background: #10b981;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}

export default SetupPage
