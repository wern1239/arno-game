'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const linkClass = (href: string) =>
    `block px-3 py-2 rounded-lg transition-colors text-sm ${
      pathname === href ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-700'
    }`

  return (
    <nav className="bg-green-900 border-b border-green-700 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="font-bold text-white flex items-center gap-2 shrink-0">
          <span className="text-xl">⚽</span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm sm:text-base font-bold">Arno Game</span>
            <span className="text-xs text-green-400 font-normal">World Cup 2026 Edition</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex gap-2 items-center text-sm">
          <Link href="/" className={linkClass('/')}>แมตช์</Link>
          <Link href="/leaderboard" className={linkClass('/leaderboard')}>อันดับ</Link>
          <Link href="/special" className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${pathname === '/special' ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:from-purple-500 hover:to-indigo-400'}`}>
            ⭐ พิเศษ
          </Link>
          <Link href="/sponsors" className={`relative px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${pathname === '/sponsors' ? 'bg-amber-500 text-white' : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 hover:from-amber-400 hover:to-yellow-300'}`}>
            🏅 สปอนเซอร์
          </Link>
          <Link href="/join" className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${pathname === '/join' ? 'bg-green-400 text-green-950' : 'bg-gradient-to-r from-[#06C755] to-green-400 text-white hover:from-green-500 hover:to-green-300'}`}>
            💬 OpenChat
          </Link>
          <Link href="/archive" className={linkClass('/archive')}>ประกาศเก่า</Link>
          {session ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded font-bold text-xs hover:bg-yellow-300 transition-colors">
                  ADMIN
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-1.5 text-green-300 hover:text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm group">
                <span>👤</span>
                <span className="group-hover:underline">{session.user.name}</span>
                <span className="text-green-500 group-hover:text-green-300 text-xs">🔑</span>
              </Link>
              <button onClick={() => signOut()} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded transition-colors text-sm">
                ออก
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass('/login')}>เข้าสู่ระบบ</Link>
              <Link href="/register" className="bg-white text-green-900 px-3 py-1 rounded font-bold text-sm hover:bg-green-100 transition-colors">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className="sm:hidden flex items-center gap-2">
          {session && (
            <span className="text-green-300 text-xs truncate max-w-[80px]">👤 {session.user.name}</span>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="text-white p-1.5 rounded-lg hover:bg-green-700 transition-colors"
            aria-label="menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-green-700 px-4 py-3 flex flex-col gap-1">
          <Link href="/" onClick={() => setOpen(false)} className={linkClass('/')}>แมตช์</Link>
          <Link href="/leaderboard" onClick={() => setOpen(false)} className={linkClass('/leaderboard')}>อันดับ</Link>
          <Link href="/special" onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-bold transition-colors ${pathname === '/special' ? 'bg-purple-600 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white'}`}>
            ⭐ พิเศษ
          </Link>
          <Link href="/sponsors" onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-bold transition-colors ${pathname === '/sponsors' ? 'bg-amber-500 text-white' : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950'}`}>
            🏅 สปอนเซอร์
          </Link>
          <Link href="/join" onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-bold transition-colors ${pathname === '/join' ? 'bg-green-400 text-green-950' : 'bg-gradient-to-r from-[#06C755] to-green-400 text-white'}`}>
            💬 OpenChat
          </Link>
          <Link href="/archive" onClick={() => setOpen(false)} className={linkClass('/archive')}>ประกาศเก่า</Link>
          {session ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-bold text-sm">
                  ⚙️ Admin Panel
                </Link>
              )}
              <Link href="/profile" onClick={() => setOpen(false)} className={linkClass('/profile')}>
                👤 แก้ไขโปรไฟล์
              </Link>
              <button
                onClick={() => { signOut(); setOpen(false) }}
                className="text-left px-3 py-2 text-red-400 hover:bg-green-700 rounded-lg text-sm"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className={linkClass('/login')}>เข้าสู่ระบบ</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block px-3 py-2 bg-white text-green-900 rounded-lg font-bold text-sm text-center">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
