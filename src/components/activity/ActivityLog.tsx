import React from 'react';
import { Clock, User, Edit, Plus, Trash2, CheckCircle, AlertCircle, FolderPlus, Folder, FolderX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserContext } from '@/context/UserContext';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_completed' | 'user_assigned' | 'status_changed' | 'priority_changed' | 'group_created' | 'group_updated' | 'group_deleted';
  user_id: string;
  task_id?: string;
  task_title?: string;
  group_id?: string;
  group_title?: string;
  board_id?: string;
  board_title?: string;
  details?: Record<string, any>;
  timestamp: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
  className?: string;
}

const ActivityLog = ({ activities, className }: ActivityLogProps) => {
  const { getUserDisplayName, getUserInitials } = useUserContext();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'task_updated':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'task_deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'user_assigned':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'status_changed':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'priority_changed':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'group_created':
        return <FolderPlus className="w-4 h-4 text-green-600" />;
      case 'group_updated':
        return <Folder className="w-4 h-4 text-blue-600" />;
      case 'group_deleted':
        return <FolderX className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    const userName = getUserDisplayName(activity.user_id);
    
    switch (activity.type) {
      case 'task_created':
        return `${userName} created task "${activity.task_title}"`;
      case 'task_updated':
        return `${userName} updated task "${activity.task_title}"`;
      case 'task_deleted':
        return `${userName} deleted task "${activity.task_title}"`;
      case 'task_completed':
        return `${userName} completed task "${activity.task_title}"`;
      case 'user_assigned':
        return `${userName} was assigned to "${activity.task_title}"`;
      case 'status_changed':
        return `${userName} changed status of "${activity.task_title}" to ${activity.details?.new_status}`;
      case 'priority_changed':
        return `${userName} changed priority of "${activity.task_title}" to ${activity.details?.new_priority}`;
      case 'group_created':
        return `${userName} created group "${activity.group_title}"`;
      case 'group_updated':
        return `${userName} updated group "${activity.group_title}"`;
      case 'group_deleted':
        return `${userName} deleted group "${activity.group_title}"`;
      default:
        return `${userName} performed an action`;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_created':
        return 'bg-green-50 border-green-200';
      case 'task_updated':
        return 'bg-blue-50 border-blue-200';
      case 'task_deleted':
        return 'bg-red-50 border-red-200';
      case 'task_completed':
        return 'bg-green-50 border-green-200';
      case 'user_assigned':
        return 'bg-purple-50 border-purple-200';
      case 'status_changed':
        return 'bg-orange-50 border-orange-200';
      case 'priority_changed':
        return 'bg-yellow-50 border-yellow-200';
      case 'group_created':
        return 'bg-green-50 border-green-200';
      case 'group_updated':
        return 'bg-blue-50 border-blue-200';
      case 'group_deleted':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (activities.length === 0) {
    return (
      <Card className={cn("w-80", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-80 max-h-96 overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          <div className="space-y-1 p-4 pt-0">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50",
                  getActivityColor(activity.type)
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0",
                        getAvatarColor(getUserDisplayName(activity.user_id))
                      )}>
                        {getUserInitials(activity.user_id)}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {getActivityMessage(activity)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {formatTimeAgo(activity.timestamp)}
                    </Badge>
                    {activity.board_title && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.board_title}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog; 