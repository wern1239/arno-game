'use client'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Sponsor = {
  id: string
  name: string
  prize: string
  createdAt: string
}

const BG_GIFTS = [
  { emoji: '🎁', x: 5,  y: 8,  size: 52, rot: -15, op: 0.07 },
  { emoji: '🎀', x: 88, y: 5,  size: 44, rot: 20,  op: 0.07 },
  { emoji: '🎁', x: 72, y: 22, size: 36, rot: -8,  op: 0.06 },
  { emoji: '🎀', x: 15, y: 35, size: 30, rot: 12,  op: 0.06 },
  { emoji: '🎁', x: 92, y: 45, size: 48, rot: 5,   op: 0.07 },
  { emoji: '🎀', x: 40, y: 60, size: 28, rot: -20, op: 0.05 },
  { emoji: '🎁', x: 3,  y: 68, size: 40, rot: 10,  op: 0.06 },
  { emoji: '🎀', x: 60, y: 78, size: 34, rot: -5,  op: 0.06 },
  { emoji: '🎁', x: 80, y: 88, size: 44, rot: 18,  op: 0.07 },
  { emoji: '🎀', x: 25, y: 90, size: 26, rot: -12, op: 0.05 },
  { emoji: '🎁', x: 50, y: 3,  size: 38, rot: 7,   op: 0.06 },
  { emoji: '🎀', x: 55, y: 48, size: 22, rot: 25,  op: 0.04 },
]

export default function SponsorsPage() {
  const { data: session } = useSession()
  const { data: sponsors, isLoading, mutate } = useSWR<Sponsor[]>('/api/sponsors', fetcher)
  const isAdmin = session?.user?.role === 'ADMIN'

  async function deleteSponsor(id: string) {
    await fetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' })
    mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {/* Gift background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {BG_GIFTS.map((g, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${g.x}%`,
              top: `${g.y}%`,
              fontSize: `${g.size}px`,
              transform: `rotate(${g.rot}deg)`,
              opacity: g.op,
              userSelect: 'none',
              lineHeight: 1,
            }}
          >
            {g.emoji}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🎁</div>
          <h1 className="text-3xl font-bold text-white mb-2">สปอนเซอร์และของรางวัล</h1>
          <p className="text-gray-400 text-sm">ผู้สนับสนุนและของรางวัลสำหรับการแข่งขัน</p>
        </div>

        {!sponsors?.length ? (
          <div className="text-center py-20 text-gray-600">ยังไม่มีสปอนเซอร์</div>
        ) : (
          <div className="flex flex-col gap-4">
            {sponsors.map((s, idx) => (
              <div
                key={s.id}
                className="relative group bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl px-6 py-5 overflow-hidden transition-transform hover:-translate-y-0.5"
              >
                {/* Card shimmer stripe */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none" />

                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-white text-lg leading-tight truncate">{s.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xl">🎁</span>
                      <p className="text-amber-300 text-lg font-semibold leading-snug">{s.prize}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => deleteSponsor(s.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors text-xs shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      ลบ
                    </button>
                  )}
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
