import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { getNotifications, markNotificationRead, NotificationItem } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifs = async () => {
    if (user?.id) {
      try {
        const data = await getNotifications(user.id);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    }
  };

  // Poll every 30 seconds for new updates
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRead = async (notif: NotificationItem) => {
    if (!notif.read) {
      await markNotificationRead(notif._id);
      // Update local state to show as read
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse border border-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b font-semibold bg-muted/20">Notifications</div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleRead(notif)}
                  className={`flex flex-col items-start gap-1 p-3 text-left hover:bg-muted/50 transition-colors border-b last:border-0 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex justify-between w-full">
                    <span className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {notif.message}
                    </span>
                    {!notif.read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}