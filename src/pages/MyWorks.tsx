import React, { useState, useEffect } from 'react';
import { Calendar, Table, CalendarDays, Clock, User, Tag, AlertCircle, CheckCircle, XCircle, Clock as ClockIcon, Search, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBoardContext } from '@/context/BoardContext';
import { TaskData } from '@/types/board';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { BoardProvider } from '@/context/BoardContext';
import CreateTaskDialog from '@/components/dialogs/CreateTaskDialog';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface UserTask extends TaskData {
  board_title?: string;
  group_title?: string;
  assignee_name?: string;
}

const MyWorksContent = () => {
  const { user } = useAuth();
  const { boards } = useBoardContext();
  const { toast } = useToast();
  
  console.log('MyWorksContent render - user:', user, 'boards:', boards);
  
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch user's tasks
  useEffect(() => {
    if (user) {
      fetchUserTasks();
    }
  }, [user]);

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      console.log('Fetching user tasks for user:', user?.id);
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // demo mode - use mock data
        console.log('Using demo mode - generating mock tasks');
        const mockTasks = generateMockUserTasks();
        console.log('Generated mock tasks:', mockTasks);
        setTasks(mockTasks);
        return;
      }

      // Fetch tasks where user is assignee
      const { data: assignedTasks, error: assignedError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', user!.id)
        .order('due_date', { ascending: true });

      if (assignedError) {
        console.error('Error fetching assigned tasks:', assignedError);
        toast({
          title: "Error",
          description: "Failed to fetch your tasks",
          variant: "destructive",
        });
      }

      // Try fetch tasks where user is the creator/owner (optional if column missing)
      let createdTasks: any[] = [];
      const { data: createdData, error: createdError } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user!.id)
        .order('due_date', { ascending: true });

      if (createdError) {
        // Likely column doesn't exist; continue with assigned only
        console.warn('created_by not available or query failed, continuing with assigned tasks only:', createdError);
      } else if (createdData) {
        createdTasks = createdData;
      }

      // Combine and deduplicate tasks
      const allTasks = [...(assignedTasks || []), ...createdTasks];
      const uniqueTasks = allTasks.filter((task, index, self) => 
        index === self.findIndex(t => t.id === task.id)
      );

      console.log('Fetched tasks from database:', { assignedTasks, createdTasks: createdTasks, uniqueTasks });

      // Map board and group titles from BoardContext to avoid joins
      const transformedTasks: UserTask[] = uniqueTasks.map(task => {
        const board = boards.find(b => b.id === task.board_id);
        const group = board?.groups?.find(g => g.id === task.group_id);
        return {
          ...task,
          board_title: board?.title,
          group_title: group?.title,
        } as UserTask;
      });

      console.log('Transformed tasks:', transformedTasks);
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockUserTasks = (): UserTask[] => {
    const mockTasks: UserTask[] = [
      {
        id: 'task-1',
        title: 'Design Product Catalog Page',
        description: 'Create responsive product catalog for Pakistani brands',
        status: 'In Progress',
        priority: 'High',
        assignee_id: user?.id || 'mock-user',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 2500,
        progress: 65,
        text_field: 'Working on mobile responsiveness and Urdu fonts',
        tags: 'design,mobile,responsive,urdu',
        board_id: 'mock-board-1',
        group_id: 'group-1',
        position: 0,
        number_field: 1,
        files: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        board_title: 'E-Commerce Platform',
        group_title: 'Frontend Development',
        assignee_name: user?.fullname || user?.username || 'You',
      },
      {
        id: 'task-2',
        title: 'Implement Urdu Language Support',
        description: 'Add RTL support and Urdu translations',
        status: 'Planning',
        priority: 'Medium',
        assignee_id: user?.id || 'mock-user',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 1800,
        progress: 15,
        text_field: 'Research RTL frameworks and Urdu font libraries',
        tags: 'development,i18n,rtl,urdu',
        board_id: 'mock-board-1',
        group_id: 'group-1',
        position: 1,
        number_field: 2,
        files: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        board_title: 'E-Commerce Platform',
        group_title: 'Frontend Development',
        assignee_name: user?.fullname || user?.username || 'You',
      },
      {
        id: 'task-3',
        title: 'Review Vendor Proposals',
        description: 'Evaluate vendor quotes for chemical supplies',
        status: 'Pending',
        priority: 'High',
        assignee_id: user?.id || 'mock-user',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 5000,
        progress: 0,
        text_field: 'Waiting for vendor responses',
        tags: 'purchase,vendor,chemicals',
        board_id: 'mock-board-2',
        group_id: 'group-2',
        position: 0,
        number_field: 1,
        files: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        board_title: 'Purchase Board',
        group_title: 'Vendor Management',
        assignee_name: user?.fullname || user?.username || 'You',
      },
    ];
    return mockTasks;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.board_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  console.log('Current state:', { 
    tasks: tasks.length, 
    filteredTasks: filteredTasks.length, 
    filterStatus, 
    filterPriority, 
    searchTerm 
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in progress':
      case 'working':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (dueDate: string | null | undefined) => {
    if (!dueDate) return { text: 'No due date', color: 'text-gray-500' };
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: 'text-yellow-600' };
    return { text: `Due in ${diffDays} days`, color: 'text-green-600' };
  };

  const CalendarView = () => {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Group tasks by due_date (date-only key)
    const tasksByDate = filteredTasks.reduce<Record<string, UserTask[]>>((acc, task) => {
      if (!task.due_date) return acc;
      const key = format(new Date(task.due_date), 'yyyy-MM-dd');
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});

    const renderHeader = () => (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            ‹
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            ›
          </Button>
          <h2 className="ml-2 text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        </div>
        <div className="hidden sm:flex gap-6 text-xs text-gray-500">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    );

    const renderCells = () => {
      const rows: JSX.Element[] = [];
      let day = startDate;

      while (day <= endDate) {
        const days: JSX.Element[] = [];

        for (let i = 0; i < 7; i++) {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dayKey] || [];

          days.push(
            <div key={day.toISOString()} className={
              `min-h-[140px] border rounded-md p-2 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} hover:shadow-sm transition-shadow`
            }>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </span>
                {isSameDay(day, new Date()) && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Today</span>
                )}
              </div>
              <div className="space-y-1">
                {dayTasks.length === 1 ? (
                  <>
                    <div className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-700">
                      {dayTasks[0].title}
                    </div>
                    {dayTasks[0].description && (
                      <div className="mt-1 text-[11px] text-gray-600 line-clamp-3">
                        {dayTasks[0].description}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {dayTasks.slice(0, 3).map((task) => (
                      <Tooltip key={task.id}>
                        <TooltipTrigger asChild>
                          <div className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-700 truncate cursor-default">
                            {task.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="text-xs font-medium">{task.title}</div>
                          {task.description && (
                            <div className="mt-1 text-[11px] text-gray-600">{task.description}</div>
                          )}
                          <div className="mt-1 text-[11px] text-gray-500">
                            {task.board_title} • {task.group_title}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {dayTasks.length > 3 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-[11px] text-gray-500 cursor-default">+{dayTasks.length - 3} more</div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="text-xs font-medium mb-1">More tasks</div>
                          <ul className="list-disc pl-4">
                            {dayTasks.slice(3).map((t) => (
                              <li key={t.id} className="text-[11px]">{t.title}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                )}
              </div>
            </div>
          );

          day = addDays(day, 1);
        }

        rows.push(
          <div key={day.toISOString()} className="grid grid-cols-7 gap-2 mb-2">
            {days}
          </div>
        );
      }

      return <div>{rows}</div>;
    };

    return (
      <div>
        {renderHeader()}
        <div className="hidden sm:grid grid-cols-7 gap-2 mb-2">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="text-xs font-medium text-gray-500 text-center">{d}</div>
          ))}
        </div>
        {renderCells()}
      </div>
    );
  };

  const TableView = () => (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Board
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className={getDaysUntilDue(task.due_date).color}>
                        {getDaysUntilDue(task.due_date).text}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">
                        {task.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {task.board_title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.group_title}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main content with tasks:', tasks.length, 'filtered:', filteredTasks.length);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Works</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your tasks, deadlines, and work progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CreateTaskDialog
              onTaskCreated={fetchUserTasks}
              trigger={
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Task
                </Button>
              }
            />
            <Button
              onClick={fetchUserTasks}
              variant="outline"
              size="sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status?.toLowerCase() === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status?.toLowerCase() === 'in progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => {
                    if (!t.due_date) return false;
                    return new Date(t.due_date) < new Date();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search tasks</Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'table')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="w-4 h-4" />
            Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>

        <TabsContent value="table">
          <TableView />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                ? 'Try adjusting your filters or search terms.'
                : 'You don\'t have any tasks assigned to you yet.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
              <CreateTaskDialog
                onTaskCreated={fetchUserTasks}
                trigger={
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first task
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MyWorks = () => {
  return (
    <BoardProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto">
            <MyWorksContent />
          </div>
        </div>
      </div>
    </BoardProvider>
  );
};

export default MyWorks;
