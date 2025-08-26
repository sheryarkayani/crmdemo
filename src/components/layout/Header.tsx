import React, { useState } from 'react';
import { Star, MoreHorizontal, Users, User, ChevronDown, Settings, Clock, Trash2, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useBoardContext } from '@/context/BoardContext';
import { useAuth } from '@/context/AuthContext';
import { useActivity } from '@/context/ActivityContext';
import CreateBoardDialog from '@/components/dialogs/CreateBoardDialog';
import ActivityLog from '@/components/activity/ActivityLog';

const Header = () => {
  const { currentBoard, currentView, setCurrentView, deleteBoard, canEditCurrentBoard } = useBoardContext();
  const { user, signOut } = useAuth();
  const { getActivitiesForBoard } = useActivity();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentBoard || !user) return null;

  const hasEditAccess = canEditCurrentBoard();
  
  // Get activities for the current board
  const boardActivities = currentBoard ? getActivitiesForBoard(currentBoard.id) : [];

  const handleDeleteBoard = async () => {
    if (!hasEditAccess) return;
    
    setIsDeleting(true);
    try {
      await deleteBoard(currentBoard.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete board:', error);
    } finally {
      setIsDeleting(false);
    }
  };

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
                  <ActivityLog activities={boardActivities} />
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

            {/* Create Board Dialog - Only show if user can create boards */}
            {hasEditAccess && <CreateBoardDialog />}

            {/* Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="interactive-apple apple-card border-border/20 hover:border-border/40 backdrop-blur-sm"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 apple-card border-border/10" align="end">
                <div className="space-y-1">
                  <div className="p-3 border-b border-border/10">
                    <h4 className="font-medium text-foreground">Board Actions</h4>
        </div>

                  {hasEditAccess && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:bg-muted/50 clean-transition rounded-lg"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Board Settings
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start hover:bg-muted/50 clean-transition rounded-lg"
                    disabled={!hasEditAccess}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {currentBoard.is_starred ? 'Remove from favorites' : 'Add to favorites'}
                  </Button>
                  
                  {hasEditAccess && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 clean-transition rounded-lg"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Board
                    </Button>
                  )}
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
                    className="w-full justify-start hover:bg-muted/50 clean-transition rounded-lg"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                  
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

      {/* Board Settings Dialog - Only show if user has edit access */}
      {hasEditAccess && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="apple-card border-border/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gradient-apple text-xl font-semibold">Board Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Board Title</label>
                <Input
                  value={boardTitle || currentBoard.title}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  className="mt-1 premium-focus border-border/20"
                  placeholder="Enter board title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input
                  defaultValue={currentBoard.description || ''}
                  className="mt-1 premium-focus border-border/20"
                  placeholder="Enter board description"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="premium-focus border-border/20"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setIsDialogOpen(false)}
                  className="premium-button hover:shadow-apple-md"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Board Confirmation Dialog - Only show if user has edit access */}
      {hasEditAccess && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="apple-card border-border/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Board
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-foreground font-medium mb-2">
                  Are you sure you want to delete "{currentBoard.title}"?
                </p>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone. All tasks, groups, and data associated with this board will be permanently deleted.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="premium-focus border-border/20"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteBoard}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Board
                    </>
                  )}
                </Button>
      </div>
    </div>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
};

export default Header;