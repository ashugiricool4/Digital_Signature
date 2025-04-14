import { useState, useEffect } from 'react';
import { Moon, Sun, ChevronDown, Key } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { NETWORKS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const Header = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { connected, chainId, connectWallet } = useWallet();

  // Check for saved theme preference or use system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  const network = chainId && NETWORKS[chainId] ? NETWORKS[chainId] : { name: 'Unknown Network', color: 'bg-gray-500' };

  return (
    <header className="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center justify-center bg-primary-600 text-white w-8 h-8 rounded-lg">
              <Key className="h-4 w-4" />
            </div>
            <span className="ml-2 font-bold text-xl">BlockSign</span>
          </div>
          
          {/* Connection Status + Actions */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {connected && (
              <div className="hidden sm:flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-slate-600 dark:text-slate-300">Connected</span>
              </div>
            )}
            
            {/* Network Selection */}
            {connected && chainId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg border">
                    <span className={`h-2 w-2 rounded-full ${network.color}`}></span>
                    <span className="text-sm">{network.name}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(NETWORKS).map(([id, network]) => (
                    <DropdownMenuItem key={id} className="cursor-pointer">
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full ${network.color} mr-2`}></span>
                        <span>{network.name}</span>
                        {network.isTestnet && <span className="ml-1 text-xs text-gray-500">(Testnet)</span>}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Dark Mode Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Sun className="h-5 w-5 dark:hidden text-slate-700" />
              <Moon className="h-5 w-5 hidden dark:inline text-slate-300" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
