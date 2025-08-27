import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { useBoardContext } from '@/context/BoardContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateTaskDialogProps {
  onTaskCreated?: () => void;
  trigger?: React.ReactNode;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  board_id: string;
  group_id: string;
  assignee_id: string; // use 'unassigned' sentinel for none
  due_date: Date | null;
  start_date: Date | null;
  end_date: Date | null;
  budget: number | null;
  progress: number;
  tags: string;
  urgency_level: string;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ 
  onTaskCreated, 
  trigger 
}) => {
  const { boards, createTask, refreshCurrentBoard, setCurrentBoard } = useBoardContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, name: string}>>([]);

  // Initialize form data
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'New',
    priority: 'Medium',
    board_id: '',
    group_id: '',
    assignee_id: '',
    due_date: null,
    start_date: null,
    end_date: null,
    budget: null,
    progress: 0,
    tags: '',
    urgency_level: 'Medium'
  });

  // Get available statuses and priorities
  const statusOptions = ['New', 'In Progress', 'Planning', 'Pending', 'Completed', 'On Hold'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const urgencyOptions = ['Low', 'Medium', 'High', 'Critical'];

  // Get available groups for selected board
  const availableGroups = boards
    .find(board => board.id === formData.board_id)
    ?.groups || [];

  // Get available users (mock data for real-time)
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      // real-time mode - mock users
      setAvailableUsers([
        { id: '11111111-1111-1111-1111-111111111111', name: 'Super Administrator' },
        { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'John Developer' },
        { id: 'b2c3d4e5-f6g7-8901-2345-678901bcdefg', name: 'Sarah Designer' },
        { id: '7744c17c-d74a-4d65-93d5-34d6bb8ffcad', name: 'Mike Backend' },
      ]);
    } else {
      // TODO: Fetch real users from database
      setAvailableUsers([
        { id: user?.id || 'current-user', name: user?.fullname || user?.username || 'Current User' }
      ]);
    }
  }, [user]);

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset group_id when board changes
    if (field === 'board_id') {
      setFormData(prev => ({
        ...prev,
        board_id: value,
        group_id: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.board_id || !formData.group_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Check if we're in real-time mode
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        toast({
          title: "real-time Mode",
          description: "Task creation is not available in real-time mode. Please configure Supabase for full functionality.",
          variant: "default",
        });
        return;
      }

      // Set the current board before creating the task
      const selectedBoard = boards.find(board => board.id === formData.board_id);
      if (selectedBoard) {
        setCurrentBoard(selectedBoard);
      }

      const assigneeValue = !formData.assignee_id || formData.assignee_id === 'unassigned' ? null : formData.assignee_id;

      // Prepare task data
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        assignee_id: assigneeValue,
        due_date: formData.due_date?.toISOString() || null,
        start_date: formData.start_date?.toISOString() || null,
        end_date: formData.end_date?.toISOString() || null,
        budget: formData.budget || null,
        progress: formData.progress,
        tags: formData.tags || null,
        urgency_level: formData.urgency_level as 'Low' | 'Medium' | 'High' | 'Critical',
        board_id: formData.board_id,
        group_id: formData.group_id,
        created_by: user?.id || null,
        custom_fields: {
          text_field: formData.description || null,
          number_field: formData.progress
        }
      };

      // Create task using BoardContext
      await createTask(formData.group_id, taskData);

      toast({
        title: "Success",
        description: "Task created successfully!",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'New',
        priority: 'Medium',
        board_id: '',
        group_id: '',
        assignee_id: '',
        due_date: null,
        start_date: null,
        end_date: null,
        budget: null,
        progress: 0,
        tags: '',
        urgency_level: 'Medium'
      });

      // Close dialog and refresh
      setOpen(false);
      if (onTaskCreated) {
        onTaskCreated();
      }
      
      // Refresh the current board to show the new task
      await refreshCurrentBoard();

    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'New',
      priority: 'Medium',
      board_id: '',
      group_id: '',
      assignee_id: '',
      due_date: null,
      start_date: null,
      end_date: null,
      budget: null,
      progress: 0,
      tags: '',
      urgency_level: 'Medium'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="create-task-desc">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Task</DialogTitle>
          {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && (
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
              ⚠️ real-time Mode: Task creation requires Supabase configuration
            </p>
          )}
        </DialogHeader>

        <p id="create-task-desc" className="sr-only">Fill the form to create a new task</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the task in detail"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency_level} onValueChange={(value) => handleInputChange('urgency_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map(urgency => (
                      <SelectItem key={urgency} value={urgency}>{urgency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Organization</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="board">Board *</Label>
                <Select value={formData.board_id} onValueChange={(value) => handleInputChange('board_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map(board => (
                      <SelectItem key={board.id} value={board.id}>
                        {board.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group">Group *</Label>
                <Select 
                  value={formData.group_id} 
                  onValueChange={(value) => handleInputChange('group_id', value)}
                  disabled={!formData.board_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.board_id ? "Select group" : "Select board first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select value={formData.assignee_id} onValueChange={(value) => handleInputChange('assignee_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => handleInputChange('start_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={(date) => handleInputChange('due_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => handleInputChange('end_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget || ''}
                  onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Enter budget amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Enter tags (comma separated)"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
