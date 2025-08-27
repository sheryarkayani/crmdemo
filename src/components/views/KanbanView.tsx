import React, { useState } from 'react';
import { Plus, MoreHorizontal, Calendar, Paperclip, MessageCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBoardContext } from '@/context/BoardContext';
import { useUserContext } from '@/context/UserContext';
import { TaskData } from '@/types/board';
import { cn } from '@/lib/utils';
import TaskActionPanel from '@/components/task/TaskActionPanel';
import EditableTitle from '@/components/ui/editable-title';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

const TaskCard = ({ task, onTaskClick }: { task: TaskData; onTaskClick: (task: TaskData) => void }) => {
  const { updateTask } = useBoardContext();
  const { getUserDisplayName, getUserInitials } = useUserContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { color: string, label: string }> = {
      'Low': { color: 'bg-green-100 text-green-700 border-green-200', label: 'Low' },
      'Medium': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Medium' },
      'High': { color: 'bg-red-100 text-red-700 border-red-200', label: 'High' },
      'Critical': { color: 'bg-red-100 text-red-700 border-red-200', label: 'Critical' }
    };
    return priorityMap[priority] || { color: 'bg-gray-100 text-gray-700 border-gray-200', label: priority };
  };

  const handleTitleSave = async (newTitle: string) => {
    await updateTask(task.id, { title: newTitle });
  };

  const handleCardClick = () => {
    onTaskClick(task);
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700 hover-lift group cursor-grab active:cursor-grabbing mb-3"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <EditableTitle
              title={task.title}
              onSave={handleTitleSave}
              variant="card"
              size="sm"
              className="text-foreground"
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Priority Badge */}
        {task.priority && (
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs px-2 py-1", getPriorityBadge(task.priority).color)}
            >
              {getPriorityBadge(task.priority).label}
            </Badge>
          </div>
        )}

        {/* Task Metadata */}
        <div className="space-y-2">
          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}

          {/* Files indicator */}
          {task.files && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Paperclip className="w-3 h-3" />
              <span>{JSON.stringify(task.files).length} files</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {task.assignee_id ? (
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium",
                  getAvatarColor(getUserDisplayName(task.assignee_id))
                )}>
                  {getUserInitials(task.assignee_id)}
                </div>
                <span className="text-xs font-medium text-foreground">
                  {getUserDisplayName(task.assignee_id).split(' ')[0]}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs">?</span>
                </div>
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>

          {/* Comments indicator */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="w-3 h-3" />
            <span className="text-xs">0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusColumn = ({ status, tasks, onTaskClick }: { status: any, tasks: TaskData[], onTaskClick: (task: TaskData) => void }) => {
  const { addTask } = useBoardContext();
  const { setNodeRef } = useDroppable({
    id: `status-${status.id}`,
  });

  const getContrastColor = (bgColor: string) => {
    if (!bgColor || !bgColor.startsWith('#')) return '#ffffff';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155 ? '#000000' : '#ffffff';
  };

  const handleAddTask = () => {
    // For now, add to first group - this could be improved
    const firstGroup = tasks[0]?.group_id;
    if (firstGroup) {
      addTask(firstGroup, 'New Task');
    }
  };

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div 
        className="rounded-t-xl p-4 text-white font-semibold shadow-sm"
        style={{ 
          backgroundColor: status.color || '#666',
          color: getContrastColor(status.color || '#666')
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{status.label}</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {tasks.length}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/80 hover:text-white hover:bg-white/20"
            onClick={handleAddTask}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-b-xl min-h-[400px]">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <p className="text-sm">No tasks</p>
            <p className="text-xs mt-1">Drag tasks here or click + to add</p>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanView = () => {
  const { currentBoard, updateTask } = useBoardContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!currentBoard) return null;

  // Get all tasks from all groups
  const allTasks = currentBoard.groups?.flatMap(group => 
    group.tasks?.map(task => ({ ...task, group_id: group.id })) || []
  ) || [];

  // Group tasks by status
  const tasksByStatus = currentBoard.status_options?.map(status => ({
    ...status,
    tasks: allTasks.filter(task => task.status === status.label)
  })) || [];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const task = allTasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a status column
    if (overId.startsWith('status-')) {
      const statusId = overId.replace('status-', '');
      const targetStatus = currentBoard.status_options?.find(status => status.id === statusId);
      
      if (targetStatus) {
        updateTask(activeTaskId, { status: targetStatus.label });
      }
    } else {
      // Dropped on another task, find which status column it belongs to
      const targetTask = allTasks.find(task => task.id === overId);
      if (targetTask && targetTask.status) {
        updateTask(activeTaskId, { status: targetTask.status });
      }
    }

    setActiveId(null);
    setActiveTask(null);
  };

  const handleTaskClick = (task: TaskData) => {
    setSelectedTask(task);
  };

  const handleCloseTaskPanel = () => {
    setSelectedTask(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="p-6 bg-background min-h-screen">
          {/* real-time Mode Warning */}
          {!isSupabaseConfigured() && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">real-time Mode Active</h3>
                  <p className="text-sm text-yellow-700">
                    Changes are saved locally but not persisted to the database. 
                    <a href="#supabase-setup" className="underline ml-1">Configure Supabase</a> to enable full functionality.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Kanban Board</h2>
                <p className="text-muted-foreground mt-1">Drag and drop tasks to update their status</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="rounded-lg">
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  More Options
                </Button>
              </div>
            </div>
          </div>

          {/* Horizontal Kanban Columns */}
          <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px]">
            {tasksByStatus.map((statusGroup) => (
              <StatusColumn 
                key={statusGroup.id} 
                status={statusGroup} 
                tasks={statusGroup.tasks}
                onTaskClick={handleTaskClick}
              />
            ))}
            
            {tasksByStatus.length === 0 && (
              <div className="flex-1 text-center text-muted-foreground py-12">
                <div className="w-16 h-16 bg-muted rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-lg font-medium">No status columns available</p>
                <p className="text-sm mt-1">Create status options to organize your tasks</p>
              </div>
            )}
          </div>
          
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onTaskClick={handleTaskClick} /> : null}
          </DragOverlay>
        </div>
      </DndContext>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskActionPanel 
          task={selectedTask} 
          onClose={handleCloseTaskPanel} 
        />
      )}
    </>
  );
};

export default KanbanView;