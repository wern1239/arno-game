'use client'
import { useState, useRef, useEffect } from 'react'
import { TEAMS } from '@/lib/flags'
import { FlagImg } from '@/app/components/FlagImg'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function TeamCombobox({ value, onChange, placeholder, required }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? TEAMS.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : TEAMS

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        // if query doesn't match a team, reset to last valid value
        const match = TEAMS.find((t) => t.name.toLowerCase() === query.toLowerCase())
        if (match) {
          onChange(match.name)
          setQuery(match.name)
        } else {
          setQuery(value)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [query, value, onChange])

  function select(name: string) {
    onChange(name)
    setQuery(name)
    setOpen(false)
  }

  const selectedCode = TEAMS.find((t) => t.name === value)?.code ?? ''

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        {selectedCode && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <FlagImg code={selectedCode} />
          </span>
        )}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pr-3 text-white text-sm focus:outline-none focus:border-green-500 ${selectedCode ? 'pl-9' : 'pl-3'}`}
        />
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-52 overflow-y-auto">
          {filtered.map((team) => (
            <li
              key={team.name}
              onMouseDown={() => select(team.name)}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-700 text-sm"
            >
              <FlagImg code={team.code} />
              <span>{team.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
