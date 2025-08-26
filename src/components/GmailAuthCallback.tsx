import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEmailMonitor } from '@/hooks/useEmailMonitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function GmailAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleAuthCallback } = useEmailMonitor()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Gmail auth error:', error)
      navigate('/')
      return
    }

    if (code) {
      handleAuthCallback(code).then(() => {
        navigate('/')
      })
    }
  }, [searchParams, handleAuthCallback, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Connecting Gmail</CardTitle>
          <CardDescription>
            Processing Gmail authorization...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 