'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR, { mutate } from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type User = {
  id: string
  username: string
  displayName: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  predictions: number
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({ username: '', password: '', displayName: '', role: 'USER' })
  const [formError, setFormError] = useState('')
  const [adding, setAdding] = useState(false)

  const [resetModal, setResetModal] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const [renameModal, setRenameModal] = useState<User | null>(null)
  const [newDisplayName, setNewDisplayName] = useState('')
  const [renameError, setRenameError] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [renameSuccess, setRenameSuccess] = useState(false)

  const { data: users, isLoading } = useSWR<User[]>('/api/admin/users', fetcher)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') router.push('/')
  }, [session, status, router])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setAdding(true)

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setAdding(false)

    if (!res.ok) {
      setFormError(data.error)
    } else {
      setForm({ username: '', password: '', displayName: '', role: 'USER' })
      mutate('/api/admin/users')
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`ลบบัญชี "${user.username}"?\nการทายทั้งหมดจะถูกลบด้วย`)) return
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    mutate('/api/admin/users')
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!renameModal) return
    setRenameError('')
    setRenaming(true)

    const res = await fetch(`/api/admin/users/${renameModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: newDisplayName }),
    })
    const data = await res.json()
    setRenaming(false)

    if (!res.ok) {
      setRenameError(data.error)
    } else {
      setRenameSuccess(true)
      setTimeout(() => {
        setRenameModal(null)
        setRenameSuccess(false)
        setNewDisplayName('')
        mutate('/api/admin/users')
      }, 1000)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!resetModal) return
    setResetError('')
    setResetting(true)

    const res = await fetch(`/api/admin/users/${resetModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    const data = await res.json()
    setResetting(false)

    if (!res.ok) {
      setResetError(data.error)
    } else {
      setResetSuccess(true)
      setTimeout(() => {
        setResetModal(null)
        setResetSuccess(false)
        setNewPassword('')
      }, 1500)
    }
  }

  if (status === 'loading') return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-white text-sm">← กลับ</button>
        <h1 className="text-2xl font-bold">👥 จัดการบัญชีผู้ใช้</h1>
      </div>

      {/* Add User Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
        <h2 className="font-bold text-green-400 mb-4">+ เพิ่มบัญชีใหม่</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          {formError && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg">{formError}</div>
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">ชื่อจริง (แสดงใน leaderboard)</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ชื่อผู้ใช้ (สำหรับ login)</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="อย่างน้อย 3 ตัวอักษร"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">รหัสผ่าน</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">สิทธิ์</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value="USER">User — ผู้เล่นทั่วไป</option>
              <option value="ADMIN">Admin — จัดการระบบได้</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            {adding ? 'กำลังเพิ่ม...' : 'เพิ่มบัญชี'}
          </button>
        </form>
      </div>

      {/* User List */}
      <h2 className="font-bold text-gray-400 mb-3 text-sm uppercase tracking-wider">บัญชีทั้งหมด</h2>
      {isLoading ? (
        <div className="text-gray-500 text-center py-8">กำลังโหลด...</div>
      ) : !users?.length ? (
        <div className="text-gray-600 text-center py-8">ยังไม่มีบัญชี</div>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{user.displayName || user.username}</span>
                  <span className="text-xs text-gray-600">@{user.username}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.role === 'ADMIN' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {user.role === 'ADMIN' ? 'Admin' : 'User'}
                  </span>
                  {user.id === session?.user.id && (
                    <span className="text-xs text-green-500">(ฉัน)</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">ทาย {user.predictions} ครั้ง</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { setRenameModal(user); setNewDisplayName(user.displayName); setRenameError('') }}
                  className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  เปลี่ยนชื่อ
                </button>
                <button
                  onClick={() => { setResetModal(user); setNewPassword(''); setResetError('') }}
                  className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  รีเซทรหัส
                </button>
                {user.id !== session?.user.id && (
                  <button
                    onClick={() => handleDelete(user)}
                    className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ลบ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      {renameModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-1">เปลี่ยนชื่อผู้ใช้</h3>
            <p className="text-gray-400 text-sm mb-5">บัญชี: <span className="text-white font-semibold">{renameModal.username}</span></p>

            {renameSuccess ? (
              <div className="text-center text-green-400 py-4">
                <div className="text-3xl mb-2">✓</div>
                <p className="font-semibold">เปลี่ยนชื่อแล้ว</p>
              </div>
            ) : (
              <form onSubmit={handleRename} className="flex flex-col gap-4">
                {renameError && (
                  <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg">{renameError}</div>
                )}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">ชื่อที่แสดง</label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-green-500"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRenameModal(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={renaming}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {renaming ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-1">รีเซทรหัสผ่าน</h3>
            <p className="text-gray-400 text-sm mb-5">บัญชี: <span className="text-white font-semibold">{resetModal.username}</span></p>

            {resetSuccess ? (
              <div className="text-center text-green-400 py-4">
                <div className="text-3xl mb-2">✓</div>
                <p className="font-semibold">เปลี่ยนรหัสผ่านแล้ว</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col gap-4">
                {resetError && (
                  <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg">{resetError}</div>
                )}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-green-500"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetModal(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={resetting}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {resetting ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
