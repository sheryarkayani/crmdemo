import React, { useState } from 'react';
import { ChevronDown, Check, User, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/UserContext';
import { cn } from '@/lib/utils';

interface PersonCellProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const PersonCell = ({ value, onChange }: PersonCellProps) => {
  const [open, setOpen] = useState(false);
  const { users, getUserDisplayName, getUserInitials } = useUserContext();

  const selectedUser = value ? users.find(user => user.id === value) : null;

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-9 px-3 text-left font-normal hover:bg-muted/50 transition-all duration-200",
            !selectedUser && "text-muted-foreground"
          )}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 w-full">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium",
                getAvatarColor(selectedUser.fullname || selectedUser.username)
              )}>
                {getUserInitials(selectedUser.id)}
              </div>
              <span className="truncate">{getUserDisplayName(selectedUser.id)}</span>
              <X 
                className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <User className="w-3 h-3 text-muted-foreground" />
              </div>
              <span>Assign person</span>
              <ChevronDown className="w-3 h-3 ml-auto" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-2 glass-card border-border/50 animate-slide-up" 
        align="start"
        sideOffset={4}
      >
        <div className="space-y-1">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Team Members
          </div>
          
          {/* Unassign option */}
          <button
            className={cn(
              "w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3",
              "transition-all duration-200 hover:bg-muted/50 text-left",
              !selectedUser && "bg-muted/30"
            )}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">Unassigned</span>
            {!selectedUser && (
              <Check className="w-4 h-4 ml-auto text-primary" />
            )}
          </button>

          {/* User options */}
          {users.map((user) => (
            <button
              key={user.id}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3",
                "transition-all duration-200 hover:bg-muted/50 text-left group",
                selectedUser?.id === user.id && "bg-muted/30"
              )}
              onClick={() => {
                onChange(user.id);
                setOpen(false);
              }}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium",
                getAvatarColor(user.fullname || user.username)
              )}>
                {getUserInitials(user.id)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">
                  {user.fullname || user.username}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>
              {selectedUser?.id === user.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PersonCell; 