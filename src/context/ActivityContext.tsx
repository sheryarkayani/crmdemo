import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface ActivityItem {
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

interface ActivityContextType {
  activities: ActivityItem[];
  logActivity: (activity: Omit<ActivityItem, 'id' | 'user_id' | 'timestamp'>) => void;
  clearActivities: () => void;
  getActivitiesForBoard: (boardId: string) => ActivityItem[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { user } = useAuth();

  const logActivity = (activity: Omit<ActivityItem, 'id' | 'user_id' | 'timestamp'>) => {
    if (!user) return;

    const newActivity: ActivityItem = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random()}`,
      user_id: user.id,
      timestamp: new Date().toISOString(),
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep only last 100 activities
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const getActivitiesForBoard = (boardId: string) => {
    return activities.filter(activity => activity.board_id === boardId);
  };

  return (
    <ActivityContext.Provider value={{
      activities,
      logActivity,
      clearActivities,
      getActivitiesForBoard
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
} 