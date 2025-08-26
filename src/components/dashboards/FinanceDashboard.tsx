import React from 'react';
import { MoreHorizontal, DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBoardContext } from '@/context/BoardContext';

const FinanceDashboard = () => {
  const { currentBoard } = useBoardContext();
  if (!currentBoard) return null;

  const allTasks = (currentBoard.groups || []).flatMap(group => group.tasks || []);
  const income = allTasks.filter(task => (task.number_field || 0) > 0).reduce((sum, task) => sum + (task.number_field || 0), 0);
  const expenses = Math.abs(allTasks.filter(task => (task.number_field || 0) < 0).reduce((sum, task) => sum + (task.number_field || 0), 0));
  const netIncome = income - expenses;
  const reconciled = allTasks.filter(task => task.status === 'Reconciled').length;

  return (
    <div className="p-6 bg-background space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            💳 Finance Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Financial transactions and accounting analytics</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg">
          <MoreHorizontal className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-lift border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-3xl font-bold text-green-600">${income.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">${expenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Income</p>
                <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netIncome.toLocaleString()}
                </p>
              </div>
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reconciled</p>
                <p className="text-3xl font-bold text-purple-600">{reconciled}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Financial Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentBoard.groups?.map((group, index) => {
              const groupValue = (group.tasks || []).reduce((sum, task) => sum + (task.number_field || 0), 0);
              const percentage = Math.abs(groupValue) / (income + expenses) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#666' }}></div>
                      {group.title}
                    </h4>
                    <Badge variant="outline" className={groupValue >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(groupValue).toLocaleString()}
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{group.tasks?.length || 0} transactions</span>
                    <span>{percentage.toFixed(1)}% of total</span>
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

export default FinanceDashboard;
