import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, ShieldAlert, GitCompare, Activity, BookOpen, FileText, Settings, History, MessageSquare, User, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

interface RouteMeta {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  parent?: string;
}

const ROUTE_MAP: Record<string, RouteMeta> = {
  '/dashboard': { title: 'Dashboard', icon: Home },
  '/red-team': { title: 'Red Team Lab', icon: ShieldAlert },
  '/red-team/compare': { title: 'Test Comparison', icon: GitCompare, parent: '/red-team' },
  '/monitoring': { title: 'Drift Surveillance', icon: Activity },
  '/knowledge': { title: 'Knowledge Base', icon: BookOpen },
  '/reports': { title: 'Compliance Reports', icon: FileText },
  '/activity-log': { title: 'Activity Log & Audit Trail', icon: History },
  '/settings': { title: 'Platform Settings', icon: Settings },
  '/admin/feedback': { title: 'Operator Feedback', icon: MessageSquare, parent: '/settings' },
  '/profile': { title: 'User Profile', icon: User },
  '/notifications': { title: 'Notification Center', icon: Bell }
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  // If at root or login/register, don't show breadcrumbs
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  // Generate breadcrumb items
  const items: Array<{ title: string; href?: string; icon?: React.ComponentType<{ className?: string }> }> = [
    { title: 'Home', href: '/dashboard', icon: Home }
  ];

  if (pathname === '/dashboard') {
    // Only Home / Dashboard
    return null; // On top-level Dashboard, layout header already displays title
  }

  if (ROUTE_MAP[pathname]) {
    const current = ROUTE_MAP[pathname];
    if (current.parent && ROUTE_MAP[current.parent]) {
      const parent = ROUTE_MAP[current.parent];
      items.push({
        title: parent.title,
        href: current.parent,
        icon: parent.icon
      });
    }
    items.push({
      title: current.title,
      icon: current.icon
    });
  } else {
    // Dynamic segments fallback (e.g. /red-team/123)
    const segments = pathname.split('/').filter(Boolean);
    let cumulative = '';
    segments.forEach((seg, idx) => {
      cumulative += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const meta = ROUTE_MAP[cumulative];
      const title = meta ? meta.title : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
      items.push({
        title,
        href: isLast ? undefined : cumulative,
        icon: meta?.icon
      });
    });
  }

  return (
    <nav 
      id="dashboard-breadcrumbs-navigation" 
      aria-label="Breadcrumb"
      className="mb-4 flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1.5 px-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/50 w-fit backdrop-blur-xs"
    >
      <ol className="inline-flex items-center space-x-1.5 sm:space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 mx-1 text-gray-400 dark:text-gray-600 flex-shrink-0" />
              )}

              {isLast ? (
                <span 
                  className="inline-flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white"
                  aria-current="page"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                  <span>{item.title}</span>
                </span>
              ) : (
                <Link
                  to={item.href || '#'}
                  className={cn(
                    "inline-flex items-center gap-1.5 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                    index === 0 ? "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" : ""
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
