'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    await signIn('credentials', { username, password, redirect: false })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
          <p className="text-gray-500 text-sm mt-1">Football Prediction</p>
        </div>

        {/* Notice */}
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-3 mb-4 text-sm text-yellow-300">
          <p className="font-semibold mb-1">⚠️ กรุณาใช้ชื่อจริงของคุณ</p>
          <p className="text-yellow-400/80 text-xs leading-relaxed">
            เพื่อความยุติธรรมและป้องกันการสร้างหลายบัญชี
            ชื่อจริงจะแสดงในตารางคะแนนให้เพื่อนๆ เห็น
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex flex-col gap-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              ชื่อจริง <span className="text-yellow-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
              required
            />
            <p className="text-xs text-gray-600 mt-1">ชื่อนี้จะแสดงในตารางคะแนน</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">ชื่อผู้ใช้ (สำหรับ login)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="อย่างน้อย 3 ตัวอักษร"
              minLength={3}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>

          <p className="text-center text-sm text-gray-500">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-green-400 hover:underline font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
