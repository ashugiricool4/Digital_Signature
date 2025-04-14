import { useState, useEffect } from 'react';
import { 
  Save, 
  Trash, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Moon, 
  Sun, 
  Laptop 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  autoConnect: boolean;
  preferredNetwork: string;
  showTestnets: boolean;
  defaultMessageType: string;
  signatureExpiration: number;
  displayEns: boolean;
  backupFrequency: string;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const { connected, disconnectWallet } = useWallet();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState<boolean>(false);
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'system',
    autoConnect: true,
    preferredNetwork: '1', // Ethereum Mainnet
    showTestnets: false,
    defaultMessageType: 'text',
    signatureExpiration: 30, // days
    displayEns: true,
    backupFrequency: 'manual',
  });

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('blockSignSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      // Also check for theme setting
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setSettings(prev => ({ ...prev, theme: savedTheme as 'light' | 'dark' | 'system' }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Apply theme changes in real-time
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('blockSignSettings', JSON.stringify(settings));
      localStorage.setItem('theme', settings.theme);
      
      // Show success message
      setSavedSuccessfully(true);
      setTimeout(() => setSavedSuccessfully(false), 3000);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been successfully saved.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "There was a problem saving your settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackupData = () => {
    setIsBackingUp(true);
    
    try {
      // Gather all data to back up
      const history = localStorage.getItem('signatureHistory') || '[]';
      const settings = localStorage.getItem('blockSignSettings') || '{}';
      
      const backupData = {
        history: JSON.parse(history),
        settings: JSON.parse(settings),
        version: 1, // for future compatibility
        timestamp: Date.now(),
      };
      
      // Convert to JSON and create downloadable file
      const backupJson = JSON.stringify(backupData, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger it
      const a = document.createElement('a');
      a.href = url;
      a.download = `blocksign-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup created",
        description: "Your data has been successfully backed up.",
      });
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast({
        variant: "destructive",
        title: "Backup failed",
        description: "There was a problem creating your backup.",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsRestoring(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const backupData = JSON.parse(result);
        
        // Validate backup format
        if (!backupData.history || !backupData.settings) {
          throw new Error('Invalid backup file format');
        }
        
        // Restore data
        localStorage.setItem('signatureHistory', JSON.stringify(backupData.history));
        localStorage.setItem('blockSignSettings', JSON.stringify(backupData.settings));
        
        // Update current settings
        setSettings(backupData.settings);
        
        toast({
          title: "Restore successful",
          description: "Your data has been successfully restored.",
        });
      } catch (error) {
        console.error('Failed to restore backup:', error);
        toast({
          variant: "destructive",
          title: "Restore failed",
          description: "There was a problem restoring your backup.",
        });
      } finally {
        setIsRestoring(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Restore failed",
        description: "There was a problem reading your backup file.",
      });
      setIsRestoring(false);
    };
    
    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    try {
      // Delete all localStorage data
      localStorage.removeItem('signatureHistory');
      localStorage.removeItem('blockSignSettings');
      
      // Disconnect wallet
      disconnectWallet();
      
      // Reset settings to defaults (but keep theme)
      const currentTheme = settings.theme;
      setSettings({
        theme: currentTheme,
        autoConnect: true,
        preferredNetwork: '1',
        showTestnets: false,
        defaultMessageType: 'text',
        signatureExpiration: 30,
        displayEns: true,
        backupFrequency: 'manual',
      });
      
      toast({
        title: "Data deleted",
        description: "All your data has been successfully deleted.",
      });
    } catch (error) {
      console.error('Failed to delete data:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was a problem deleting your data.",
      });
    }
    
    setIsDeleteDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize your experience and manage your data.
        </p>
      </div>

      {/* Settings saved notification */}
      <AnimatePresence>
        {savedSuccessfully && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg flex items-center"
          >
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-sm text-green-800 dark:text-green-200">
              Settings have been saved successfully.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appearance Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how BlockSign looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="theme">Theme</Label>
              <div className="flex flex-col space-y-1.5">
                <RadioGroup
                  value={settings.theme}
                  onValueChange={(value) => setSettings({ ...settings, theme: value as 'light' | 'dark' | 'system' })}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light" className="flex items-center cursor-pointer">
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark" className="flex items-center cursor-pointer">
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system" className="flex items-center cursor-pointer">
                      <Laptop className="h-4 w-4 mr-2" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="displayEns" className="block mb-1">Display ENS Names</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Show ENS names instead of addresses when available
                </p>
              </div>
              <Switch
                id="displayEns"
                checked={settings.displayEns}
                onCheckedChange={(checked) => setSettings({ ...settings, displayEns: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Wallet Section */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Manage wallet connection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="autoConnect" className="block mb-1">Auto-connect</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Automatically connect to your last used wallet
                </p>
              </div>
              <Switch
                id="autoConnect"
                checked={settings.autoConnect}
                onCheckedChange={(checked) => setSettings({ ...settings, autoConnect: checked })}
              />
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="preferredNetwork" className="block mb-1">Preferred Network</Label>
              <Select
                value={settings.preferredNetwork}
                onValueChange={(value) => setSettings({ ...settings, preferredNetwork: value })}
              >
                <SelectTrigger id="preferredNetwork">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ethereum Mainnet</SelectItem>
                  <SelectItem value="137">Polygon</SelectItem>
                  <SelectItem value="42161">Arbitrum</SelectItem>
                  <SelectItem value="10">Optimism</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="showTestnets" className="block mb-1">Show Testnets</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Display testnet networks in the network selector
                </p>
              </div>
              <Switch
                id="showTestnets"
                checked={settings.showTestnets}
                onCheckedChange={(checked) => setSettings({ ...settings, showTestnets: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Signatures Section */}
        <Card>
          <CardHeader>
            <CardTitle>Signatures</CardTitle>
            <CardDescription>Configure signature preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="defaultMessageType" className="block mb-1">Default Message Type</Label>
              <Select
                value={settings.defaultMessageType}
                onValueChange={(value) => setSettings({ ...settings, defaultMessageType: value })}
              >
                <SelectTrigger id="defaultMessageType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Message</SelectItem>
                  <SelectItem value="structured">Structured Data</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label htmlFor="signatureExpiration" className="block">Signature Expiration</Label>
                <span className="text-sm font-medium">
                  {settings.signatureExpiration} days
                </span>
              </div>
              <Slider
                id="signatureExpiration"
                min={0}
                max={365}
                step={1}
                value={[settings.signatureExpiration]}
                onValueChange={(value) => setSettings({ ...settings, signatureExpiration: value[0] })}
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {settings.signatureExpiration === 0 
                  ? "Signatures never expire" 
                  : `Signatures will be marked as expired after ${settings.signatureExpiration} days`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Data Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Backup & Data</CardTitle>
            <CardDescription>Manage your signature history and settings data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="backupFrequency" className="block mb-1">Backup Reminder</Label>
              <Select
                value={settings.backupFrequency}
                onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
              >
                <SelectTrigger id="backupFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual only</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Every 3 months</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                How often you'd like to be reminded to back up your data
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleBackupData}
                disabled={isBackingUp}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                {isBackingUp ? 'Creating Backup...' : 'Backup Data'}
              </Button>
              
              <div className="relative flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isRestoring}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isRestoring ? 'Restoring...' : 'Restore Data'}
                </Button>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleRestoreData}
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex-1 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 dark:border-red-800 dark:hover:border-red-700 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-950/50"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </div>
            
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400">Local Storage Only</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                    BlockSign stores all your signature data locally on your device. 
                    We don't collect any data on our servers. Make sure to back up regularly to prevent data loss.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></span>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600 dark:text-red-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Delete All Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your signature history and settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAllData}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Yes, Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Add missing AnimatePresence component if not already imported
const AnimatePresence = motion.AnimatePresence;

export default SettingsPage;
