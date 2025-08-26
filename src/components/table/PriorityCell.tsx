import React, { useState } from 'react';
import { ChevronDown, Check, AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PriorityOption } from '@/types/board';
import { cn } from '@/lib/utils';

interface PriorityCellProps {
  value: string;
  options: PriorityOption[];
  onChange: (value: string) => void;
}

const PriorityCell = ({ value, options, onChange }: PriorityCellProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(opt => opt.label === value) || options[0];

  const getContrastColor = (bgColor: string) => {
    // Simple contrast calculation - in a real app you might want a more sophisticated approach
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155 ? '#000000' : '#ffffff';
  };

  const getPriorityIcon = (label: string) => {
    const iconClass = "w-3 h-3";
    switch (label?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return <ArrowUp className={iconClass} />;
      case 'medium':
        return <Minus className={iconClass} />;
      case 'low':
        return <ArrowDown className={iconClass} />;
      case 'critical':
        return <AlertTriangle className={iconClass} />;
      default:
        return <Minus className={iconClass} />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "group relative px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 min-w-[110px] justify-between",
            "transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50",
            "border border-white/20 backdrop-blur-sm"
          )}
          style={{ 
            backgroundColor: selectedOption?.color || '#c4c4c4',
            color: getContrastColor(selectedOption?.color || '#c4c4c4')
          }}
        >
          <div className="flex items-center gap-2">
            {getPriorityIcon(selectedOption?.label)}
            <span className="truncate">{selectedOption?.label || 'Set priority'}</span>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-200",
            open && "rotate-180"
          )} />
          
          {/* Subtle shine effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-52 p-2 glass-card border-border/50 animate-slide-up" 
        align="start"
        sideOffset={4}
      >
        <div className="space-y-1">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Priority Levels
          </div>
          {options.map((option) => (
            <button
              key={option.id}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between",
                "transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                "border border-white/20 backdrop-blur-sm relative overflow-hidden group",
                selectedOption?.id === option.id && "ring-2 ring-white/30"
              )}
              style={{ 
                backgroundColor: option.color,
                color: getContrastColor(option.color)
              }}
              onClick={() => {
                onChange(option.label);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                {getPriorityIcon(option.label)}
                <span className="truncate">{option.label}</span>
              </div>
              {selectedOption?.id === option.id && (
                <Check className="w-4 h-4 animate-scale-in" />
              )}
              
              {/* Hover shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 pointer-events-none" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PriorityCell;