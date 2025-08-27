import React from 'react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { BoardProvider } from '@/context/BoardContext';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
};

const STORAGE_KEY = 'mockNotifications';

const seedIfEmpty = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seeded: NotificationItem[] = [
    { id: 'n-1', title: 'Proposal Sent', message: 'Proposal for Acme Corp has been emailed.', timestamp: new Date().toISOString(), read: false, type: 'success' },
    { id: 'n-2', title: 'Payment Due', message: 'Invoice INV-9001 is due in 3 days.', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), read: false, type: 'warning' },
    { id: 'n-3', title: 'New Lead', message: 'New lead from Globex added to pipeline.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: true, type: 'info' }
  ];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded)); } catch {}
  return seeded;
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMs = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return time.toLocaleDateString();
};

const NotificationsContent: React.FC = () => {
  const [items, setItems] = React.useState<NotificationItem[]>(seedIfEmpty());

  const unread = items.filter(i => !i.read).length;

  const persist = (next: NotificationItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const markAllRead = () => persist(items.map(i => ({ ...i, read: true })));
  const toggleRead = (id: string) => persist(items.map(i => i.id === id ? { ...i, read: true } : i));

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setItems(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Latest alerts and updates</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full ${unread > 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{unread} unread</span>
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border rounded-lg">No notifications</div>
        ) : (
          items.map((n) => (
            <div key={n.id} className={`p-4 rounded-xl border ${n.read ? 'bg-muted/20 border-transparent' : 'bg-white dark:bg-slate-900 border-border/20'} hover:bg-muted/40 transition-colors cursor-pointer`} onClick={() => toggleRead(n.id)}>
              <div className="flex items-start gap-4">
                <div className={`w-1.5 h-8 rounded ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{n.title}</h3>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{formatTimeAgo(n.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{n.message}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${n.read ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{n.read ? 'Read' : 'Unread'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Notifications: React.FC = () => {
  return (
    <BoardProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 dark:from-slate-900 dark:via-red-950/30 dark:to-orange-950/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto">
            <NotificationsContent />
          </div>
        </div>
      </div>
    </BoardProvider>
  );
};

export default Notifications;

