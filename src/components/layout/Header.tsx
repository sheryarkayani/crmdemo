import React from 'react';
import { Star, Users, User, ChevronDown, Clock, Shield, LogOut, Plus, Edit, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBoardContext } from '@/context/BoardContext';
import { useAuth } from '@/context/AuthContext';
// import { useActivity } from '@/context/ActivityContext';

const Header = () => {
  const { currentBoard, currentView, setCurrentView, canEditCurrentBoard } = useBoardContext();
  const { user, signOut } = useAuth();
  // const { getActivitiesForBoard } = useActivity();

  if (!currentBoard || !user) return null;

  const hasEditAccess = canEditCurrentBoard();
  
  // Mock recent activities with unread/read toggle
  const [recentActivities, setRecentActivities] = React.useState<Array<{ id: string; message: string; timestamp: string; read: boolean }>>([
    { id: 'ra-1', message: 'New deal S-1001 created for Acme Corp', timestamp: new Date().toISOString(), read: false },
    { id: 'ra-2', message: 'Lead converted: Globex → Opportunity', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), read: false },
    { id: 'ra-3', message: 'Purchase invoice INV-9001 approved', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: true }
  ]);
  const unreadCount = recentActivities.filter(a => !a.read).length;
  const markAsRead = (id: string) => setRecentActivities(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

  // Mock team members (demo only)
  const teamMembers = [
    { id: 'tm-1', name: 'Aisha Khan', email: 'aisha@company.com', role: 'Sales', status: 'online' },
    { id: 'tm-2', name: 'Bilal Ahmed', email: 'bilal@company.com', role: 'Purchase', status: 'away' },
    { id: 'tm-3', name: 'Fatima Noor', email: 'fatima@company.com', role: 'Operations', status: 'offline' },
    { id: 'tm-4', name: 'Omar Malik', email: 'omar@company.com', role: 'Finance', status: 'online' },
    { id: 'tm-5', name: 'Sara Ali', email: 'sara@company.com', role: 'HR', status: 'online' },
  ];
  const getInitials = (full: string) => full.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-orange-600 flex items-center justify-center shadow-apple-md">
                <span className="text-xl filter drop-shadow-sm text-white">{currentBoard.icon || '📋'}</span>
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
          <div className="flex items-center gap-0.5 p-1 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/30 dark:to-orange-950/30 rounded-xl backdrop-blur-sm border border-red-100/40 dark:border-red-800/40">
            {(['table', 'kanban', 'dashboard', 'gantt'] as const).map((view) => (
              <Button
                key={view}
                variant={currentView === view ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(view)}
                className={`
                  px-4 py-2 rounded-lg font-medium clean-transition
                  ${currentView === view 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-apple text-white border-0' 
                    : 'text-muted-foreground hover:text-red-700 dark:hover:text-red-300 hover:bg-white/60 dark:hover:bg-slate-800/60 border-0'
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
                  <Clock className={`w-4 h-4 mr-2 ${unreadCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                  <span className="mr-2">Activity</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${unreadCount > 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{unreadCount}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0 apple-card border-border/10" align="end">
                <div className="p-4 border-b border-border/10 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20">
                  <h3 className="font-semibold text-foreground">Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">Latest updates</p>
                </div>
                <div className="max-h-80 overflow-y-auto apple-scrollbar">
                  {recentActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <Clock className="w-12 h-12 text-muted-foreground/40 mb-3" />
                      <h4 className="font-medium text-foreground mb-1">No recent activity</h4>
                      <p className="text-sm text-muted-foreground">
                        Activity will appear here when team members interact with this board
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {recentActivities.slice(0, 8).map((activity) => {
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
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/20 cursor-pointer"
                            onClick={() => markAsRead(activity.id)}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`w-3 h-3 rounded-full ${activity.read ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground font-medium mb-1 leading-relaxed">
                                {activity.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(activity.timestamp)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${activity.read ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                  {activity.read ? 'Read' : 'Unread'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {recentActivities.length > 8 && (
                        <div className="text-center pt-2 border-t border-border/10">
                          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            View all {recentActivities.length} activities
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Team Button with popover (mock data) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="interactive-apple apple-card border-border/20 hover:border-border/40 backdrop-blur-sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Team
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0 apple-card border-border/10" align="end">
                <div className="p-4 border-b border-border/10 bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-900/20 dark:to-blue-900/20">
                  <h3 className="font-semibold text-foreground">Team Members</h3>
                  <p className="text-sm text-muted-foreground">People in your workspace</p>
                </div>
                <div className="max-h-80 overflow-y-auto apple-scrollbar p-2">
                  {teamMembers.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${m.status === 'online' ? 'bg-green-500' : m.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{m.name}</span>
                          <Badge variant="outline" className="text-xs">{m.role}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full ${m.status === 'online' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : m.status === 'away' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

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