import React from 'react';
import { MoreHorizontal, TrendingUp, Users, Calendar, CheckCircle, Clock, AlertCircle, BarChart, DollarSign, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, FunnelChart, Funnel, LabelList } from 'recharts';
import { useBoardContext } from '@/context/BoardContext';
import { useUserContext } from '@/context/UserContext';

// Board-specific dashboard components
import SalesDashboard from '@/components/dashboards/SalesDashboard';
import PurchaseDashboard from '@/components/dashboards/PurchaseDashboard';
import HRDashboard from '@/components/dashboards/HRDashboard';
import LeadsDashboard from '@/components/dashboards/LeadsDashboard';
import AccountsDashboard from '@/components/dashboards/AccountsDashboard';
import FinanceDashboard from '@/components/dashboards/FinanceDashboard';
import OpsDashboard from '@/components/dashboards/OpsDashboard';
import StoreDashboard from '@/components/dashboards/StoreDashboard';
import ContactsDashboard from '@/components/dashboards/ContactsDashboard';

const DashboardView = () => {
  const { currentBoard } = useBoardContext();
  const { getUserDisplayName } = useUserContext();

  if (!currentBoard) return null;

  // Route to specific dashboard based on board title
  const boardTitle = currentBoard.title.toLowerCase();
  
  if (boardTitle.includes('sales') && boardTitle.includes('tracker')) {
    return <SalesDashboard />;
  }
  
  if (boardTitle.includes('purchase') && boardTitle.includes('tracker')) {
    return <PurchaseDashboard />;
  }
  
  if (boardTitle === 'hr') {
    return <HRDashboard />;
  }
  
  if (boardTitle === 'leads') {
    return <LeadsDashboard />;
  }
  
  if (boardTitle === 'accounts') {
    return <AccountsDashboard />;
  }
  
  if (boardTitle === 'finance') {
    return <FinanceDashboard />;
  }
  
  if (boardTitle === 'ops') {
    return <OpsDashboard />;
  }
  
  if (boardTitle === 'store') {
    return <StoreDashboard />;
  }

  if (boardTitle.includes('contacts') || boardTitle.includes('contact')) {
    return <ContactsDashboard />;
  }

  // Fallback to general dashboard for unrecognized board types
  return <GeneralDashboard />;
};

// General Dashboard Component (existing logic)
const GeneralDashboard = () => {
  const { currentBoard } = useBoardContext();
  const { getUserDisplayName } = useUserContext();

  if (!currentBoard) return null;

  // Check if this is a sales board
  const isSalesBoard = currentBoard.title.toLowerCase().includes('sales') || 
                      currentBoard.title.toLowerCase().includes('tracker') ||
                      currentBoard.title.toLowerCase().includes('pipeline');

  // Check if this is a purchase board
  const isPurchaseBoard = currentBoard.title.toLowerCase().includes('purchase') ||
                         currentBoard.title.toLowerCase().includes('procurement') ||
                         currentBoard.title.toLowerCase().includes('po ');

  // Check if this is an HR board
  const isHRBoard = currentBoard.title.toLowerCase().includes('hr') ||
                   currentBoard.title.toLowerCase().includes('employee') ||
                   currentBoard.title.toLowerCase().includes('directory');

  // Check if this is a Leads board  
  const isLeadsBoard = currentBoard.title.toLowerCase().includes('leads') ||
                      currentBoard.title.toLowerCase().includes('lead') ||
                      currentBoard.title.toLowerCase().includes('contacts');

  // Check if this is an Accounts board
  const isAccountsBoard = currentBoard.title.toLowerCase().includes('accounts') ||
                         currentBoard.title.toLowerCase().includes('companies') ||
                         currentBoard.title.toLowerCase().includes('clients');

  // Calculate comprehensive dashboard data
  const allTasks = (currentBoard.groups || []).flatMap(group => group.tasks || []);
  const totalTasks = allTasks.length;

  // Sales-specific calculations
  const totalRevenue = allTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);
  const wonRevenue = allTasks
    .filter(task => task.status === 'Won' || task.status === 'Invoice Paid')
    .reduce((sum, task) => sum + (task.number_field || 0), 0);
  const activeDealsRevenue = allTasks
    .filter(task => !['Won', 'Invoice Paid', 'Lost'].includes(task.status || ''))
    .reduce((sum, task) => sum + (task.number_field || 0), 0);
  const conversionRate = totalTasks > 0 ? Math.round((allTasks.filter(task => task.status === 'Won' || task.status === 'Invoice Paid').length / totalTasks) * 100) : 0;

  // Purchase-specific calculations
  const totalPurchaseValue = allTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);
  const completedPurchases = allTasks
    .filter(task => ['Completed', 'QC Passed', 'Shipped'].includes(task.status || ''))
    .reduce((sum, task) => sum + (task.number_field || 0), 0);
  const pendingPurchases = allTasks
    .filter(task => !['Completed', 'QC Passed', 'Shipped'].includes(task.status || ''))
    .reduce((sum, task) => sum + (task.number_field || 0), 0);
  const completionRatePurchase = totalTasks > 0 ? Math.round((allTasks.filter(task => ['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')).length / totalTasks) * 100) : 0;

  // Sales funnel data
  const salesFunnelData = [
    { name: 'New Leads', value: allTasks.filter(task => task.status === 'New').length, fill: '#3B82F6' },
    { name: 'Qualified', value: allTasks.filter(task => ['Immediate Action', 'Assigned'].includes(task.status || '')).length, fill: '#F59E0B' },
    { name: 'Proposal', value: allTasks.filter(task => ['Approval', 'RFQ', 'Proposal'].includes(task.status || '')).length, fill: '#8B5CF6' },
    { name: 'Negotiation', value: allTasks.filter(task => task.status === 'Negotiation').length, fill: '#EC4899' },
    { name: 'Closed Won', value: allTasks.filter(task => ['Won', 'Invoice Paid'].includes(task.status || '')).length, fill: '#10B981' }
  ];

  // Purchase funnel data
  const purchaseFunnelData = [
    { name: 'New Requests', value: allTasks.filter(task => task.status === 'New request').length, fill: '#8B5CF6' },
    { name: 'PO Issued', value: allTasks.filter(task => task.status === 'PO Sent to Vendor').length, fill: '#3B82F6' },
    { name: 'Payment Processing', value: allTasks.filter(task => ['Pending Accounts', 'Paid'].includes(task.status || '')).length, fill: '#F59E0B' },
    { name: 'In Transit', value: allTasks.filter(task => ['In Transit', 'Partially received'].includes(task.status || '')).length, fill: '#EAB308' },
    { name: 'Completed', value: allTasks.filter(task => ['Received', 'QC Passed', 'Shipped', 'Completed'].includes(task.status || '')).length, fill: '#10B981' }
  ];

  // Revenue by status for sales
  const revenueByStatusData = allTasks.reduce((acc, task) => {
    const status = task.status || 'No Status';
    if (!acc[status]) {
      acc[status] = { name: status, value: 0, count: 0 };
    }
    acc[status].value += task.number_field || 0;
    acc[status].count += 1;
    return acc;
  }, {} as Record<string, { name: string, value: number, count: number }>);

  const revenueChartData = Object.values(revenueByStatusData).map(item => ({
    ...item,
    formattedValue: `$${(item.value / 1000).toFixed(0)}K`
  }));

  // Status analysis
  const statusData = allTasks.reduce((acc, task) => {
    const status = task.status || 'No Status';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([name, value]) => {
    const statusOption = currentBoard.status_options?.find(opt => opt.label === name);
    return {
      name,
      value,
      color: statusOption?.color || '#c4c4c4',
      percentage: Math.round((value / totalTasks) * 100)
    };
  });

  // Priority analysis
  const priorityData = allTasks.reduce((acc, task) => {
    const priority = task.priority || 'No Priority';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityChartData = Object.entries(priorityData).map(([name, value]) => {
    const priorityOption = currentBoard.priority_options?.find(opt => opt.label === name);
    return {
      name,
      value,
      color: priorityOption?.color || '#c4c4c4'
    };
  });

  // Team workload analysis
  const assigneeData = allTasks.reduce((acc, task) => {
    const assignee = task.assignee_id || 'Unassigned';
    acc[assignee] = (acc[assignee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const teamWorkloadData = Object.entries(assigneeData)
    .map(([id, value]) => ({
      name: id === 'Unassigned' ? 'Unassigned' : getUserDisplayName(id),
      value,
      id
    }))
    .sort((a, b) => b.value - a.value);

  // Group performance
  const groupData = (currentBoard.groups || []).map(group => ({
    name: group.title,
    total: group.tasks?.length || 0,
    completed: isPurchaseBoard 
      ? group.tasks?.filter(task => ['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')).length || 0
      : isSalesBoard 
        ? group.tasks?.filter(task => task.status === 'Won' || task.status === 'Invoice Paid').length || 0
        : isHRBoard
          ? group.tasks?.filter(task => task.status === 'Active').length || 0
        : isLeadsBoard
          ? group.tasks?.filter(task => task.status === 'Converted').length || 0
        : isAccountsBoard
          ? group.tasks?.filter(task => ['Active Client', 'Partner'].includes(task.status || '')).length || 0
        : group.tasks?.filter(task => task.status === 'Done').length || 0,
    inProgress: isPurchaseBoard
      ? group.tasks?.filter(task => !['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')).length || 0
      : isSalesBoard
        ? group.tasks?.filter(task => !['Won', 'Invoice Paid', 'Lost'].includes(task.status || '')).length || 0
        : isHRBoard
          ? group.tasks?.filter(task => ['Remote', 'On Leave', 'Probation'].includes(task.status || '')).length || 0
        : isLeadsBoard
          ? group.tasks?.filter(task => !['Converted', 'Lost'].includes(task.status || '')).length || 0
        : isAccountsBoard
          ? group.tasks?.filter(task => ['Prospect', 'Vendor'].includes(task.status || '')).length || 0
        : group.tasks?.filter(task => task.status === 'In Progress').length || 0,
    lost: isSalesBoard 
      ? group.tasks?.filter(task => task.status === 'Lost').length || 0
      : isLeadsBoard
        ? group.tasks?.filter(task => task.status === 'Lost').length || 0
      : isHRBoard
        ? group.tasks?.filter(task => task.status === 'Terminated').length || 0
      : isAccountsBoard
        ? group.tasks?.filter(task => task.status === 'Inactive').length || 0
      : 0
  }));

  // Due date analysis
  const now = new Date();
  const overdueTasks = allTasks.filter(task => 
    task.due_date && new Date(task.due_date) < now && 
    (isPurchaseBoard 
      ? !['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')
      : isSalesBoard 
        ? !['Won', 'Invoice Paid', 'Lost'].includes(task.status || '')
        : isHRBoard
          ? !['Terminated'].includes(task.status || '')
        : isLeadsBoard
          ? !['Converted', 'Lost'].includes(task.status || '')
        : isAccountsBoard
          ? !['Inactive'].includes(task.status || '')
        : task.status !== 'Done')
  ).length;

  const dueSoonTasks = allTasks.filter(task => {
    if (!task.due_date) return false;
    if (isPurchaseBoard && ['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')) return false;
    if (isSalesBoard && ['Won', 'Invoice Paid', 'Lost'].includes(task.status || '')) return false;
    if (isHRBoard && ['Terminated'].includes(task.status || '')) return false;
    if (isLeadsBoard && ['Converted', 'Lost'].includes(task.status || '')) return false;
    if (isAccountsBoard && ['Inactive'].includes(task.status || '')) return false;
    if (!isPurchaseBoard && !isSalesBoard && !isHRBoard && !isLeadsBoard && !isAccountsBoard && task.status === 'Done') return false;
    
    const dueDate = new Date(task.due_date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  const completedTasks = isPurchaseBoard
    ? allTasks.filter(task => ['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')).length
    : isSalesBoard
      ? allTasks.filter(task => task.status === 'Won' || task.status === 'Invoice Paid').length
      : isHRBoard
        ? allTasks.filter(task => task.status === 'Active').length
      : isLeadsBoard
        ? allTasks.filter(task => task.status === 'Converted').length
      : isAccountsBoard
        ? allTasks.filter(task => ['Active Client', 'Partner'].includes(task.status || '')).length
      : allTasks.filter(task => task.status === 'Done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="p-6 bg-background space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isSalesBoard ? 'Sales Dashboard' : 
             isPurchaseBoard ? 'Purchase Dashboard' : 
             isHRBoard ? 'HR Dashboard' :
             isLeadsBoard ? 'Leads Dashboard' :
             isAccountsBoard ? 'Accounts Dashboard' :
             'Project Dashboard'}
          </h2>
          <p className="text-muted-foreground mt-1">
            Overview of {currentBoard.title} {
              isSalesBoard ? 'performance and revenue metrics' : 
              isPurchaseBoard ? 'procurement and spending metrics' : 
              isHRBoard ? 'employee and HR metrics' :
              isLeadsBoard ? 'lead generation and conversion metrics' :
              isAccountsBoard ? 'account management and client metrics' :
              'performance and metrics'
            }
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg">
          <MoreHorizontal className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isSalesBoard ? (
          <>
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pipeline</p>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue Won</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(wonRevenue)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={Math.round((wonRevenue / totalRevenue) * 100)} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">{Math.round((wonRevenue / totalRevenue) * 100)}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Pipeline</p>
                    <p className="text-3xl font-bold text-orange-600">{formatCurrency(activeDealsRevenue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{allTasks.filter(task => !['Won', 'Invoice Paid', 'Lost'].includes(task.status || '')).length} deals</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                    <p className="text-3xl font-bold text-purple-600">{conversionRate}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{completedTasks} won deals</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : isPurchaseBoard ? (
          <>
            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Purchase Value</p>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(totalPurchaseValue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Orders</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(completedPurchases)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={Math.round((completedPurchases / totalPurchaseValue) * 100)} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">{Math.round((completedPurchases / totalPurchaseValue) * 100)}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                    <p className="text-3xl font-bold text-orange-600">{formatCurrency(pendingPurchases)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{allTasks.filter(task => !['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')).length} orders</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-3xl font-bold text-purple-600">{completionRatePurchase}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{allTasks.filter(task => ['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')).length} completed</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold text-foreground">{totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BarChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={completionRate} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground">{completionRate}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                <p className="text-3xl font-bold text-orange-600">{dueSoonTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isSalesBoard ? (
          <>
            {/* Sales Funnel */}
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Sales Funnel</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesFunnelData.map((stage, index) => {
                    const percentage = totalTasks > 0 ? Math.round((stage.value / totalTasks) * 100) : 0;
                    const width = Math.max(percentage, 10); // Minimum width for visibility
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{stage.name}</span>
                          <span className="text-muted-foreground">{stage.value} deals ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                          <div 
                            className="h-full rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                            style={{ 
                              width: `${width}%`, 
                              backgroundColor: stage.fill,
                              minWidth: stage.value > 0 ? '60px' : '0px'
                            }}
                          >
                            {stage.value > 0 && stage.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Status */}
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Revenue by Status</CardTitle>
                <Button variant="ghost" size="sm">
                  <DollarSign className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={revenueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={12}
                      />
                      <YAxis 
                        fontSize={12}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number, name) => [formatCurrency(value), 'Revenue']}
                        labelFormatter={(label) => `Status: ${label}`}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        ) : isPurchaseBoard ? (
          <>
            {/* Purchase Pipeline */}
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Purchase Pipeline</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchaseFunnelData.map((stage, index) => {
                    const percentage = totalTasks > 0 ? Math.round((stage.value / totalTasks) * 100) : 0;
                    const width = Math.max(percentage, 10); // Minimum width for visibility
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{stage.name}</span>
                          <span className="text-muted-foreground">{stage.value} orders ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                          <div 
                            className="h-full rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                            style={{ 
                              width: `${width}%`, 
                              backgroundColor: stage.fill,
                              minWidth: stage.value > 0 ? '60px' : '0px'
                            }}
                          >
                            {stage.value > 0 && stage.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Spending by Status */}
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Spending by Status</CardTitle>
                <Button variant="ghost" size="sm">
                  <DollarSign className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={revenueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={12}
                      />
                      <YAxis 
                        fontSize={12}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number, name) => [formatCurrency(value), 'Spending']}
                        labelFormatter={(label) => `Status: ${label}`}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
        {/* Task Status Distribution */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Task Status Distribution</CardTitle>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry: any) => (
                      <span style={{ color: entry.color, fontSize: '12px' }}>
                        {value} ({entry.payload.value})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Workload */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Team Workload</CardTitle>
            <Button variant="ghost" size="sm">
              <Users className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={teamWorkloadData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Group Performance and Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group Performance */}
        <Card className="lg:col-span-2 hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {isSalesBoard ? 'Pipeline Performance' : 
               isPurchaseBoard ? 'Purchase Order Performance' : 
               isHRBoard ? 'Department Performance' :
               isLeadsBoard ? 'Lead Pipeline Performance' :
               isAccountsBoard ? 'Account Performance' :
               'Group Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupData.map((group, index) => {
                const completionRate = group.total > 0 ? Math.round((group.completed / group.total) * 100) : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{group.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {group.completed}/{group.total} {
                          isSalesBoard ? 'won' : 
                          isPurchaseBoard ? 'completed' : 
                          isHRBoard ? 'active' :
                          isLeadsBoard ? 'converted' :
                          isAccountsBoard ? 'active' :
                          'completed'
                        }
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{
                          isSalesBoard ? 'Win Rate' : 
                          isPurchaseBoard ? 'Completion Rate' : 
                          isHRBoard ? 'Active Rate' :
                          isLeadsBoard ? 'Conversion Rate' :
                          isAccountsBoard ? 'Active Rate' :
                          'Progress'
                        }: {completionRate}%</span>
                        <span>{group.total} total {
                          isSalesBoard ? 'deals' : 
                          isPurchaseBoard ? 'orders' : 
                          isHRBoard ? 'employees' :
                          isLeadsBoard ? 'leads' :
                          isAccountsBoard ? 'accounts' :
                          'tasks'
                        }</span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600">✓ {group.completed} {
                          isSalesBoard ? 'Won' : 
                          isPurchaseBoard ? 'Completed' : 
                          isHRBoard ? 'Active' :
                          isLeadsBoard ? 'Converted' :
                          isAccountsBoard ? 'Active' :
                          'Done'
                        }</span>
                        <span className="text-blue-600">◐ {group.inProgress} {
                          isSalesBoard ? 'Active' : 
                          isPurchaseBoard ? 'In Progress' : 
                          isHRBoard ? 'Other Status' :
                          isLeadsBoard ? 'In Progress' :
                          isAccountsBoard ? 'Prospects' :
                          'In Progress'
                        }</span>
                        {(isSalesBoard || isLeadsBoard || isHRBoard || isAccountsBoard) && (
                          <span className="text-red-600">✗ {group.lost} {
                            isSalesBoard ? 'Lost' :
                            isLeadsBoard ? 'Lost' :
                            isHRBoard ? 'Terminated' :
                            isAccountsBoard ? 'Inactive' :
                            'Lost'
                          }</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityChartData.map((priority, index) => {
                const percentage = Math.round((priority.value / totalTasks) * 100);
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: priority.color }}
                      ></div>
                      <span className="font-medium text-sm">{priority.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{priority.value}</div>
                      <div className="text-xs text-muted-foreground">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;