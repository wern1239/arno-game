'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Prediction = {
  matchId: string
  homeScore: number
  awayScore: number
  points: number
  match: {
    homeTeam: string
    awayTeam: string
    status: string
    homeScore: number | null
    awayScore: number | null
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const { data: predictions } = useSWR<Prediction[]>(
    session ? '/api/admin/my-predictions' : null,
    fetcher
  )

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') router.push('/')
  }, [session, status, router])

  if (status === 'loading') return null

  const finished = predictions?.filter((p) => p.match.status === 'FINISHED') ?? []
  const totalPoints = finished.reduce((sum, p) => sum + p.points, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">⚙️ Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-8">จัดการแมตช์และผลการแข่งขัน</p>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <Link
          href="/admin/matches"
          className="bg-gray-900 border border-gray-800 hover:border-green-700 rounded-xl p-6 transition-colors"
        >
          <div className="text-3xl mb-3">🗓️</div>
          <h2 className="text-lg font-bold mb-1">จัดการแมตช์</h2>
          <p className="text-gray-500 text-sm">เพิ่มแมตช์ใหม่ กรอกผลการแข่งขัน และจัดการสถานะ</p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-gray-900 border border-gray-800 hover:border-green-700 rounded-xl p-6 transition-colors"
        >
          <div className="text-3xl mb-3">👥</div>
          <h2 className="text-lg font-bold mb-1">จัดการบัญชีผู้ใช้</h2>
          <p className="text-gray-500 text-sm">เพิ่มลบบัญชี และรีเซทรหัสผ่าน</p>
        </Link>

        <Link
          href="/leaderboard"
          className="bg-gray-900 border border-gray-800 hover:border-green-700 rounded-xl p-6 transition-colors"
        >
          <div className="text-3xl mb-3">🏆</div>
          <h2 className="text-lg font-bold mb-1">ดูตารางคะแนน</h2>
          <p className="text-gray-500 text-sm">ดูอันดับคะแนนของผู้เล่นทั้งหมด</p>
        </Link>
      </div>

      {/* Admin's own score */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-300">📊 คะแนนของฉัน (ไม่นับใน leaderboard)</h2>
          <span className="text-2xl font-bold text-green-400">{totalPoints} คะแนน</span>
        </div>

        {!predictions?.length ? (
          <p className="text-gray-600 text-sm">ยังไม่มีการทาย</p>
        ) : (
          <div className="flex flex-col gap-2">
            {predictions.map((p) => (
              <div key={p.matchId} className="flex items-center justify-between text-sm bg-gray-800 rounded-lg px-4 py-2.5">
                <div>
                  <span className="font-medium">{p.match.homeTeam} vs {p.match.awayTeam}</span>
                  <span className="text-gray-500 ml-2">ทาย: {p.homeScore}–{p.awayScore}</span>
                </div>
                <div className="text-right">
                  {p.match.status === 'FINISHED' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{p.match.homeScore}–{p.match.awayScore}</span>
                      <span className={`font-bold ${p.points === 3 ? 'text-yellow-400' : p.points === 1 ? 'text-green-400' : 'text-red-400'}`}>
                        +{p.points}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-600 text-xs">รอผล</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
