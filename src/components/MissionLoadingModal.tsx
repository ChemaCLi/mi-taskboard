import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Target, 
  CheckSquare, 
  Bell, 
  Calendar, 
  FileText,
  RefreshCw,
  Shield,
  Settings
} from 'lucide-react';
import { useMissionData } from './MissionDataContext';

interface MissionLoadingModalProps {
  open: boolean;
  onClose: () => void;
}

export function MissionLoadingModal({ open, onClose }: MissionLoadingModalProps) {
  const missionData = useMissionData();
  const { globalLoading, retryFailedLoads } = missionData;

  // Entity configurations with icons and labels
  const entityConfigs = [
    {
      key: 'tasks',
      label: 'Combat Objectives',
      icon: CheckSquare,
      manager: missionData.tasks,
      color: 'text-green-400'
    },
    {
      key: 'objectives',
      label: 'Mission Targets',
      icon: Target,
      manager: missionData.objectives,
      color: 'text-cyan-400'
    },
    {
      key: 'reminders',
      label: 'Alert Protocols',
      icon: Bell,
      manager: missionData.reminders,
      color: 'text-yellow-400'
    },
    {
      key: 'meetings',
      label: 'Strategic Briefings',
      icon: Calendar,
      manager: missionData.meetings,
      color: 'text-purple-400'
    },
    {
      key: 'notes',
      label: 'Intelligence Files',
      icon: FileText,
      manager: missionData.notes,
      color: 'text-blue-400'
    },
    {
      key: 'settings',
      label: 'System Configuration',
      icon: Settings,
      manager: missionData.settings,
      color: 'text-orange-400'
    }
  ];

  const getStatusIcon = (manager: any) => {
    if (manager.error) {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
    if (manager.isInitialized) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (manager.isLoading) {
      return <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
  };

  const getStatusText = (manager: any) => {
    if (manager.error) {
      return `Error: ${manager.error}`;
    }
    if (manager.isInitialized) {
      return `Loaded ${manager.data.length} items`;
    }
    if (manager.isLoading) {
      return 'Initializing...';
    }
    return 'Pending';
  };

  const getStatusBadge = (manager: any) => {
    if (manager.error) {
      return <Badge variant="destructive" className="text-xs">ERROR</Badge>;
    }
    if (manager.isInitialized) {
      return <Badge variant="outline" className="text-xs text-green-400 border-green-400">COMPLETE</Badge>;
    }
    if (manager.isLoading) {
      return <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400">LOADING</Badge>;
    }
    return <Badge variant="outline" className="text-xs text-slate-400 border-slate-400">PENDING</Badge>;
  };

  const getOverallStatus = () => {
    if (globalLoading.errors.length > 0 && globalLoading.allLoaded) {
      return {
        type: 'warning' as const,
        icon: AlertTriangle,
        title: 'Neural Link Partially Established',
        message: 'Some systems encountered errors. Mission can proceed with reduced functionality.',
        color: 'text-yellow-400'
      };
    }
    
    if (globalLoading.errors.length > 0) {
      return {
        type: 'error' as const,
        icon: XCircle,
        title: 'Neural Link Errors Detected',
        message: 'Critical systems failed to initialize. Recommend immediate attention.',
        color: 'text-red-400'
      };
    }
    
    if (globalLoading.allLoaded) {
      return {
        type: 'success' as const,
        icon: Shield,
        title: 'Neural Link Established',
        message: 'All systems operational. Mission Control ready for deployment.',
        color: 'text-green-400'
      };
    }
    
    return {
      type: 'loading' as const,
      icon: Loader2,
      title: 'Establishing Neural Link',
      message: 'Synchronizing with Mission Control matrix...',
      color: 'text-cyan-400'
    };
  };

  const overallStatus = getOverallStatus();
  const canClose = globalLoading.allLoaded || !globalLoading.isHydrating;

  return (
    <Dialog open={open} onOpenChange={() => canClose && onClose()}>
      <DialogContent className="max-w-md bg-gray-900/95 border border-cyan-400/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="relative">
              <overallStatus.icon 
                className={`w-6 h-6 ${overallStatus.color} ${overallStatus.type === 'loading' ? 'animate-spin' : ''}`} 
              />
              {overallStatus.type === 'success' && (
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className={`bg-gradient-to-r ${
              overallStatus.type === 'success' ? 'from-green-400 to-cyan-400' :
              overallStatus.type === 'warning' ? 'from-yellow-400 to-orange-400' :
              overallStatus.type === 'error' ? 'from-red-400 to-pink-400' :
              'from-cyan-400 to-purple-400'
            } bg-clip-text text-transparent`}>
              {overallStatus.title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Overall status message */}
          <p className="text-sm text-slate-300 text-center">
            {overallStatus.message}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  overallStatus.type === 'error' ? 'bg-red-400' :
                  overallStatus.type === 'warning' ? 'bg-yellow-400' :
                  'bg-cyan-400'
                }`}
                style={{ 
                  width: `${(globalLoading.completedCount / globalLoading.totalCount) * 100}%` 
                }}
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {globalLoading.completedCount}/{globalLoading.totalCount}
            </span>
          </div>

          {/* Entity loading states */}
          <div className="space-y-2">
            {entityConfigs.map(({ key, label, icon: Icon, manager, color }) => (
              <Card key={key} className="p-3 bg-slate-800/50 border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(manager)}
                    {getStatusIcon(manager)}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-7">
                  {getStatusText(manager)}
                </p>
              </Card>
            ))}
          </div>

          {/* Error recovery */}
          {globalLoading.errors.length > 0 && (
            <Card className="p-3 bg-red-900/20 border-red-400/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">System Anomalies Detected</p>
                  <p className="text-xs text-red-300 mt-1">
                    {globalLoading.errors.length} error(s) occurred during initialization
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryFailedLoads}
                    className="mt-2 text-xs border-red-400/50 text-red-400 hover:bg-red-400/10"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry Failed Systems
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Action button */}
          {canClose && (
            <div className="flex justify-center pt-2">
              <Button 
                onClick={onClose}
                className={`px-6 ${
                  overallStatus.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : overallStatus.type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                } text-white`}
              >
                {overallStatus.type === 'success' ? 'Enter Mission Control' : 'Continue with Warnings'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 