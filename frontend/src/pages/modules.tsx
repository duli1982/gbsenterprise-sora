import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Module {
  id: string;
  title: string;
  description: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ModulesPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  const { data, isLoading, error } = useQuery<Module[]>({
    queryKey: ['modules', token],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/content/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch modules');
      }
      return res.json();
    },
    enabled: !!token,
  });

  if (!token) return <div>Login required</div>;
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load modules</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Modules</h1>
      <ul className="space-y-4">
        {data?.map((m) => (
          <li key={m.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{m.title}</h2>
            <p className="text-gray-600">{m.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
