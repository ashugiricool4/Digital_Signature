import { useState, useEffect } from 'react';
import { BarChart2, FileText, Repeat, Code, Calendar, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HistoryEntry, MessageType, MESSAGE_TYPES } from '@/lib/constants';
import { truncateAddress } from '@/lib/utils';

// Import Recharts components for the charts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

const DashboardPage = () => {
  const { connected, address, ensName } = useWallet();
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [timeframe, setTimeframe] = useState<string>('week');
  const [typeData, setTypeData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [validityData, setValidityData] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<any[]>([]);

  // Colors for charts
  const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('signatureHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as HistoryEntry[];
        setHistoryEntries(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Prepare chart data based on history entries
  useEffect(() => {
    if (historyEntries.length > 0) {
      prepareChartData();
    }
  }, [historyEntries, timeframe]);

  const prepareChartData = () => {
    // Filter entries based on timeframe
    const now = Date.now();
    const filteredEntries = historyEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp).getTime();
      if (timeframe === 'week') {
        return now - entryDate <= 7 * 24 * 60 * 60 * 1000;
      } else if (timeframe === 'month') {
        return now - entryDate <= 30 * 24 * 60 * 60 * 1000;
      } else if (timeframe === 'year') {
        return now - entryDate <= 365 * 24 * 60 * 60 * 1000;
      }
      return true; // 'all'
    });

    // Process by message type
    const typeCount: Record<string, number> = {
      text: 0,
      structured: 0,
      document: 0,
      transaction: 0,
    };

    filteredEntries.forEach(entry => {
      typeCount[entry.messageType] = (typeCount[entry.messageType] || 0) + 1;
    });

    const typeChartData = Object.entries(typeCount).map(([type, count]) => ({
      name: formatMessageType(type as MessageType),
      value: count,
    }));
    setTypeData(typeChartData);

    // Process by validity
    const validCount = filteredEntries.filter(entry => entry.valid).length;
    const invalidCount = filteredEntries.length - validCount;

    setValidityData([
      { name: 'Valid', value: validCount },
      { name: 'Invalid/Expired', value: invalidCount },
    ]);

    // Process by network
    const networkCount: Record<number, number> = {};
    filteredEntries.forEach(entry => {
      networkCount[entry.chainId] = (networkCount[entry.chainId] || 0) + 1;
    });

    const networkChartData = Object.entries(networkCount).map(([chainId, count]) => ({
      name: getNetworkName(parseInt(chainId)),
      value: count,
    }));
    setNetworkData(networkChartData);

    // Process activity over time
    const activityData = prepareActivityData(filteredEntries, timeframe);
    setActivityData(activityData);
  };

  const prepareActivityData = (entries: HistoryEntry[], timeframe: string) => {
    // Group entries by date periods based on timeframe
    const dateGroups: Record<string, number> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      let key: string;
      
      if (timeframe === 'week') {
        // Group by day of week
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        key = dayNames[date.getDay()];
      } else if (timeframe === 'month') {
        // Group by day of month
        const day = date.getDate();
        // Create 5 groups of days for better visualization
        if (day <= 6) key = '1-6';
        else if (day <= 12) key = '7-12';
        else if (day <= 18) key = '13-18';
        else if (day <= 24) key = '19-24';
        else key = '25-31';
      } else if (timeframe === 'year') {
        // Group by month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        key = monthNames[date.getMonth()];
      } else {
        // Group by year for 'all'
        key = date.getFullYear().toString();
      }
      
      dateGroups[key] = (dateGroups[key] || 0) + 1;
    });
    
    // Convert to array for chart
    let result = Object.entries(dateGroups).map(([date, count]) => ({
      date,
      count,
    }));
    
    // Sort data chronologically
    if (timeframe === 'week') {
      const dayOrder = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
      result.sort((a, b) => dayOrder[a.date as keyof typeof dayOrder] - dayOrder[b.date as keyof typeof dayOrder]);
    } else if (timeframe === 'month') {
      const dayGroupOrder = { '1-6': 0, '7-12': 1, '13-18': 2, '19-24': 3, '25-31': 4 };
      result.sort((a, b) => dayGroupOrder[a.date as keyof typeof dayGroupOrder] - dayGroupOrder[b.date as keyof typeof dayGroupOrder]);
    } else if (timeframe === 'year') {
      const monthOrder = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
      result.sort((a, b) => monthOrder[a.date as keyof typeof monthOrder] - monthOrder[b.date as keyof typeof monthOrder]);
    } else {
      // Sort years numerically
      result.sort((a, b) => parseInt(a.date) - parseInt(b.date));
    }
    
    return result;
  };

  const formatMessageType = (type: MessageType): string => {
    switch (type) {
      case 'text': return 'Text';
      case 'structured': return 'Structured';
      case 'document': return 'Document';
      case 'transaction': return 'Transaction';
      default: return 'Unknown';
    }
  };

  const getNetworkName = (chainId: number): string => {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai',
      42161: 'Arbitrum',
      10: 'Optimism',
      56: 'BSC',
      43114: 'Avalanche',
      250: 'Fantom',
    };
    
    return networks[chainId] || `Chain ID ${chainId}`;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-md">
          <p className="text-sm font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // If not connected, show a message prompting to connect
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg max-w-lg text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-400 mb-2">Wallet Not Connected</h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            Connect your wallet to view your signature analytics and statistics.
          </p>
          <Button>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  // If no history entries, show empty state
  if (historyEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg max-w-lg text-center">
          <BarChart2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Signature Data</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Sign some messages to start building your dashboard analytics.
          </p>
          <Button onClick={() => window.location.href = '/sign'}>Go to Sign Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Signature Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View statistics and trends of your blockchain signatures.
        </p>
      </div>

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">{ensName || truncateAddress(address || '')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {historyEntries.length} total signatures
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Signatures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historyEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Text Messages</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historyEntries.filter(entry => entry.messageType === 'text').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(historyEntries.filter(entry => entry.messageType === 'text').length / historyEntries.length * 100)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historyEntries.filter(entry => entry.messageType === 'document').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(historyEntries.filter(entry => entry.messageType === 'document').length / historyEntries.length * 100)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valid Signatures</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historyEntries.filter(entry => entry.valid).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(historyEntries.filter(entry => entry.valid).length / historyEntries.length * 100)}% success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="activity" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="activity" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Types
          </TabsTrigger>
          <TabsTrigger value="networks" className="flex items-center">
            <Repeat className="h-4 w-4 mr-2" />
            Networks
          </TabsTrigger>
          <TabsTrigger value="validity" className="flex items-center">
            <Code className="h-4 w-4 mr-2" />
            Validity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Signature Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Signatures" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Signature Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networks">
          <Card>
            <CardHeader>
              <CardTitle>Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={networkData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Signatures" fill="hsl(var(--chart-3))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validity">
          <Card>
            <CardHeader>
              <CardTitle>Signature Validity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={validityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="hsl(var(--chart-2))" />
                      <Cell fill="hsl(var(--chart-5))" />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left font-medium p-2">Date</th>
                  <th className="text-left font-medium p-2">Message</th>
                  <th className="text-left font-medium p-2">Type</th>
                  <th className="text-left font-medium p-2">Network</th>
                  <th className="text-left font-medium p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {historyEntries.slice(0, 5).map((entry, index) => (
                  <tr key={index} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-2 font-medium max-w-[200px] truncate">{entry.message}</td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      <span className={`
                        inline-flex items-center rounded-full px-2 py-1 text-xs
                        ${entry.messageType === 'text' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${entry.messageType === 'document' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                        ${entry.messageType === 'structured' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                        ${entry.messageType === 'transaction' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                      `}>
                        {formatMessageType(entry.messageType)}
                      </span>
                    </td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      {getNetworkName(entry.chainId)}
                    </td>
                    <td className="p-2">
                      <span className={`
                        inline-flex items-center rounded-full px-2 py-1 text-xs
                        ${entry.valid 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}
                      `}>
                        {entry.valid ? 'Valid' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {historyEntries.length > 5 && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/history'}
              >
                View All Signatures
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
