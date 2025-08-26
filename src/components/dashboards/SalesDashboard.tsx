import React from 'react';
import { MoreHorizontal, TrendingUp, DollarSign, Target, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useBoardContext } from '@/context/BoardContext';

const SalesDashboard = () => {
  const { currentBoard } = useBoardContext();

  if (!currentBoard) return null;

  // Calculate sales-specific metrics
  const allTasks = (currentBoard.groups || []).flatMap(group => group.tasks || []);
  const totalTasks = allTasks.length;
  
  const totalRevenue = allTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);
  const wonRevenue = allTasks
    .filter(task => task.status === 'Won' || task.status === 'Invoice Paid')
    .reduce((sum, task) => sum + (task.number_field || 0), 0);
  const activeDeals = allTasks.filter(task => !['Won', 'Invoice Paid', 'Lost'].includes(task.status || '')).length;
  const conversionRate = totalTasks > 0 ? Math.round((allTasks.filter(task => task.status === 'Won' || task.status === 'Invoice Paid').length / totalTasks) * 100) : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Sales funnel data
  const salesFunnelData = [
    { name: 'New Leads', value: allTasks.filter(task => task.status === 'New').length, fill: '#3B82F6' },
    { name: 'Qualified', value: allTasks.filter(task => ['Immediate Action', 'Assigned'].includes(task.status || '')).length, fill: '#F59E0B' },
    { name: 'Proposal', value: allTasks.filter(task => ['Approval', 'RFQ', 'Proposal'].includes(task.status || '')).length, fill: '#8B5CF6' },
    { name: 'Negotiation', value: allTasks.filter(task => task.status === 'Negotiation').length, fill: '#EC4899' },
    { name: 'Closed Won', value: allTasks.filter(task => ['Won', 'Invoice Paid'].includes(task.status || '')).length, fill: '#10B981' }
  ];

  // Revenue by status
  const revenueByStatus = allTasks.reduce((acc, task) => {
    const status = task.status || 'No Status';
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status] += task.number_field || 0;
    return acc;
  }, {} as Record<string, number>);

  const revenueChartData = Object.entries(revenueByStatus).map(([name, value]) => ({
    name,
    value,
    formattedValue: formatCurrency(value)
  }));

  return (
    <div className="p-6 bg-background space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gradient-apple flex items-center gap-3">
            <span className="text-4xl animate-gentle-float">💰</span>
            Sales Dashboard
          </h2>
          <p className="text-muted-foreground mt-2 text-base font-medium">
            Sales pipeline performance and revenue analytics
          </p>
        </div>
        <Button variant="outline" size="sm" className="apple-card border-border/20 hover:border-border/40 backdrop-blur-sm interactive-apple">
          <MoreHorizontal className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="apple-card jobs-hover border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/3 rounded-2xl"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Pipeline</p>
                <p className="text-3xl font-semibold text-foreground">{formatCurrency(totalRevenue)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-8 h-1 bg-gradient-apple-blue rounded-full"></div>
                  <span className="text-xs text-muted-foreground font-medium">Active deals</span>
                </div>
              </div>
              <div className="w-14 h-14 gradient-apple-blue rounded-2xl flex items-center justify-center shadow-apple neon-apple-blue">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card jobs-hover border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/3 rounded-2xl"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Revenue Won</p>
                <p className="text-3xl font-semibold text-green-600">{formatCurrency(wonRevenue)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Progress value={Math.round((wonRevenue / totalRevenue) * 100)} className="flex-1 h-2" />
                  <span className="text-sm font-semibold text-green-600">{Math.round((wonRevenue / totalRevenue) * 100)}%</span>
                </div>
              </div>
              <div className="w-14 h-14 gradient-apple-green rounded-2xl flex items-center justify-center shadow-apple neon-apple-green ml-3">
                <Award className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card jobs-hover border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/3 rounded-2xl"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Deals</p>
                <p className="text-3xl font-semibold text-orange-600">{activeDeals}</p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">In progress</p>
              </div>
              <div className="w-14 h-14 gradient-apple-orange rounded-2xl flex items-center justify-center shadow-apple">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card jobs-hover border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/3 rounded-2xl"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Win Rate</p>
                <p className="text-3xl font-semibold text-purple-600">{conversionRate}%</p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">Conversion rate</p>
              </div>
              <div className="w-14 h-14 gradient-apple-purple rounded-2xl flex items-center justify-center shadow-apple neon-apple-purple">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Sales Funnel</CardTitle>
            <Badge variant="outline">{totalTasks} total deals</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesFunnelData.map((stage, index) => {
                const percentage = totalTasks > 0 ? Math.round((stage.value / totalTasks) * 100) : 0;
                const width = Math.max(percentage, 10);
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
            <DollarSign className="w-4 h-4 text-muted-foreground" />
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
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Status: ${label}`}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Performance */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pipeline Performance by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentBoard.groups?.map((group, index) => {
              const groupTasks = group.tasks || [];
              const won = groupTasks.filter(task => task.status === 'Won' || task.status === 'Invoice Paid').length;
              const total = groupTasks.length;
              const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
              const revenue = groupTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.color || '#666' }}
                      ></div>
                      {group.title}
                    </h4>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(revenue)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {won}/{total} won
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Win Rate: {winRate}%</span>
                      <span>{total} total deals</span>
                    </div>
                    <Progress value={winRate} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDashboard; 