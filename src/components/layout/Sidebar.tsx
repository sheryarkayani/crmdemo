import React from 'react';
import { Star, Search, Plus, ChevronRight, Lock, Eye, LogOut, Home, Calendar, BarChart3, Bell, Folder, User, ChevronDown, Settings, LayoutDashboard, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useBoardContext } from '@/context/BoardContext';
import { useAuth } from '@/context/AuthContext';
import { useUserContext } from '@/context/UserContext';

import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { boards, currentBoard, setCurrentBoard, canEditCurrentBoard } = useBoardContext();
  const { user, signOut } = useAuth();
  const { getUserInitials } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Mock notifications (real-time-only)
  const [notifications, setNotifications] = React.useState<Array<{ id: string; title: string; message: string; timestamp: string; read: boolean; type: 'info' | 'warning' | 'success' }>>([
    { id: 'n-1', title: 'Proposal Sent', message: 'Proposal for Acme Corp has been emailed.', timestamp: new Date().toISOString(), read: false, type: 'success' },
    { id: 'n-2', title: 'Payment Due', message: 'Invoice INV-9001 is due in 3 days.', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), read: false, type: 'warning' },
    { id: 'n-3', title: 'New Lead', message: 'New lead from Globex added to pipeline.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: true, type: 'info' }
  ]);
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

  const allowedBoards = ['sales', 'leads', 'activity', 'purchase', 'store', 'ops', 'finance', 'contacts', 'hr'];
  const filteredBoards = boards
    .filter(board => allowedBoards.some(ab => board.title.toLowerCase().includes(ab)))
    .filter(board =>
      board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getBoardAccessLevel = (board: any) => {
    if (!user) return 'none';
    
    // Superadmin can edit any board
    if (user.role === 'superadmin') return 'edit';
    
    // Board owner can edit their board
    if (board.owner_id === user.id) return 'edit';
    
    // Users can edit boards that belong to their department/role
    if (board.owner_role === user.role) return 'edit';
    
    // All authenticated users can at least view
    return 'view';
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'view':
        return <Eye className="w-3 h-3 text-blue-600" />;
      default:
        return <Lock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getUserAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const navigationItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      active: location.pathname === '/dashboard',
      onClick: () => navigate('/dashboard')
    },
    { 
      id: 'boards', 
      label: 'My work', 
      icon: BarChart3, 
      active: location.pathname === '/my-works',
      onClick: () => navigate('/my-works')
    },
    { 
      id: 'proposals', 
      label: 'Proposal Quotation', 
      icon: FileText, 
      active: location.pathname === '/proposals',
      onClick: () => navigate('/proposals')
    },
    { 
      id: 'training', 
      label: 'Training', 
      icon: GraduationCap, 
      active: location.pathname === '/training',
      onClick: () => navigate('/training')
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      active: location.pathname === '/notifications', 
      onClick: () => navigate('/notifications')
    },
  ];

  if (!user) return null;

  return (
    <div className="w-64 h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src="/Transparent%20Logo.png" 
            alt="DRAVOX" 
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">
              Dravox
            </h2>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm leading-tight">
              ERP/CRM
            </h3>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-red-500 dark:focus:border-red-400 transition-all duration-200 rounded-xl shadow-sm"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            if (item.id === 'notifications') {
              return (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className={`
                    group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden
                    ${item.active 
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-800/30 text-red-700 dark:text-red-300 shadow-md border border-red-200/50 dark:border-red-700/50' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-sm'
                    }
                  `}
                >
                  {item.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-400/10 dark:to-orange-400/10"></div>
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <IconComponent className={`w-5 h-5 transition-transform duration-200 ${item.active ? 'scale-110' : 'group-hover:scale-105'} ${unreadNotifications > 0 ? 'text-red-600' : ''}`} />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  <Badge className={`${unreadNotifications > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs px-2 py-1 min-w-[20px] h-6 rounded-full shadow-sm relative z-10`}>
                    {unreadNotifications}
                  </Badge>
                </div>
              );
            }
            return (
              <div
                key={item.id}
                onClick={item.onClick}
                className={`
                  group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden
                  ${item.active 
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-800/30 text-red-700 dark:text-red-300 shadow-md border border-red-200/50 dark:border-red-700/50' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-sm'
                  }
                `}
              >
                {item.active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-400/10 dark:to-orange-400/10"></div>
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <IconComponent className={`w-5 h-5 transition-transform duration-200 ${item.active ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 min-w-[20px] h-6 rounded-full shadow-sm relative z-10">
                    {item.badge}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="mx-4 bg-slate-200 dark:bg-slate-700" />

      {/* Boards Section Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-50/30 to-orange-50/30 dark:from-red-950/10 dark:to-orange-950/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Boards</span>
          </div>
        </div>
      </div>

      {/* Boards List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 apple-scrollbar">
        <div className="space-y-2">
          {filteredBoards.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {searchTerm ? 'No boards found' : 'No boards yet'}
              </p>
              {!searchTerm && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Create your first board</p>
              )}
            </div>
          ) : (
            filteredBoards.map((board) => {
              const accessLevel = getBoardAccessLevel(board);
              const isActive = currentBoard?.id === board.id;
              const taskCount = board.groups?.reduce((total, group) => total + (group.tasks?.length || 0), 0) || 0;
              
              return (
                <div
                  key={board.id}
                  onClick={() => setCurrentBoard(board)}
                  className={`
                    group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden border
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700/50 shadow-md' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 hover:shadow-sm'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                  )}
                  
                  {/* Board Color Indicator */}
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm relative z-10"
                    style={{ backgroundColor: board.background_color || '#6366f1' }}
                  />
                  
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold truncate ${
                        isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {board.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {board.is_starred && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        )}
                        {getAccessIcon(accessLevel)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
                        {board.owner_role || 'general'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        {taskCount} items
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/70 dark:hover:bg-slate-800/70 cursor-pointer group transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm">
          <Avatar className="w-10 h-10 ring-2 ring-slate-200 dark:ring-slate-700">
            <AvatarFallback className={`text-white text-sm font-bold ${getUserAvatarColor(user.fullname || user.username)} shadow-sm`}>
              {getUserInitials(user.id)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user.fullname || user.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
              {user.role}
            </p>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-8 h-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="w-8 h-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;