import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from './lib/api';

interface FeedbackStat {
  page_context: string;
  count: number;
}

export default function FeedbackStats() {
  const [data, setData] = useState<FeedbackStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/feedback');
        const counts: Record<string, number> = {};
        const items = Array.isArray(res.data) ? res.data : [];
        items.forEach((item: any) => {
          const page = item.page_context || 'General';
          counts[page] = (counts[page] || 0) + 1;
        });

        const formatted = Object.keys(counts).map(key => ({
          page_context: key,
          count: counts[key]
        }));
        setData(formatted);
      } catch (error) {
        console.error("Failed to load feedback stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="h-48 flex items-center justify-center text-sm text-gray-500">Loading charts...</div>;
  if (data.length === 0) return <div className="h-48 flex items-center justify-center text-sm text-gray-500">No feedback submissions yet.</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="page_context" stroke="#9ca3af" fontSize={12} interval={0} angle={-15} textAnchor="end" />
          <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Submissions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
