'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { TeamCombobox } from '@/app/components/TeamCombobox'

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
  askExtraTime: boolean
  askPenalty: boolean
  extraTimeResult: boolean | null
  penaltyResult: boolean | null
  _count: { predictions: number }
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(d))
}

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'รอเตะ',
  LIVE: 'LIVE',
  FINISHED: 'จบแล้ว',
}

function BoolToggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (v: boolean | null) => void
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(value === true ? null : true)}
          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            value === true
              ? 'bg-green-700 border-green-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          ใช่
        </button>
        <button
          type="button"
          onClick={() => onChange(value === false ? null : false)}
          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            value === false
              ? 'bg-red-800 border-red-600 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          ไม่ใช่
        </button>
      </div>
    </div>
  )
}

export default function AdminMatchesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({ homeTeam: '', awayTeam: '', matchDate: '', weekNumber: '1', askExtraTime: false, askPenalty: false })
  const [formError, setFormError] = useState('')
  const [adding, setAdding] = useState(false)

  const [resultModal, setResultModal] = useState<Match | null>(null)
  const [resultHomeTeam, setResultHomeTeam] = useState('')
  const [resultAwayTeam, setResultAwayTeam] = useState('')
  const [resultHome, setResultHome] = useState('')
  const [resultAway, setResultAway] = useState('')
  const [resultStatus, setResultStatus] = useState<string>('FINISHED')
  const [resultAskExtraTime, setResultAskExtraTime] = useState(false)
  const [resultAskPenalty, setResultAskPenalty] = useState(false)
  const [resultExtraTime, setResultExtraTime] = useState<boolean | null>(null)
  const [resultPenalty, setResultPenalty] = useState<boolean | null>(null)
  const [savingResult, setSavingResult] = useState(false)

  const { data: matches, isLoading } = useSWR<Match[]>('/api/admin/matches', fetcher)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') router.push('/')
  }, [session, status, router])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setAdding(true)

    const res = await fetch('/api/admin/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, matchDate: form.matchDate + ':00+07:00', askExtraTime: form.askExtraTime, askPenalty: form.askPenalty }),
    })
    const data = await res.json()
    setAdding(false)

    if (!res.ok) {
      setFormError(data.error)
    } else {
      setForm({ homeTeam: '', awayTeam: '', matchDate: '', weekNumber: form.weekNumber, askExtraTime: false, askPenalty: false })
      mutate('/api/admin/matches')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบแมตช์นี้?')) return
    await fetch(`/api/admin/matches/${id}`, { method: 'DELETE' })
    mutate('/api/admin/matches')
  }

  async function handleSaveResult() {
    if (!resultModal) return
    setSavingResult(true)

    await fetch(`/api/admin/matches/${resultModal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeTeam: resultHomeTeam,
        awayTeam: resultAwayTeam,
        status: resultStatus,
        homeScore: resultStatus === 'UPCOMING' ? undefined : parseInt(resultHome),
        awayScore: resultStatus === 'UPCOMING' ? undefined : parseInt(resultAway),
        askExtraTime: resultAskExtraTime,
        askPenalty: resultAskPenalty,
        extraTimeResult: resultAskExtraTime ? resultExtraTime : null,
        penaltyResult: resultAskPenalty ? resultPenalty : null,
      }),
    })

    setSavingResult(false)
    setResultModal(null)
    mutate('/api/admin/matches')
  }

  function openResult(match: Match) {
    setResultModal(match)
    setResultHomeTeam(match.homeTeam)
    setResultAwayTeam(match.awayTeam)
    setResultHome(match.homeScore !== null ? String(match.homeScore) : '')
    setResultAway(match.awayScore !== null ? String(match.awayScore) : '')
    setResultStatus(match.status)
    setResultAskExtraTime(match.askExtraTime)
    setResultAskPenalty(match.askPenalty)
    setResultExtraTime(match.extraTimeResult)
    setResultPenalty(match.penaltyResult)
  }

  if (status === 'loading') return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-white text-sm">← กลับ</button>
        <h1 className="text-2xl font-bold">🗓️ จัดการแมตช์</h1>
      </div>

      {/* Add Match Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
        <h2 className="font-bold text-green-400 mb-4">+ เพิ่มแมตช์ใหม่</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          {formError && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg">{formError}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ทีมเหย้า</label>
              <TeamCombobox
                value={form.homeTeam}
                onChange={(v) => setForm({ ...form, homeTeam: v })}
                placeholder="ค้นหาทีม..."
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ทีมเยือน</label>
              <TeamCombobox
                value={form.awayTeam}
                onChange={(v) => setForm({ ...form, awayTeam: v })}
                placeholder="ค้นหาทีม..."
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">วันและเวลาเตะ</label>
              <input
                type="datetime-local"
                value={form.matchDate}
                onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">นัดที่</label>
              <input
                type="number"
                min="1"
                value={form.weekNumber}
                onChange={(e) => setForm({ ...form, weekNumber: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.askExtraTime}
                onChange={(e) => setForm({ ...form, askExtraTime: e.target.checked })}
                className="accent-blue-500 w-4 h-4"
              />
              มีต่อเวาไหม?
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.askPenalty}
                onChange={(e) => setForm({ ...form, askPenalty: e.target.checked })}
                className="accent-blue-500 w-4 h-4"
              />
              มีจุดโทษไหม?
            </label>
          </div>

          <button
            type="submit"
            disabled={adding}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            {adding ? 'กำลังเพิ่ม...' : 'เพิ่มแมตช์'}
          </button>
        </form>
      </div>

      {/* Match List */}
      <h2 className="font-bold text-gray-400 mb-3 text-sm uppercase tracking-wider">แมตช์ทั้งหมด</h2>
      {isLoading ? (
        <div className="text-gray-500 text-center py-8">กำลังโหลด...</div>
      ) : !matches?.length ? (
        <div className="text-gray-600 text-center py-8">ยังไม่มีแมตช์</div>
      ) : (
        <div className="flex flex-col gap-2">
          {matches.map((match) => (
            <div key={match.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {match.homeTeam} vs {match.awayTeam}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  สัปดาห์ {match.weekNumber} • {formatDate(match.matchDate)} • {match._count.predictions} คนทาย
                </div>
                {match.homeScore !== null && (
                  <div className="text-xs text-green-400 mt-0.5">
                    ผล: {match.homeScore} - {match.awayScore}
                  </div>
                )}
                {(match.askExtraTime || match.askPenalty) && (
                  <div className="text-xs text-blue-400 mt-0.5 flex gap-2">
                    {match.askExtraTime && (
                      <span>ต่อเวา: {match.extraTimeResult === null ? '?' : match.extraTimeResult ? 'ใช่' : 'ไม่ใช่'}</span>
                    )}
                    {match.askPenalty && (
                      <span>จุดโทษ: {match.penaltyResult === null ? '?' : match.penaltyResult ? 'ใช่' : 'ไม่ใช่'}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  match.status === 'FINISHED' ? 'bg-gray-700 text-gray-300' :
                  match.status === 'LIVE' ? 'bg-green-600 text-white' :
                  'bg-blue-900 text-blue-300'
                }`}>
                  {STATUS_LABEL[match.status]}
                </span>
                <button
                  onClick={() => openResult(match)}
                  className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  อัปเดต
                </button>
                <button
                  onClick={() => handleDelete(match.id)}
                  className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result Modal */}
      {resultModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">อัปเดตแมตช์</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ทีมเหย้า</label>
                <TeamCombobox value={resultHomeTeam} onChange={setResultHomeTeam} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ทีมเยือน</label>
                <TeamCombobox value={resultAwayTeam} onChange={setResultAwayTeam} />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">สถานะ</label>
              <select
                value={resultStatus}
                onChange={(e) => setResultStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              >
                <option value="UPCOMING">รอเตะ</option>
                <option value="LIVE">LIVE</option>
                <option value="FINISHED">จบแล้ว</option>
              </select>
            </div>

            {resultStatus !== 'UPCOMING' && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block text-center">{resultModal.homeTeam}</label>
                  <input
                    type="number" min="0" max="20"
                    value={resultHome}
                    onChange={(e) => setResultHome(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-center text-xl font-bold focus:outline-none focus:border-green-500"
                    placeholder="0"
                  />
                </div>
                <span className="text-gray-500 font-bold pt-5">-</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block text-center">{resultModal.awayTeam}</label>
                  <input
                    type="number" min="0" max="20"
                    value={resultAway}
                    onChange={(e) => setResultAway(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-center text-xl font-bold focus:outline-none focus:border-green-500"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Bonus questions section */}
            <div className="border border-gray-700 rounded-xl p-4 mb-4 flex flex-col gap-3">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">คำถามพิเศษ (+1 คะแนน/ข้อ)</p>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resultAskExtraTime}
                  onChange={(e) => {
                    setResultAskExtraTime(e.target.checked)
                    if (!e.target.checked) setResultExtraTime(null)
                  }}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-300">มีต่อเวาไหม?</span>
              </label>

              {resultAskExtraTime && (
                <BoolToggle
                  label="ผล: มีต่อเวาไหม?"
                  value={resultExtraTime}
                  onChange={setResultExtraTime}
                />
              )}

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resultAskPenalty}
                  onChange={(e) => {
                    setResultAskPenalty(e.target.checked)
                    if (!e.target.checked) setResultPenalty(null)
                  }}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-300">มีจุดโทษไหม?</span>
              </label>

              {resultAskPenalty && (
                <BoolToggle
                  label="ผล: มีจุดโทษไหม?"
                  value={resultPenalty}
                  onChange={setResultPenalty}
                />
              )}
            </div>

            {resultStatus === 'FINISHED' && (
              <p className="text-xs text-yellow-400 mb-4">⚠️ ระบบจะคำนวณคะแนนให้อัตโนมัติ</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setResultModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveResult}
                disabled={savingResult}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {savingResult ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
