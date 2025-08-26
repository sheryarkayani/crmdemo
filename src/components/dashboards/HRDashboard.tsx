import React from 'react';
import { MoreHorizontal, Users, UserCheck, UserMinus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBoardContext } from '@/context/BoardContext';

const HRDashboard = () => {
  const { currentBoard } = useBoardContext();
  if (!currentBoard) return null;

  const allTasks = (currentBoard.groups || []).flatMap(group => group.tasks || []);
  const activeEmployees = allTasks.filter(task => task.status === 'Active').length;
  const totalEmployees = allTasks.length;
  const averageSalary = allTasks.length > 0 ? allTasks.reduce((sum, task) => sum + (task.number_field || 0), 0) / allTasks.length : 0;

  return (
    <div className="p-6 bg-background space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            👥 HR Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Employee management and HR analytics</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                <p className="text-3xl font-bold text-green-600">{activeEmployees}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Salary</p>
                <p className="text-3xl font-bold text-purple-600">${averageSalary.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terminated</p>
                <p className="text-3xl font-bold text-red-600">
                  {allTasks.filter(task => task.status === 'Terminated').length}
                </p>
              </div>
              <UserMinus className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentBoard.groups?.map((group, index) => {
              const groupTasks = group.tasks || [];
              const active = groupTasks.filter(task => task.status === 'Active').length;
              const activeRate = groupTasks.length > 0 ? Math.round((active / groupTasks.length) * 100) : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#666' }}></div>
                      {group.title}
                    </h4>
                    <Badge variant="outline">{active}/{groupTasks.length} active</Badge>
                  </div>
                  <Progress value={activeRate} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{groupTasks.length} employees</span>
                    <span>{activeRate}% active</span>
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

export default HRDashboard;
