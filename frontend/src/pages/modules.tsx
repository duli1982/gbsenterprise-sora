import { useModules, trackEvent, completeModule } from '../api/client'

export default function ModulesPage() {
  const { data, isLoading, error } = useModules()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load modules</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Modules</h1>
      <ul className="space-y-4">
        {data?.map((m) => (
          <li
            key={m.id}
            className="border p-4 rounded cursor-pointer"
            onClick={() => trackEvent('module start', m.id)}
          >
            <h2 className="text-xl font-semibold">{m.title}</h2>
            <p className="text-gray-600">{m.description}</p>
            <button
              className="mt-2 text-sm text-blue-600 underline"
              onClick={(e) => {
                e.stopPropagation()
                completeModule(m.id)
                trackEvent('module complete', m.id)
              }}
            >
              Mark Complete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
