import React from 'react';
import { MoreHorizontal, TrendingUp, DollarSign, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBoardContext } from '@/context/BoardContext';

const PurchaseDashboard = () => {
  const { currentBoard } = useBoardContext();

  if (!currentBoard) return null;

  const allTasks = (currentBoard.groups || []).flatMap(group => group.tasks || []);
  const totalValue = allTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);
  const completed = allTasks.filter(task => ['Completed', 'QC Passed', 'Shipped'].includes(task.status || '')).length;
  const completionRate = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="p-6 bg-background space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🛒 Purchase Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Procurement and spending analytics</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg">
          <MoreHorizontal className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-lift border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spending</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders Completed</p>
                <p className="text-3xl font-bold text-green-600">{completed}</p>
                <Progress value={completionRate} className="h-2 mt-2" />
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-orange-600">{allTasks.length}</p>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Purchase Orders by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentBoard.groups?.map((group, index) => {
              const groupTasks = group.tasks || [];
              const groupValue = groupTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);
              const percentage = totalValue > 0 ? Math.round((groupValue / totalValue) * 100) : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#666' }}></div>
                      {group.title}
                    </h4>
                    <Badge variant="outline">{formatCurrency(groupValue)}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{groupTasks.length} orders</span>
                    <span>{percentage}% of total</span>
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

export default PurchaseDashboard; 