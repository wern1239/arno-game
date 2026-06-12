'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Announcement = {
  id: string
  content: string
  createdAt: string
}

type Sponsor = {
  id: string
  name: string
  prize: string
}

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
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [posting, setPosting] = useState(false)
  const [newSponsorName, setNewSponsorName] = useState('')
  const [newSponsorPrize, setNewSponsorPrize] = useState('')
  const [postingSponsor, setPostingSponsor] = useState(false)

  const { data: predictions } = useSWR<Prediction[]>(
    session ? '/api/admin/my-predictions' : null,
    fetcher
  )
  const { data: announcements, mutate: mutateAnnouncements } = useSWR<Announcement[]>(
    session ? '/api/announcements' : null,
    fetcher
  )
  const { data: sponsors, mutate: mutateSponsors } = useSWR<Sponsor[]>(
    session ? '/api/sponsors' : null,
    fetcher
  )

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') router.push('/')
  }, [session, status, router])

  async function postAnnouncement() {
    if (!newAnnouncement.trim()) return
    setPosting(true)
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newAnnouncement }),
    })
    setNewAnnouncement('')
    mutateAnnouncements()
    setPosting(false)
  }

  async function archiveAnnouncement(id: string) {
    await fetch(`/api/admin/announcements/${id}`, { method: 'PATCH' })
    mutateAnnouncements()
  }

  async function deleteAnnouncement(id: string) {
    await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    mutateAnnouncements()
  }

  async function postSponsor() {
    if (!newSponsorName.trim() || !newSponsorPrize.trim()) return
    setPostingSponsor(true)
    await fetch('/api/admin/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSponsorName, prize: newSponsorPrize }),
    })
    setNewSponsorName('')
    setNewSponsorPrize('')
    mutateSponsors()
    setPostingSponsor(false)
  }

  async function deleteSponsor(id: string) {
    await fetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' })
    mutateSponsors()
  }

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

      {/* Announcements */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="font-bold text-gray-300 mb-4">📢 ประกาศ</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && postAnnouncement()}
            placeholder="พิมพ์ข้อความประกาศ..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-600"
          />
          <button
            onClick={postAnnouncement}
            disabled={posting || !newAnnouncement.trim()}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            ประกาศ
          </button>
        </div>
        {!announcements?.length ? (
          <p className="text-gray-600 text-sm">ยังไม่มีประกาศ</p>
        ) : (
          <div className="flex flex-col gap-2">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-start gap-3 bg-gray-800 rounded-lg px-4 py-3">
                <p className="flex-1 text-sm text-yellow-100 leading-relaxed">{a.content}</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => archiveAnnouncement(a.id)}
                    className="text-gray-500 hover:text-blue-400 transition-colors text-xs"
                  >
                    เก็บถาวร
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-xs"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sponsors */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="font-bold text-gray-300 mb-4">🏅 สปอนเซอร์และของรางวัล</h2>
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            value={newSponsorName}
            onChange={(e) => setNewSponsorName(e.target.value)}
            placeholder="ชื่อสปอนเซอร์..."
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newSponsorPrize}
              onChange={(e) => setNewSponsorPrize(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postSponsor()}
              placeholder="ของรางวัล..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
            />
            <button
              onClick={postSponsor}
              disabled={postingSponsor || !newSponsorName.trim() || !newSponsorPrize.trim()}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              เพิ่ม
            </button>
          </div>
        </div>
        {!sponsors?.length ? (
          <p className="text-gray-600 text-sm">ยังไม่มีสปอนเซอร์</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sponsors.map((s) => (
              <div key={s.id} className="flex items-start gap-3 bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <p className="text-xs text-green-300 mt-0.5">🎁 {s.prize}</p>
                </div>
                <button
                  onClick={() => deleteSponsor(s.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-xs shrink-0"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        )}
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
