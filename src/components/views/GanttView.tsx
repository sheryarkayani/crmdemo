import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, User, FileText, Plus, ZoomIn, ZoomOut, Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBoardContext } from '@/context/BoardContext';
import { useUserContext } from '@/context/UserContext';
import { TaskData } from '@/types/board';
import { cn } from '@/lib/utils';
import EditableTitle from '@/components/ui/editable-title';

interface GanttTask extends TaskData {
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies?: string[];
}

interface TimelineScale {
  unit: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  columns: Date[];
}

const GanttView = () => {
  const { currentBoard, updateTask, loading } = useBoardContext();
  const { getUserById, getUserInitials } = useUserContext();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [timelineScale, setTimelineScale] = useState<'day' | 'week' | 'month'>('week');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const ganttRef = useRef<HTMLDivElement>(null);

  // Expand all groups by default when board loads
  useEffect(() => {
    if (currentBoard?.groups && expandedGroups.length === 0) {
      setExpandedGroups(currentBoard.groups.map(g => g.id));
    }
  }, [currentBoard?.groups]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 animate-fade-in">
          <div className="text-center">
            <div className="w-10 h-10 loading-spinner rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading Gantt chart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 animate-fade-in">
          <div className="text-center p-8 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No board selected</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Choose a board to view the timeline</p>
          </div>
        </div>
      </div>
    );
  }

  // Get all tasks and convert to GanttTask format
  const getAllTasks = (): GanttTask[] => {
    const tasks: GanttTask[] = [];
    
    currentBoard.groups?.forEach(group => {
      group.tasks?.forEach(task => {
        const startDate = task.start_date ? new Date(task.start_date) : new Date();
        const endDate = task.end_date ? new Date(task.end_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        tasks.push({
          ...task,
          startDate,
          endDate,
          progress: task.progress || 0,
          dependencies: [] // TODO: Add dependency logic
        });
      });
    });
    
    return tasks;
  };

  // Calculate timeline scale
  const calculateTimelineScale = (): TimelineScale => {
    const tasks = getAllTasks();
    if (tasks.length === 0) {
      const now = new Date();
      return {
        unit: timelineScale,
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        columns: []
      };
    }

    const startDate = new Date(Math.min(...tasks.map(t => t.startDate.getTime())));
    const endDate = new Date(Math.max(...tasks.map(t => t.endDate.getTime())));
    
    // Add padding
    const padding = timelineScale === 'day' ? 7 : timelineScale === 'week' ? 14 : 30;
    startDate.setDate(startDate.getDate() - padding);
    endDate.setDate(endDate.getDate() + padding);

    const columns: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      columns.push(new Date(current));
      
      if (timelineScale === 'day') {
        current.setDate(current.getDate() + 1);
      } else if (timelineScale === 'week') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    return { unit: timelineScale, startDate, endDate, columns };
  };

  const timeline = calculateTimelineScale();
  const columnWidth = 100 * zoomLevel; // Base width per column

  // Calculate task bar position and width
  const getTaskBarStyle = (task: GanttTask) => {
    const totalDuration = timeline.endDate.getTime() - timeline.startDate.getTime();
    const taskStart = task.startDate.getTime() - timeline.startDate.getTime();
    const taskDuration = task.endDate.getTime() - task.startDate.getTime();
    
    const left = (taskStart / totalDuration) * (timeline.columns.length * columnWidth);
    const width = (taskDuration / totalDuration) * (timeline.columns.length * columnWidth);
    
    return {
      left: `${left}px`,
      width: `${Math.max(width, 20)}px` // Minimum width
    };
  };

  // Format date for timeline headers
  const formatTimelineDate = (date: Date) => {
    if (timelineScale === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (timelineScale === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `Week ${Math.ceil(weekStart.getDate() / 7)}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      case 'on hold': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Handle drag start
  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  // Handle drag end (simplified - in real implementation would update dates)
  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Project Timeline</h2>
          <Badge variant="outline" className="text-xs">
            {getAllTasks().length} tasks
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Scale Selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((scale) => (
              <Button
                key={scale}
                variant={timelineScale === scale ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimelineScale(scale)}
                className="h-7 px-3 text-xs capitalize"
              >
                {scale}
              </Button>
            ))}
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500 min-w-[40px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="flex">
          {/* Left Panel - Task List */}
          <div className="w-80 border-r border-gray-200 bg-gray-50">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 bg-white flex items-center px-4">
              <span className="text-sm font-semibold text-gray-700">Tasks</span>
            </div>
            
            {/* Task List */}
            <div className="overflow-y-auto max-h-[600px]">
              {currentBoard.groups?.map((group) => (
                <div key={group.id}>
                  {/* Group Header */}
                  <div className="h-12 flex items-center gap-2 px-4 bg-white border-b border-gray-100 hover:bg-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroup(group.id)}
                      className="h-6 w-6 p-0"
                    >
                      {expandedGroups.includes(group.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color || '#666' }}
                    />
                    <span className="font-medium text-sm text-gray-900">{group.title}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {group.tasks?.length || 0}
                    </Badge>
                  </div>
                  
                  {/* Tasks */}
                  {expandedGroups.includes(group.id) && group.tasks?.map((task) => {
                    const assignedUser = task.assignee_id ? getUserById(task.assignee_id) : null;
                    
                    return (
                      <div key={task.id} className="h-12 flex items-center gap-2 px-8 bg-white border-b border-gray-50 hover:bg-blue-25">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <EditableTitle
                              title={task.title}
                              onSave={async (newTitle) => updateTask(task.id, { title: newTitle })}
                              variant="default"
                              size="sm"
                              className="text-gray-900"
                            />
                            {task.priority === 'Critical' && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">!</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {assignedUser && (
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs bg-blue-500 text-white">
                                  {getUserInitials(assignedUser.id)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span className="text-xs text-gray-500">
                              {task.start_date && task.end_date 
                                ? `${new Date(task.start_date).toLocaleDateString()} - ${new Date(task.end_date).toLocaleDateString()}`
                                : 'No dates set'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Panel - Timeline */}
          <div className="flex-1 overflow-x-auto" ref={ganttRef}>
            {/* Timeline Header */}
            <div className="h-16 border-b border-gray-200 bg-white flex items-center">
              {timeline.columns.map((date, index) => (
                <div
                  key={index}
                  className="border-r border-gray-200 text-center flex-shrink-0"
                  style={{ width: `${columnWidth}px` }}
                >
                  <div className="py-2 px-2">
                    <div className="text-xs font-medium text-gray-700">
                      {formatTimelineDate(date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Timeline Content */}
            <div className="relative" style={{ width: `${timeline.columns.length * columnWidth}px` }}>
              {/* Grid Lines */}
              {timeline.columns.map((_, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 border-r border-gray-100"
                  style={{ left: `${index * columnWidth}px` }}
                />
              ))}
              
              {/* Task Bars */}
              {currentBoard.groups?.map((group, groupIndex) => {
                let taskIndex = 0;
                return (
                  <div key={group.id}>
                    {/* Group Row */}
                    <div className="h-12 border-b border-gray-100 bg-gray-25 relative" />
                    
                    {/* Task Rows */}
                    {expandedGroups.includes(group.id) && group.tasks?.map((task) => {
                      const ganttTask: GanttTask = {
                        ...task,
                        startDate: task.start_date ? new Date(task.start_date) : new Date(),
                        endDate: task.end_date ? new Date(task.end_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        progress: task.progress || 0
                      };
                      
                      const style = getTaskBarStyle(ganttTask);
                      taskIndex++;
                      
                      return (
                        <div key={task.id} className="h-12 border-b border-gray-50 relative group">
                          {/* Task Bar */}
                          <div
                            className={cn(
                              "absolute top-2 h-8 rounded cursor-pointer transition-all duration-200",
                              getStatusColor(task.status || ''),
                              draggedTask === task.id ? 'opacity-50' : 'hover:opacity-80'
                            )}
                            style={style}
                            draggable
                            onDragStart={() => handleDragStart(task.id)}
                            onDragEnd={handleDragEnd}
                          >
                            {/* Progress Bar */}
                            <div 
                              className="h-full bg-white/30 rounded"
                              style={{ width: `${ganttTask.progress}%` }}
                            />
                            
                            {/* Task Title */}
                            <div className="absolute inset-0 flex items-center px-2">
                              <span className="text-xs font-medium text-white truncate">
                                {task.title}
                              </span>
                            </div>
                          </div>
                          
                          {/* Hover Tooltip */}
                          <div className="absolute top-12 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {task.title} ({ganttTask.progress}% complete)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GanttView; 