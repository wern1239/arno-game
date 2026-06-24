'use client'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type HistoryItem = {
  homeTeam: string
  awayTeam: string
  predictedHome: number
  predictedAway: number
  actualHome: number | null
  actualAway: number | null
  points: number
}

type SpecialHistoryItem = {
  type: 'FINAL_PAIR' | 'PODIUM'
  answer1: string
  answer2?: string | null
  answer3?: string | null
  points: number
  result1?: string | null
  result2?: string | null
  result3?: string | null
}

type Entry = {
  id: string
  username: string
  displayName: string
  totalPoints: number
  matchPoints: number
  specialPoints: number
  totalPredictions: number
  correct: number
  exact: number
  history: HistoryItem[]
  specialHistory: SpecialHistoryItem[]
}

const medals = ['🥇', '🥈', '🥉']

function HistoryPanel({
  history,
  specialHistory,
  matchPoints,
  specialPoints,
  onClose,
}: {
  history: HistoryItem[]
  specialHistory: SpecialHistoryItem[]
  matchPoints: number
  specialPoints: number
  onClose: () => void
}) {
  return (
    <div className="mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">ประวัติการทาย</p>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-gray-700 transition-colors">
          ปิด ✕
        </button>
      </div>

      {specialHistory.length > 0 && (
        <div className="px-3 pb-2">
          <p className="text-xs text-purple-400 font-semibold mb-1.5">⭐ คำถามพิเศษ (+{specialPoints})</p>
          <div className="flex flex-col gap-1.5">
            {specialHistory.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-gray-900 rounded-lg px-3 py-2 shrink-0">
                <div className="flex-1 min-w-0">
                  {s.type === 'FINAL_PAIR' ? (
                    <div className="text-gray-300">⚔️ {s.answer1} vs {s.answer2}</div>
                  ) : (
                    <div className="text-gray-300 flex flex-col gap-0.5">
                      <span>🥇 {s.answer1}</span>
                      {s.answer2 && <span>🥈 {s.answer2}</span>}
                      {s.answer3 && <span>🥉 {s.answer3}</span>}
                    </div>
                  )}
                </div>
                <span className={`ml-3 font-bold text-sm shrink-0 ${s.points > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                  {s.points > 0 ? `+${s.points}` : s.result1 ? '0' : '?'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!history.length ? (
        <p className="text-gray-500 text-xs text-center pb-3">ยังไม่มีแมตช์ที่จบแล้ว</p>
      ) : (
        <>
          <p className="text-xs text-gray-400 font-semibold px-3 pb-1.5">นัดปกติ (+{matchPoints})</p>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-scroll px-3 pb-3 scrollbar-thin">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-gray-900 rounded-lg px-3 py-2 shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 truncate">{h.homeTeam} vs {h.awayTeam}</div>
                  <div className="text-gray-500 mt-0.5">
                    ทาย <span className="text-white">{h.predictedHome}–{h.predictedAway}</span>
                    {' · '}ผล <span className="text-white">{h.actualHome}–{h.actualAway}</span>
                  </div>
                </div>
                <span className={`ml-3 font-bold text-sm shrink-0 ${
                  h.points === 3 ? 'text-yellow-400' :
                  h.points === 1 ? 'text-green-400' :
                  'text-red-400'
                }`}>
                  {h.points > 0 ? `+${h.points}` : '0'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function LeaderboardPage() {
  const [openId, setOpenId] = useState<string | null>(null)

  const { data: board, isLoading } = useSWR<Entry[]>('/api/leaderboard', fetcher, {
    refreshInterval: 15000,
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🏆 ตารางคะแนน</h1>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="animate-pulse text-green-400">●</span> อัปเดตทุก 15 วิ
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">กำลังโหลด...</div>
      ) : !board?.length ? (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-3">📊</div>
          <p>ยังไม่มีข้อมูล</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {board.map((entry, i) => (
            <div key={entry.id}>
              <button
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left ${
                  openId === entry.id ? 'rounded-b-none border-b-0' : ''
                } ${
                  i === 0 ? 'bg-yellow-900/20 border-yellow-700/50' :
                  i === 1 ? 'bg-gray-500/10 border-gray-600/50' :
                  i === 2 ? 'bg-orange-900/20 border-orange-700/50' :
                  'bg-gray-900 border-gray-800'
                }`}
                onClick={() => setOpenId(openId === entry.id ? null : entry.id)}
              >
                <div className="w-8 text-center text-xl shrink-0">
                  {i < 3 ? medals[i] : <span className="text-gray-500 font-bold text-sm">{i + 1}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{entry.displayName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ทาย {entry.totalPredictions} · ถูก {entry.correct} · ตรง {entry.exact}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-green-400">{entry.totalPoints}</div>
                  <div className="text-xs text-gray-500">คะแนน</div>
                </div>

                <span className="text-gray-500 text-xs shrink-0">
                  {openId === entry.id ? '▲' : '▼'}
                </span>
              </button>

              {openId === entry.id && (
                <HistoryPanel
                  history={entry.history}
                  specialHistory={entry.specialHistory ?? []}
                  matchPoints={entry.matchPoints ?? entry.totalPoints}
                  specialPoints={entry.specialPoints ?? 0}
                  onClose={() => setOpenId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
