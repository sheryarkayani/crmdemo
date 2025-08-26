import React from 'react';
import { MoreHorizontal, Target, TrendingUp, Users, CheckCircle, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBoardContext } from '@/context/BoardContext';
import EditableTitle from '@/components/ui/editable-title';

const LeadsDashboard = () => {
  const { currentBoard, updateTask } = useBoardContext();
  if (!currentBoard) return null;

  const allTasks = (currentBoard.groups || []).flatMap(group => group.tasks || []);
  const converted = allTasks.filter(task => task.status === 'Converted').length;
  const conversionRate = allTasks.length > 0 ? Math.round((converted / allTasks.length) * 100) : 0;
  const totalValue = allTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);

  const handleTitleUpdate = async (taskId: string, newTitle: string) => {
    await updateTask(taskId, { title: newTitle });
  };

  return (
    <div className="p-6 bg-background space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🎯 Leads Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Lead generation and conversion analytics</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold text-blue-600">{allTasks.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Converted</p>
                <p className="text-3xl font-bold text-green-600">{converted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                <p className="text-3xl font-bold text-orange-600">${totalValue.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Lead Pipeline Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentBoard.groups?.map((group, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#666' }}></div>
                    {group.title}
                  </h4>
                  <Badge variant="outline">{group.tasks?.length || 0} leads</Badge>
                </div>
                <Progress value={Math.round(((group.tasks?.length || 0) / allTasks.length) * 100)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Leads List with Editable Titles */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allTasks.slice(0, 10).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <EditableTitle
                      title={task.title}
                      onSave={async (newTitle) => handleTitleUpdate(task.id, newTitle)}
                      variant="default"
                      size="sm"
                      className="text-gray-900 dark:text-gray-100"
                    />
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {task.sender_company && (
                        <span>{task.sender_company}</span>
                      )}
                      {task.sender_email && (
                        <span>{task.sender_email}</span>
                      )}
                      {task.status && (
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.priority && (
                    <Badge 
                      variant="outline" 
                      className={task.priority === 'High' ? 'border-red-200 text-red-700' : 
                                task.priority === 'Medium' ? 'border-yellow-200 text-yellow-700' : 
                                'border-green-200 text-green-700'}
                    >
                      {task.priority}
                    </Badge>
                  )}
                  {task.due_date && (
                    <span className="text-xs text-gray-500">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {allTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No leads found</p>
                <p className="text-sm">Create your first lead to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsDashboard;
