'use client'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import useSWR from 'swr'
import { TeamCombobox } from '@/app/components/TeamCombobox'
import { FlagImg } from '@/app/components/FlagImg'
import { TEAMS } from '@/lib/flags'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type MyPrediction = {
  answer1: string
  answer2?: string | null
  answer3?: string | null
  points: number
}

type Question = {
  id: string
  type: 'FINAL_PAIR' | 'PODIUM'
  isOpen: boolean
  deadline: string | null
  result1: string | null
  result2: string | null
  result3: string | null
  myPrediction: MyPrediction | null
}

function flagCode(name: string) {
  return TEAMS.find((t) => t.name === name)?.code ?? ''
}

function TeamBadge({ name }: { name: string }) {
  const code = flagCode(name)
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-white">
      {code && <FlagImg code={code} />}
      {name}
    </span>
  )
}

function DeadlineBadge({ deadline, isOpen }: { deadline: string | null; isOpen: boolean }) {
  if (!isOpen) return <span className="text-xs text-red-400 font-semibold">ปิดรับแล้ว</span>
  if (!deadline) return <span className="text-xs text-green-400 font-semibold">เปิดรับ</span>
  const d = new Date(deadline)
  const past = new Date() >= d
  if (past) return <span className="text-xs text-red-400 font-semibold">หมดเวลา</span>
  return (
    <span className="text-xs text-yellow-400 font-semibold">
      ปิดรับ {d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
    </span>
  )
}

function FinalPairCard({ q, onSaved }: { q: Question; onSaved: () => void }) {
  const [t1, setT1] = useState(q.myPrediction?.answer1 ?? '')
  const [t2, setT2] = useState(q.myPrediction?.answer2 ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLocked = !q.isOpen || (q.deadline != null && new Date() >= new Date(q.deadline))
  const hasResult = q.result1 && q.result2

  async function submit() {
    if (!t1 || !t2) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/special-questions/${q.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer1: t1, answer2: t2 }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? `Error ${res.status}`)
      return
    }
    setSaved(true)
    onSaved()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-white">⚔️ ทายคู่นัดชิง</h2>
        <DeadlineBadge deadline={q.deadline} isOpen={q.isOpen} />
      </div>
      <p className="text-xs text-gray-500 mb-4">เลือก 2 ทีมที่จะเจอกันในนัดชิงชนะเลิศ (ลำดับไม่สำคัญ)</p>

      {hasResult && (
        <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4">
          <p className="text-xs text-gray-400 mb-1.5">ผลจริง</p>
          <div className="flex items-center gap-3">
            <TeamBadge name={q.result1!} />
            <span className="text-gray-500">vs</span>
            <TeamBadge name={q.result2!} />
          </div>
        </div>
      )}

      {q.myPrediction && (() => {
        const predicted = new Set([q.myPrediction.answer1, q.myPrediction.answer2 ?? ''])
        const actual = hasResult ? new Set([q.result1!, q.result2!]) : null
        const hits = actual ? [...predicted].filter(t => t && actual.has(t)).length : 0
        const livePoints = hits === 2 ? 12 : hits === 1 ? 4 : 0
        return (
          <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4">
            <p className="text-xs text-gray-400 mb-1.5">คำตอบของคุณ</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                {[q.myPrediction.answer1, q.myPrediction.answer2 ?? ''].map((team, i) => {
                  const correct = actual?.has(team)
                  return (
                    <span key={i} className={correct ? 'text-green-400' : actual ? 'text-red-400' : 'text-white'}>
                      <TeamBadge name={team} />
                    </span>
                  )
                })}
              </div>
              {hasResult && (
                <span className={`text-lg font-bold ml-3 shrink-0 ${livePoints > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                  +{livePoints}
                </span>
              )}
            </div>
          </div>
        )
      })()}

      {!isLocked && (
        <div className="flex flex-col gap-2">
          <TeamCombobox value={t1} onChange={setT1} placeholder="ทีมที่ 1..." />
          <TeamCombobox value={t2} onChange={setT2} placeholder="ทีมที่ 2..." />
          <button
            onClick={submit}
            disabled={saving || !t1 || !t2}
            className="mt-1 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            {saved ? '✓ บันทึกแล้ว' : saving ? 'กำลังบันทึก...' : q.myPrediction ? 'แก้ไขคำตอบ' : 'ส่งคำตอบ'}
          </button>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
      )}
    </div>
  )
}

function PodiumCard({ q, onSaved }: { q: Question; onSaved: () => void }) {
  const [a1, setA1] = useState(q.myPrediction?.answer1 ?? '')
  const [a2, setA2] = useState(q.myPrediction?.answer2 ?? '')
  const [a3, setA3] = useState(q.myPrediction?.answer3 ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLocked = !q.isOpen || (q.deadline != null && new Date() >= new Date(q.deadline))
  const hasResult = q.result1 && q.result2 && q.result3

  async function submit() {
    if (!a1 || !a2 || !a3) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/special-questions/${q.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer1: a1, answer2: a2, answer3: a3 }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? `Error ${res.status}`)
      return
    }
    setSaved(true)
    onSaved()
    setTimeout(() => setSaved(false), 2000)
  }

  const ranks = [
    { label: '🥇 แชมป์', answer: q.myPrediction?.answer1, result: q.result1, pts: 15 },
    { label: '🥈 รองแชมป์', answer: q.myPrediction?.answer2, result: q.result2, pts: 10 },
    { label: '🥉 อันดับ 3', answer: q.myPrediction?.answer3, result: q.result3, pts: 6 },
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-white">🏆 ทายอันดับ 1 / 2 / 3</h2>
        <DeadlineBadge deadline={q.deadline} isOpen={q.isOpen} />
      </div>
      <p className="text-xs text-gray-500 mb-4">ทายแชมป์ +15 · รองแชมป์ +10 · อันดับ 3 +6 (คิดคะแนนแต่ละอันดับอิสระ)</p>

      {hasResult && (
        <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4 flex flex-col gap-1.5">
          <p className="text-xs text-gray-400 mb-0.5">ผลจริง</p>
          {ranks.map(({ label, result }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="text-gray-400 w-24 shrink-0">{label}</span>
              {result ? <TeamBadge name={result} /> : <span className="text-gray-600">-</span>}
            </div>
          ))}
        </div>
      )}

      {q.myPrediction && (
        <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4 flex flex-col gap-2">
          <p className="text-xs text-gray-400 mb-0.5">คำตอบของคุณ</p>
          {ranks.map(({ label, answer, result, pts }) => {
            const correct = hasResult && answer === result
            const wrong = hasResult && answer && answer !== result
            return (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 w-24 shrink-0">{label}</span>
                {answer ? (
                  <span className={`flex-1 ${correct ? 'text-green-400' : wrong ? 'text-red-400' : 'text-white'}`}>
                    <TeamBadge name={answer} />
                  </span>
                ) : (
                  <span className="flex-1 text-gray-600">-</span>
                )}
                {hasResult && answer && (
                  <span className={`font-bold ml-2 ${correct ? 'text-green-400' : 'text-gray-600'}`}>
                    {correct ? `+${pts}` : '0'}
                  </span>
                )}
              </div>
            )
          })}
          {hasResult && (
            <div className="border-t border-gray-700 pt-2 flex justify-between text-sm font-bold">
              <span className="text-gray-400">รวม</span>
              <span className="text-green-400">+{q.myPrediction.points}</span>
            </div>
          )}
        </div>
      )}

      {hasResult && !q.myPrediction && (
        <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4 flex flex-col gap-1.5">
          {ranks.map(({ label, result }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="text-gray-400 w-24 shrink-0">{label}</span>
              {result && <TeamBadge name={result} />}
            </div>
          ))}
        </div>
      )}

      {!isLocked && (
        <div className="flex flex-col gap-2">
          <TeamCombobox value={a1} onChange={setA1} placeholder="🥇 แชมป์..." />
          <TeamCombobox value={a2} onChange={setA2} placeholder="🥈 รองแชมป์..." />
          <TeamCombobox value={a3} onChange={setA3} placeholder="🥉 อันดับ 3..." />
          <button
            onClick={submit}
            disabled={saving || !a1 || !a2 || !a3}
            className="mt-1 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            {saved ? '✓ บันทึกแล้ว' : saving ? 'กำลังบันทึก...' : q.myPrediction ? 'แก้ไขคำตอบ' : 'ส่งคำตอบ'}
          </button>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default function SpecialPage() {
  const { data: session } = useSession()
  const { data: questions, mutate, isLoading } = useSWR<Question[]>(
    '/api/special-questions',
    fetcher
  )

  const finalPair = questions?.find((q) => q.type === 'FINAL_PAIR')
  const podium = questions?.find((q) => q.type === 'PODIUM')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">⭐ คำถามพิเศษ</h1>
      <p className="text-gray-500 text-sm mb-6">ทายคู่นัดชิงและอันดับสุดท้ายของฟุตบอลโลก 2026</p>

      {!session && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 mb-6 text-sm text-yellow-300">
          กรุณาเข้าสู่ระบบเพื่อส่งคำตอบ
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">กำลังโหลด...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {finalPair && <FinalPairCard q={finalPair} onSaved={() => mutate()} />}
          {podium && <PodiumCard q={podium} onSaved={() => mutate()} />}
        </div>
      )}

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-400 mb-2">เกณฑ์คะแนนคำถามพิเศษ</p>
        <ul className="flex flex-col gap-1">
          <li>⚔️ ทายคู่ชิงถูกทั้งคู่ → <span className="text-white font-semibold">+12</span></li>
          <li>⚔️ ทายคู่ชิงถูก 1 ทีม → <span className="text-white font-semibold">+4</span></li>
          <li>🥇 ทายแชมป์ถูก → <span className="text-white font-semibold">+15</span></li>
          <li>🥈 ทายรองแชมป์ถูก → <span className="text-white font-semibold">+10</span></li>
          <li>🥉 ทายอันดับ 3 ถูก → <span className="text-white font-semibold">+6</span></li>
        </ul>
      </div>
    </div>
  )
}
