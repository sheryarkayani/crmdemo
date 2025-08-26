import React, { useState } from 'react';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBoardContext } from '@/context/BoardContext';

const CreateBoardDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createBoard } = useBoardContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await createBoard(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="premium-button interactive-apple apple-card border-0 shadow-apple-md"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Board
          <Sparkles className="w-4 h-4 ml-2 opacity-60" />
        </Button>
      </DialogTrigger>
      <DialogContent className="apple-card border-border/10 max-w-md backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl"></div>
        <div className="relative">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-semibold text-gradient-apple flex items-center gap-3">
              <div className="w-10 h-10 gradient-apple-blue rounded-2xl flex items-center justify-center shadow-apple">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Create New Board
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base leading-relaxed">
              Start a new project and organize your team's workflow with a custom board.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Board Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Marketing Campaign, Product Launch..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="premium-focus h-11 border-border/20"
                required
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what this board is for and what your team will accomplish..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="premium-focus min-h-[80px] resize-none border-border/20"
                disabled={isCreating}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 premium-focus border-border/20"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 premium-button hover:shadow-apple-md"
                disabled={!title.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Board
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardDialog;