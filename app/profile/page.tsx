'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">กำลังโหลด...</div>
      </div>
    )
  }

  if (!session) {
    router.replace('/login')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (next !== confirm) {
      setError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'เกิดข้อผิดพลาด')
      } else {
        setSuccess(true)
        setCurrent('')
        setNext('')
        setConfirm('')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-1">โปรไฟล์</h1>
      <p className="text-gray-400 text-sm mb-8">
        ผู้ใช้: <span className="text-green-400 font-medium">{session.user.name}</span>
      </p>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">เปลี่ยนรหัสผ่าน</h2>

        {success && (
          <div className="mb-4 bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-3">
            เปลี่ยนรหัสผ่านสำเร็จ
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">รหัสผ่านปัจจุบัน</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
            <p className="text-gray-600 text-xs mt-1">อย่างน้อย 6 ตัวอักษร</p>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </form>
      </div>
    </div>
  )
}
