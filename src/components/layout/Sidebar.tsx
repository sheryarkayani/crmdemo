import React from 'react';
import { Star, Search, Plus, ChevronRight, Lock, Eye, LogOut, Home, Calendar, BarChart3, Bell, Folder, User, ChevronDown, Settings, LayoutDashboard, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

  const filteredBoards = boards.filter(board =>
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
      active: false, 
      badge: '3',
      onClick: () => {} // TODO: Implement notifications
    },
  ];

  if (!user) return null;

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Monday Board</h2>
            <p className="text-xs text-gray-500">Project Management</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-3">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.onClick}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors
                  ${item.active 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-5 rounded-full">
                    {item.badge}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="mx-3" />

      {/* Boards Section Header */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Boards</span>
          </div>
        </div>
      </div>

      {/* Boards List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-1">
          {filteredBoards.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {searchTerm ? 'No boards found' : 'No boards yet'}
              </p>
              {!searchTerm && (
                <p className="text-xs text-gray-400 mt-1">Create your first board</p>
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
                    group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Board Color Indicator */}
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: board.background_color || '#6366f1' }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium truncate ${
                        isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {board.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {board.is_starred && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                        {getAccessIcon(accessLevel)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 capitalize">
                        {board.owner_role || 'general'}
                      </span>
                      <span className="text-xs text-gray-400">
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
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group">
          <Avatar className="w-8 h-8">
            <AvatarFallback className={`text-white text-sm font-medium ${getUserAvatarColor(user.fullname || user.username)}`}>
              {getUserInitials(user.id)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.fullname || user.username}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-7 h-7 p-0 hover:bg-gray-200"
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="w-7 h-7 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;