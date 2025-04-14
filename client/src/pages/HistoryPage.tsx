import { useState, useEffect } from 'react';
import { 
  Search, 
  Sliders, 
  Eye, 
  Copy, 
  Trash, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@/hooks/useWallet';
import NetworkBadge from '@/components/NetworkBadge';
import SignatureVisualization from '@/components/SignatureVisualization';
import { HistoryEntry, MessageType, MESSAGE_TYPES } from '@/lib/constants';
import { formatDateTime, truncateAddress } from '@/lib/utils';

const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<HistoryEntry[]>([]);
  const [detailEntry, setDetailEntry] = useState<HistoryEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const { connected } = useWallet();

  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('signatureHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as HistoryEntry[];
        setHistoryEntries(parsedHistory);
        setFilteredEntries(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      toast({
        variant: "destructive",
        title: "Error loading history",
        description: "There was a problem loading your signature history.",
      });
    }
  }, [toast]);

  // Filter history based on search and type
  useEffect(() => {
    let filtered = [...historyEntries];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.message.toLowerCase().includes(term) || 
        entry.signerAddress.toLowerCase().includes(term) ||
        (entry.signerEns && entry.signerEns.toLowerCase().includes(term))
      );
    }
    
    // Filter by message type
    if (selectedType) {
      filtered = filtered.filter(entry => entry.messageType === selectedType);
    }
    
    setFilteredEntries(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, selectedType, historyEntries]);

  const handleDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      try {
        const updatedHistory = historyEntries.filter(entry => entry.id !== entryToDelete);
        setHistoryEntries(updatedHistory);
        localStorage.setItem('signatureHistory', JSON.stringify(updatedHistory));
        
        toast({
          title: "Entry deleted",
          description: "The signature entry has been deleted from your history.",
        });
      } catch (error) {
        console.error('Failed to delete entry:', error);
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: "There was a problem deleting the entry.",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const handleViewDetails = (entry: HistoryEntry) => {
    setDetailEntry(entry);
    setIsDetailModalOpen(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeClass = (valid: boolean) => {
    return valid
      ? "px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  };

  const getTypeBadgeClass = (type: MessageType) => {
    switch (type) {
      case 'text':
        return "px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 'structured':
        return "px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case 'document':
        return "px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case 'transaction':
        return "px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTypeName = (type: MessageType) => {
    switch (type) {
      case 'text': return 'Text';
      case 'structured': return 'Structured';
      case 'document': return 'Document';
      case 'transaction': return 'Transaction';
      default: return 'Unknown';
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Signature History</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View and manage your previously signed messages and documents.
        </p>
      </div>
      
      {/* Empty state when not connected */}
      {!connected && historyEntries.length === 0 && (
        <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No signature history</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Connect your wallet and sign messages to start building your signature history.
          </p>
        </div>
      )}
      
      {historyEntries.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 space-x-0 sm:space-x-3 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white placeholder-slate-400"
                placeholder="Search signatures..."
              />
            </div>
            
            <div className="flex space-x-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value={MESSAGE_TYPES.TEXT}>Text</SelectItem>
                  <SelectItem value={MESSAGE_TYPES.STRUCTURED}>Structured</SelectItem>
                  <SelectItem value={MESSAGE_TYPES.DOCUMENT}>Document</SelectItem>
                  <SelectItem value={MESSAGE_TYPES.TRANSACTION}>Transaction</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="px-3 py-2">
                <Sliders className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>
          
          {/* History Table */}
          <div className="relative overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3">Message</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Network</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.length > 0 ? (
                  paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="bg-white border-b dark:bg-slate-900 dark:border-slate-700">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {entry.message}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getTypeBadgeClass(entry.messageType)}>
                          {getTypeName(entry.messageType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatDateTime(entry.timestamp).split(',')[0]}</td>
                      <td className="px-6 py-4">
                        <NetworkBadge chainId={entry.chainId} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(entry.valid)}>
                          {entry.valid ? 'Valid' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleViewDetails(entry)}
                            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" 
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleCopy(entry.signature)}
                            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" 
                            aria-label="Copy"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300" 
                            aria-label="Delete"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No matching signature entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-medium mx-1">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium mx-1">{Math.min(currentPage * itemsPerPage, filteredEntries.length)}</span> of <span className="font-medium mx-1">{filteredEntries.length}</span> results
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  // Logic to show current page and neighboring pages
                  let pageNum: number;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage === 1) {
                    pageNum = i + 1;
                  } else if (currentPage === totalPages) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className="px-3 py-1 text-sm"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Signature Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this signature entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Entry Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Signature Details</DialogTitle>
          </DialogHeader>
          
          {detailEntry && (
            <div className="mt-4 space-y-4">
              {/* Message */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm whitespace-pre-wrap">{detailEntry.originalMessage}</p>
                </div>
              </div>
              
              {/* Signature */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Signature</h4>
                <div className="relative">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs overflow-x-auto">
                    {detailEntry.signature}
                  </div>
                  <button 
                    onClick={() => handleCopy(detailEntry.signature)}
                    className="absolute top-2 right-2 p-1 rounded-md bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600"
                  >
                    <Copy className="h-3 w-3 text-slate-500" />
                  </button>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</h4>
                  <span className={getTypeBadgeClass(detailEntry.messageType)}>
                    {getTypeName(detailEntry.messageType)}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</h4>
                  <p className="text-sm">{formatDateTime(detailEntry.timestamp)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</h4>
                  <span className={getStatusBadgeClass(detailEntry.valid)}>
                    {detailEntry.valid ? 'Valid' : 'Expired'}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Network</h4>
                  <NetworkBadge chainId={detailEntry.chainId} />
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Signer</h4>
                  <div className="flex items-center">
                    {detailEntry.signerEns ? (
                      <div>
                        <p className="text-sm font-medium">{detailEntry.signerEns}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{truncateAddress(detailEntry.signerAddress)}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">{truncateAddress(detailEntry.signerAddress)}</p>
                    )}
                    <a 
                      href={`https://etherscan.io/address/${detailEntry.signerAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                {/* Document information if available */}
                {detailEntry.messageType === 'document' && detailEntry.documentHash && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document</h4>
                    <div>
                      <p className="text-sm font-medium">{detailEntry.documentName || "Unnamed Document"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Hash: {truncateAddress(detailEntry.documentHash)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Signature Visualization */}
              <SignatureVisualization signature={detailEntry.signature} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HistoryPage;

// Add missing Clock component used in empty state
const Clock = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
