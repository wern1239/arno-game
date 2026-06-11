'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    setLoading(false)
    if (res?.error) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 text-sm mt-1">Football Prediction</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex flex-col gap-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">ชื่อผู้ใช้</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="กรอกชื่อผู้ใช้"
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
              placeholder="กรอกรหัสผ่าน"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-green-400 hover:underline font-medium">
              สมัครสมาชิก
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
