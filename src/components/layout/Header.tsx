import React from 'react';
import { Star, Users, User, ChevronDown, Clock, Shield, LogOut, Plus, Edit, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useBoardContext } from '@/context/BoardContext';
import { useAuth } from '@/context/AuthContext';
import { useActivity } from '@/context/ActivityContext';

const Header = () => {
  const { currentBoard, currentView, setCurrentView, canEditCurrentBoard } = useBoardContext();
  const { user, signOut } = useAuth();
  const { getActivitiesForBoard } = useActivity();

  if (!currentBoard || !user) return null;

  const hasEditAccess = canEditCurrentBoard();
  
  // Get activities for the current board
  const boardActivities = currentBoard ? getActivitiesForBoard(currentBoard.id) : [];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="apple-card border-0 border-b border-border/20 backdrop-blur-xl bg-white/95 dark:bg-black/80 shadow-apple-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Board Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Board Icon with Apple-style Design */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-apple-blue flex items-center justify-center shadow-apple-md neon-apple-blue">
                <span className="text-xl filter drop-shadow-sm">{currentBoard.icon || '📋'}</span>
              </div>
              
              {/* Board Title with Clean Typography */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gradient-apple tracking-tight">
                {currentBoard.title}
              </h1>
                  {/* Access Level Badge */}
                  <Badge 
                    variant={hasEditAccess ? "default" : "secondary"} 
                    className={`text-xs ${hasEditAccess ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {hasEditAccess ? 'Edit Access' : 'View Only'}
                  </Badge>
                </div>
                {currentBoard.description && (
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    {currentBoard.description}
                  </p>
                )}
                {/* Department Badge */}
                {currentBoard.owner_role && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {currentBoard.owner_role.charAt(0).toUpperCase() + currentBoard.owner_role.slice(1)} Department
                  </Badge>
                )}
              </div>
              
              {/* Star Button with Subtle Animation */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="interactive-apple rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 clean-transition"
                disabled={!hasEditAccess}
              >
                <Star className={`w-5 h-5 clean-transition ${
                  currentBoard.is_starred 
                    ? 'text-yellow-500 fill-yellow-500 filter drop-shadow-sm' 
                    : 'text-muted-foreground hover:text-yellow-500'
                }`} />
              </Button>
            </div>
          </div>

          {/* Center Section - Premium View Toggle */}
          <div className="flex items-center gap-0.5 p-1 bg-muted/30 rounded-xl backdrop-blur-sm border border-border/20">
            {(['table', 'kanban', 'dashboard', 'gantt'] as const).map((view) => (
              <Button
                key={view}
                variant={currentView === view ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(view)}
                className={`
                  px-4 py-2 rounded-lg font-medium clean-transition
                  ${currentView === view 
                    ? 'bg-white dark:bg-slate-800 shadow-apple text-foreground neon-apple-blue border-0' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-slate-800/60 border-0'
                  }
                `}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Activity Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="interactive-apple apple-card border-border/20 hover:border-border/40 backdrop-blur-sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Activity
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0 apple-card border-border/10" align="end">
                <div className="p-4 border-b border-border/10 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20">
                  <h3 className="font-semibold text-foreground">Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">Latest updates on this board</p>
                </div>
                <div className="max-h-80 overflow-y-auto apple-scrollbar">
                  {boardActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <Clock className="w-12 h-12 text-muted-foreground/40 mb-3" />
                      <h4 className="font-medium text-foreground mb-1">No recent activity</h4>
                      <p className="text-sm text-muted-foreground">
                        Activity will appear here when team members interact with this board
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {boardActivities.slice(0, 6).map((activity, index) => {
                        const getActivityIcon = (type: string) => {
                          switch (type) {
                            case 'task_created':
                              return <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Plus className="w-4 h-4 text-green-600 dark:text-green-400" /></div>;
                            case 'task_updated':
                              return <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>;
                            case 'task_completed':
                              return <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" /></div>;
                            default:
                              return <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center"><Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" /></div>;
                          }
                        };

                        const getActivityMessage = (activity: any) => {
                          switch (activity.type) {
                            case 'task_created':
                              return `New task "${activity.task_title || 'Untitled'}" was created`;
                            case 'task_updated':
                              return `Task "${activity.task_title || 'Untitled'}" was updated`;
                            case 'task_completed':
                              return `Task "${activity.task_title || 'Untitled'}" was completed`;
                            default:
                              return 'Activity recorded';
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

                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/20"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getActivityIcon(activity.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground font-medium mb-1 leading-relaxed">
                                {getActivityMessage(activity)}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(activity.timestamp)}
                                </span>
                                {activity.user_id && (
                                  <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                                    User {activity.user_id.slice(0, 8)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {boardActivities.length > 6 && (
                        <div className="text-center pt-2 border-t border-border/10">
                          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            View all {boardActivities.length} activities
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Team Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="interactive-apple apple-card border-border/20 hover:border-border/40 backdrop-blur-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Team
            </Button>

            {/* Profile Button with User Info */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 pl-3 border-l border-border/20 cursor-pointer hover:bg-muted/30 rounded-lg p-2 clean-transition">
                  <div className="w-8 h-8 rounded-full gradient-apple-green flex items-center justify-center shadow-apple">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-foreground">{user.fullname || user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 apple-card border-border/10" align="end">
                <div className="space-y-2">
                  <div className="p-3 border-b border-border/10">
                    <p className="font-medium text-foreground">{user.fullname || user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge className="text-xs mt-2">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                  </div>
                  
          <Button
            variant="ghost"
            size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 clean-transition rounded-lg"
                    onClick={handleSignOut}
          >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
          </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;