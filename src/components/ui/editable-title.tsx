import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => Promise<void>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'heading' | 'card';
  disabled?: boolean;
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  onSave,
  className = '',
  size = 'md',
  variant = 'default',
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsEditing(true);
    setEditTitle(title);
  };

  const handleEditSave = async () => {
    if (editTitle.trim() && editTitle !== title) {
      try {
        setIsSaving(true);
        await onSave(editTitle.trim());
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating title:', error);
        setEditTitle(title); // Reset on error
        setIsEditing(false);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(false);
      setEditTitle(title);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'heading':
        return 'font-bold text-foreground';
      case 'card':
        return 'font-semibold text-foreground';
      default:
        return 'font-medium text-foreground';
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            getSizeClasses(),
            "font-medium",
            className
          )}
          autoFocus
          onBlur={handleEditSave}
          disabled={isSaving}
        />
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
            onClick={handleEditSave}
            disabled={isSaving}
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            onClick={handleEditCancel}
            disabled={isSaving}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group/title">
      <span
        className={cn(
          getSizeClasses(),
          getVariantClasses(),
          "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={handleEditStart}
        title={disabled ? "Editing disabled" : "Click to edit title"}
      >
        {title}
      </span>
      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 h-6 w-6 rounded text-gray-500 hover:text-gray-700"
          onClick={handleEditStart}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default EditableTitle;
