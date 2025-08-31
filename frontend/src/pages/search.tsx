import { useState, useEffect } from 'react'
import { searchModules, fetchSuggestions, Module } from '../api/client'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [results, setResults] = useState<Module[]>([])

  useEffect(() => {
    if (!query) {
      setSuggestions([])
      return
    }
    const id = setTimeout(() => {
      fetchSuggestions(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
    }, 300)
    return () => clearTimeout(id)
  }, [query])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = await searchModules(query)
    setResults(data)
  }

  return (
    <main className="p-4">
      <form onSubmit={onSubmit}>
        <input
          className="border p-2 w-full"
          placeholder="Search modules"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </form>
      {suggestions.length > 0 && (
        <ul className="border mt-2">
          {suggestions.map(s => (
            <li
              key={s}
              className="p-2 cursor-pointer"
              onClick={() => setQuery(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        {results.map(r => (
          <div key={r.id} className="mb-2">
            <h2 className="font-bold">{r.title}</h2>
            <p>{r.description}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
