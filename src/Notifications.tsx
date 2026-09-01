import { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from './lib/api';

interface Notification {
    id: number;
    message: string;
    timestamp: string;
    is_read: boolean;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading alerts...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white">Alerts & Notifications</h2>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-full">
                    {notifications.filter(n => !n.is_read).length} Unread
                </span>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        No notifications found.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((n) => (
                            <li key={n.id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${n.is_read ? 'bg-white dark:bg-gray-800' : 'bg-indigo-50/40 dark:bg-indigo-950/20'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-full mt-0.5 ${n.is_read ? 'bg-gray-100 text-gray-500 dark:bg-gray-700' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900'}`}>
                                        <Bell className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className={`text-sm ${n.is_read ? 'text-gray-600 dark:text-gray-300' : 'font-semibold text-gray-900 dark:text-white'}`}>{n.message}</p>
                                        <span className="text-xs text-gray-400 mt-1 block">{new Date(n.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                {!n.is_read && (
                                    <button 
                                        onClick={() => markAsRead(n.id)}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold p-1"
                                        title="Mark as read"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
