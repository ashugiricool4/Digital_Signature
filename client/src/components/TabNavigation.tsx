import { Link, useLocation } from 'wouter';
import { Edit, CheckCircle, Clock, BarChart2, BookOpen, Settings } from 'lucide-react';

const tabs = [
  { name: 'Sign', href: '/sign', icon: <Edit className="mr-2 h-4 w-4" /> },
  { name: 'Verify', href: '/verify', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
  { name: 'History', href: '/history', icon: <Clock className="mr-2 h-4 w-4" /> },
  { name: 'Dashboard', href: '/dashboard', icon: <BarChart2 className="mr-2 h-4 w-4" /> },
  { name: 'Learn', href: '/learn', icon: <BookOpen className="mr-2 h-4 w-4" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="mr-2 h-4 w-4" /> },
];

const TabNavigation = () => {
  const [location] = useLocation();

  return (
    <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
      <nav className="flex -mb-px space-x-8 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = location === tab.href;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap flex items-center ${
                isActive 
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400' 
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;
