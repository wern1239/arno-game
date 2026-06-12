'use client'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Announcement = {
  id: string
  content: string
  createdAt: string
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(dateStr))
}

export default function ArchivePage() {
  const { data: session } = useSession()
  const { data: announcements, isLoading, mutate } = useSWR<Announcement[]>('/api/announcements/archived', fetcher)
  const isAdmin = session?.user?.role === 'ADMIN'

  async function deleteAnnouncement(id: string) {
    await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">📁 ประกาศเก่า</h1>
      <p className="text-gray-500 text-sm mb-8">ประกาศที่เก็บถาวรแล้ว</p>

      {!announcements?.length ? (
        <div className="text-center py-16 text-gray-600">ยังไม่มีประกาศเก่า</div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
              <div className="flex items-start gap-3">
                <p className="flex-1 text-gray-300 text-sm leading-relaxed">{a.content}</p>
                {isAdmin && (
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs shrink-0"
                  >
                    ลบ
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-xs mt-3">{formatDate(a.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
