import React from 'react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/types/board';
import { 
  UserCheck, 
  FileText, 
  Send, 
  DollarSign, 
  CheckCircle, 
  MessageCircle,
  AlertTriangle,
  Archive,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonPanelProps {
  buttons: ActionButton[];
  onActionClick: (action: string) => void;
  className?: string;
}

const ActionButtonPanel: React.FC<ActionButtonPanelProps> = ({ 
  buttons, 
  onActionClick, 
  className 
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'user-check': return <UserCheck className="w-4 h-4" />;
      case 'file-text': return <FileText className="w-4 h-4" />;
      case 'send': return <Send className="w-4 h-4" />;
      case 'dollar-sign': return <DollarSign className="w-4 h-4" />;
      case 'check-circle': return <CheckCircle className="w-4 h-4" />;
      case 'message-circle': return <MessageCircle className="w-4 h-4" />;
      case 'alert-triangle': return <AlertTriangle className="w-4 h-4" />;
      case 'archive': return <Archive className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getColorClasses = (color: ActionButton['color']) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'green':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'orange':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'purple':
        return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'yellow':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'red':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  if (buttons.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {buttons
        .filter(button => button.visible !== false)
        .map((button, index) => (
          <Button
            key={index}
            onClick={() => onActionClick(button.action)}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              getColorClasses(button.color)
            )}
            size="sm"
          >
            {getIcon(button.icon)}
            {button.label}
          </Button>
        ))}
    </div>
  );
};

export default ActionButtonPanel; 