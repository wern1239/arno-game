'use client'
import { useState, useRef, useEffect } from 'react'
import { PLAYERS } from '@/lib/players'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  exclude?: string[]
}

const ACCENT: Record<string, string> = {
  'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','ā':'a',
  'è':'e','é':'e','ê':'e','ë':'e','ē':'e',
  'ì':'i','í':'i','î':'i','ï':'i','ī':'i',
  'ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ō':'o',
  'ù':'u','ú':'u','û':'u','ü':'u','ū':'u',
  'ñ':'n','ç':'c','ý':'y','ÿ':'y',
  'ś':'s','š':'s','ž':'z','ź':'z','ż':'z',
  'ř':'r','ğ':'g','ę':'e','ă':'a','ș':'s','ț':'t',
}
const normalize = (s: string) =>
  s.toLowerCase().split('').map(c => ACCENT[c] ?? c).join('')

export function PlayerCombobox({ value, onChange, placeholder = 'พิมพ์ชื่อนักเตะ...', exclude = [] }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const justSelected = useRef(false)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.length < 2
    ? []
    : PLAYERS.filter(
        (p) => !exclude.includes(p) && normalize(p).includes(normalize(query))
      ).slice(0, 15)

  function select(name: string) {
    justSelected.current = true
    onChange(name)
    setQuery(name)
    setOpen(false)
  }

  function handleBlur() {
    setTimeout(() => {
      if (justSelected.current) {
        justSelected.current = false
        return
      }
      // revert to last valid value if user typed something not in the list
      if (!PLAYERS.includes(query)) {
        setQuery(value)
      }
      setOpen(false)
    }, 150)
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onBlur={handleBlur}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 transition-colors"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((name) => (
            <li
              key={name}
              onMouseDown={() => select(name)}
              className="px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
