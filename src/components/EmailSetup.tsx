import { useState } from 'react'
import { useEmailMonitor } from '@/hooks/useEmailMonitor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, CheckCircle, Play, Square, Zap } from 'lucide-react'

export function EmailSetup() {
  const { isMonitoring, isLoading, startMonitoring, stopMonitoring } = useEmailMonitor()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Automated Email Processing
        </CardTitle>
        <CardDescription>
          Automatically create tasks from incoming emails without manual intervention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            {isMonitoring ? (
              <>
                <Zap className="h-3 w-3 mr-1" />
                Auto-Processing Active
              </>
            ) : (
              'Stopped'
            )}
          </Badge>
        </div>

        {isMonitoring && (
          <div className="text-sm text-muted-foreground bg-green-50 p-3 rounded border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Automation Active</span>
            </div>
            <p className="mt-1 text-green-600">
              System automatically checks for new emails every 30 seconds and creates tasks without your intervention.
            </p>
          </div>
        )}

        {!isMonitoring && (
          <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded border border-gray-200">
            <p>
              Click "Start Automation" to begin automatically processing incoming emails into tasks.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!isMonitoring ? (
            <Button 
              onClick={startMonitoring} 
              disabled={isLoading}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Connecting...' : 'Start Automation'}
            </Button>
          ) : (
            <Button 
              onClick={stopMonitoring} 
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Automation
            </Button>
          )}
        </div>

        {isMonitoring && (
          <div className="text-xs text-muted-foreground">
            <p>• New emails are automatically converted to tasks</p>
            <p>• Tasks are created in the "Sales Prospects" group</p>
            <p>• Duplicate emails are automatically filtered out</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 