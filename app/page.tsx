'use client'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  matchDate: string
  homeScore: number | null
  awayScore: number | null
  status: 'UPCOMING' | 'LIVE' | 'FINISHED'
  weekNumber: number
  _count: { predictions: number }
}

type Prediction = {
  matchId: string
  homeScore: number
  awayScore: number
  points: number
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(dateStr))
}

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'LIVE')
    return <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>
  if (status === 'FINISHED')
    return <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">จบแล้ว</span>
  return <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">รอเตะ</span>
}

function MatchCard({ match, prediction }: { match: Match; prediction?: Prediction }) {
  const canPredict = match.status === 'UPCOMING' && new Date() < new Date(match.matchDate)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={match.status} />
        <span className="text-xs text-gray-500">{formatDate(match.matchDate)}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 text-right font-semibold text-sm sm:text-base leading-tight">{match.homeTeam}</span>
        <div className="text-center shrink-0 min-w-[64px]">
          {match.status !== 'UPCOMING' && match.homeScore !== null ? (
            <span className="text-xl font-bold">{match.homeScore} - {match.awayScore}</span>
          ) : (
            <span className="text-gray-500 font-bold">vs</span>
          )}
        </div>
        <span className="flex-1 font-semibold text-sm sm:text-base leading-tight">{match.awayTeam}</span>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-xs text-gray-600">{match._count.predictions} คนทาย</span>
        <div className="flex items-center gap-3">
          {prediction ? (
            <>
              <span className="text-gray-400">ทาย: {prediction.homeScore} - {prediction.awayScore}</span>
              {match.status === 'FINISHED' && (
                <span className={`font-bold ${prediction.points === 5 ? 'text-yellow-400' : prediction.points === 3 ? 'text-green-400' : 'text-red-400'}`}>
                  +{prediction.points} คะแนน
                </span>
              )}
              {canPredict && (
                <Link href={`/predict/${match.id}`} className="text-xs text-blue-400 hover:underline">แก้ไข</Link>
              )}
            </>
          ) : canPredict ? (
            <Link href={`/predict/${match.id}`} className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-1.5 rounded-lg font-semibold transition-colors">
              ทายผล
            </Link>
          ) : (
            <span className="text-xs text-gray-600">ปิดรับทาย</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: session } = useSession()
  const { data: matches, isLoading } = useSWR<Match[]>('/api/matches', fetcher, { refreshInterval: 30000 })
  const { data: predictions } = useSWR<Prediction[]>(session ? '/api/predictions' : null, fetcher, { refreshInterval: 30000 })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">กำลังโหลด...</div>
      </div>
    )
  }

  if (!matches?.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">⚽</div>
        <h2 className="text-xl font-bold text-gray-300 mb-2">ยังไม่มีแมตช์</h2>
        <p className="text-gray-500">รอ admin เพิ่มแมตช์ก่อนนะ</p>
      </div>
    )
  }

  const predMap = new Map(predictions?.map((p) => [p.matchId, p]) ?? [])
  const weeks = [...new Set(matches.map((m) => m.weekNumber))].sort((a, b) => a - b)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {!session && (
        <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 mb-6 text-center text-sm">
          <Link href="/login" className="text-green-400 font-bold underline">เข้าสู่ระบบ</Link>
          {' '}หรือ{' '}
          <Link href="/register" className="text-green-400 font-bold underline">สมัครสมาชิก</Link>
          {' '}เพื่อทายผล
        </div>
      )}
      {weeks.map((week) => (
        <div key={week} className="mb-8">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            นัดที่ {week}
          </h2>
          <div className="flex flex-col gap-3">
            {matches.filter((m) => m.weekNumber === week).map((match) => (
              <MatchCard key={match.id} match={match} prediction={predMap.get(match.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
