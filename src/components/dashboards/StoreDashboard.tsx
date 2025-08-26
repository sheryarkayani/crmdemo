import React from 'react';
import { MoreHorizontal, Package, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBoardContext } from '@/context/BoardContext';

const StoreDashboard = () => {
  const { currentBoard } = useBoardContext();
  if (!currentBoard) return null;

  const allTasks = (currentBoard.groups || []).flatMap(group => group.tasks || []);
  const inStock = allTasks.filter(task => task.status === 'In Stock').length;
  const lowStock = allTasks.filter(task => task.status === 'Low Stock').length;
  const outOfStock = allTasks.filter(task => task.status === 'Out of Stock').length;
  const totalQuantity = allTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);

  return (
    <div className="p-6 bg-background space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            📦 Store Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Inventory management and warehouse analytics</p>
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
                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                <p className="text-3xl font-bold text-green-600">{inStock}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold text-orange-600">{lowStock}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{outOfStock}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold text-blue-600">{totalQuantity.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Warehouse Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentBoard.groups?.map((group, index) => {
              const groupTasks = group.tasks || [];
              const groupQuantity = groupTasks.reduce((sum, task) => sum + (task.number_field || 0), 0);
              const percentage = totalQuantity > 0 ? Math.round((groupQuantity / totalQuantity) * 100) : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#666' }}></div>
                      {group.title}
                    </h4>
                    <Badge variant="outline">{groupQuantity.toLocaleString()} items</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{groupTasks.length} products</span>
                    <span>{percentage}% of inventory</span>
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

export default StoreDashboard;
