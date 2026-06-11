'use client'
import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  matchDate: string
  status: 'UPCOMING' | 'LIVE' | 'FINISHED'
}

type Prediction = {
  homeScore: number
  awayScore: number
}

export default function PredictPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()

  const [match, setMatch] = useState<Match | null>(null)
  const [existing, setExisting] = useState<Prediction | null>(null)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetch('/api/matches')
      .then((r) => r.json())
      .then((matches: Match[]) => {
        const m = matches.find((m) => m.id === matchId)
        setMatch(m ?? null)
      })
  }, [matchId])

  useEffect(() => {
    if (!session) return
    fetch(`/api/predictions?matchId=${matchId}`)
      .then((r) => r.json())
      .then((preds: Prediction[]) => {
        if (preds.length > 0) {
          setExisting(preds[0])
          setHomeScore(String(preds[0].homeScore))
          setAwayScore(String(preds[0].awayScore))
        }
      })
  }, [session, matchId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, homeScore: parseInt(homeScore), awayScore: parseInt(awayScore) }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/'), 1500)
    }
  }

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">กำลังโหลด...</div>
      </div>
    )
  }

  const deadline = new Date(match.matchDate)
  const canPredict = match.status === 'UPCOMING' && new Date() < deadline

  if (!canPredict) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-300 mb-2">ปิดรับทายแล้ว</h2>
        <p className="text-gray-500 text-sm mb-6">แมตช์นี้เริ่มแล้วหรือปิดรับทายไปแล้ว</p>
        <Link href="/" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg">
          กลับหน้าหลัก
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold mb-1">{existing ? 'แก้ไขการทาย' : 'ทายผลแมตช์'}</h1>
          <p className="text-gray-500 text-sm">
            ปิดรับ {new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }).format(deadline)}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 text-lg font-bold">
              <span className="flex-1 text-right">{match.homeTeam}</span>
              <span className="text-gray-500">vs</span>
              <span className="flex-1 text-left">{match.awayTeam}</span>
            </div>
          </div>

          {success ? (
            <div className="text-center text-green-400 py-4">
              <div className="text-3xl mb-2">✓</div>
              <p className="font-semibold">บันทึกการทายแล้ว!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1 text-center">{match.homeTeam}</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="0"
                    required
                  />
                </div>
                <span className="text-gray-500 font-bold text-xl pt-5">-</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1 text-center">{match.awayTeam}</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                <div className="flex justify-between"><span>ทายผล W/D/L ถูก</span><span className="text-green-400 font-bold">+1 คะแนน</span></div>
                <div className="flex justify-between"><span>ทายสกอร์ตรง</span><span className="text-yellow-400 font-bold">+3 คะแนน</span></div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'กำลังบันทึก...' : existing ? 'อัปเดตการทาย' : 'ยืนยันการทาย'}
              </button>

              <Link href="/" className="text-center text-gray-500 hover:text-gray-300 text-sm">
                ยกเลิก
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
