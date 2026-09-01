import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import api from './lib/api';
import { cn } from './lib/utils';

export default function TestComparison() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const test1Id = searchParams.get('test1');
  const test2Id = searchParams.get('test2');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!test1Id || !test2Id) {
            throw new Error("Missing test IDs for comparison");
        }
        const res = await api.get(`/redteam/test/compare?test1_id=${test1Id}&test2_id=${test2Id}`);
        setData(res.data.comparison || res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [test1Id, test2Id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <p className="text-red-600 mb-4">{error || "Comparison data unavailable"}</p>
        <button 
          onClick={() => navigate('/red-team')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Red Team Lab
        </button>
      </div>
    );
  }

  const { test1, test2 } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/red-team')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Adversarial Test Comparison</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Side-by-side analysis of test results and vulnerability discoveries.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-700">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase">Test A</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{test1?.test_name}</h3>
            </div>
            <span className={cn(
              "px-2 py-1 text-xs font-semibold rounded",
              test1?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            )}>
              {test1?.status}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="font-medium text-gray-900 dark:text-white">{test1?.test_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Target System:</span>
              <span className="font-medium text-gray-900 dark:text-white">{test1?.target_system}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Vulnerabilities Found:</span>
              <span className="font-bold text-red-600">{test1?.results?.vulnerabilities_found?.length || 0}</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-3">Discovered Issues</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {test1?.results?.vulnerabilities_found?.map((v: any, i: number) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">{v.type}</span>
                    <span className="text-red-600">{v.severity}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{v.description}</p>
                </div>
              ))}
              {(!test1?.results?.vulnerabilities_found || test1.results.vulnerabilities_found.length === 0) && (
                <p className="text-xs text-gray-400">No vulnerabilities detected.</p>
              )}
            </div>
          </div>
        </div>

        {/* Test 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-700">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase">Test B</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{test2?.test_name}</h3>
            </div>
            <span className={cn(
              "px-2 py-1 text-xs font-semibold rounded",
              test2?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            )}>
              {test2?.status}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="font-medium text-gray-900 dark:text-white">{test2?.test_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Target System:</span>
              <span className="font-medium text-gray-900 dark:text-white">{test2?.target_system}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Vulnerabilities Found:</span>
              <span className="font-bold text-red-600">{test2?.results?.vulnerabilities_found?.length || 0}</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-3">Discovered Issues</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {test2?.results?.vulnerabilities_found?.map((v: any, i: number) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">{v.type}</span>
                    <span className="text-red-600">{v.severity}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{v.description}</p>
                </div>
              ))}
              {(!test2?.results?.vulnerabilities_found || test2.results.vulnerabilities_found.length === 0) && (
                <p className="text-xs text-gray-400">No vulnerabilities detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
