import { EmailSetup } from "@/components/EmailSetup";
import { TaskList } from "@/components/TaskList";
import { EmailTestPanel } from "@/components/EmailTestPanel";
import { EmailProcessor } from "@/components/EmailProcessor";

export default function EmailIntegration() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient-apple">Email Integration</h1>
        <p className="text-xl text-muted-foreground">
          Automatically create tasks from incoming emails
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <EmailSetup />
          <EmailProcessor />
          <EmailTestPanel />
        </div>
        
        <div className="lg:col-span-2">
          <TaskList />
        </div>
      </div>
    </div>
  );
} 