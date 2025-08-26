import { useState } from 'react'
import { useEmailMonitor } from '@/hooks/useEmailMonitor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { TestTube, Send } from 'lucide-react'

export function EmailTestPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState({
    from: 'john.doe@example.com',
    subject: 'New Business Inquiry',
    body: 'Hello, I am interested in your services. Please contact me back.\n\nBest regards,\nJohn Doe\nCEO, Example Company'
  })
  const { gmailClient } = useEmailMonitor()
  const { toast } = useToast()

  const simulateEmailProcessing = async () => {
    setIsLoading(true)
    try {
      // Create a mock email data structure that matches the Gmail API format
      const mockEmailData = {
        messageId: `test_${Date.now()}`,
        from: testEmail.from,
        senderEmail: testEmail.from,
        senderName: testEmail.from.split('@')[0],
        companyName: testEmail.from.split('@')[1]?.split('.')[0].toUpperCase() || 'TEST_COMPANY',
        subject: testEmail.subject,
        date: new Date().toISOString(),
        body: testEmail.body,
        to: 'sales@yourcompany.com'
      }

      // Use the public test method
      const task = await gmailClient.createTaskFromEmailTest(mockEmailData)
      
      toast({
        title: "Test Email Processed",
        description: `Task created: ${task.title}`
      })
      
      // Reset form
      setTestEmail({
        from: '',
        subject: '',
        body: ''
      })
      
    } catch (error) {
      console.error('Test email processing failed:', error)
      toast({
        title: "Error",
        description: "Failed to process test email",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Email Processing Test
        </CardTitle>
        <CardDescription>
          Test the email-to-task conversion with sample data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-from">From Email</Label>
          <Input
            id="test-from"
            placeholder="john.doe@example.com"
            value={testEmail.from}
            onChange={(e) => setTestEmail(prev => ({ ...prev, from: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-subject">Subject</Label>
          <Input
            id="test-subject"
            placeholder="New Business Inquiry"
            value={testEmail.subject}
            onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-body">Email Body</Label>
          <Textarea
            id="test-body"
            placeholder="Email content..."
            rows={4}
            value={testEmail.body}
            onChange={(e) => setTestEmail(prev => ({ ...prev, body: e.target.value }))}
          />
        </div>
        
        <Button 
          onClick={simulateEmailProcessing} 
          disabled={isLoading || !testEmail.from || !testEmail.subject}
          className="w-full"
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Process Test Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 