import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { TimetableView } from "@/components/timetable/TimetableView";
import { Button } from "@/components/ui/button";
import { Calendar, Grid3X3, List, Bell } from "lucide-react";
import { format } from "date-fns";
import { AddEventModal } from "@/components/timetable/AddEventModal";
import { useToast } from "@/components/ui/use-toast";

export type ViewMode = 'daily' | 'weekly' | 'subject';

export interface TimeSlot {
  id: string;
  subject: string;
  time: string;
  location: string;
  color: string;
  isPinned?: boolean;
  type?: 'class' | 'study' | 'break' | 'deadline';
  startTime?: string;
  endTime?: string;
  priority?: string;
  description?: string;
  reminder?: boolean;
  reminderTime?: number;
}

export interface DaySchedule {
  date: Date;
  timeSlots: TimeSlot[];
}

export default function Timetable() {
  const { user, isLoading, addActivity } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; day: Date } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check for stored schedule and notification permission on mount
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    // Load saved schedule from localStorage
    const savedSchedule = localStorage.getItem(`timetable-${user?.email}`);
    if (savedSchedule) {
      const parsed = JSON.parse(savedSchedule);
      // Convert date strings back to Date objects
      const schedule = parsed.map((day: any) => ({
        ...day,
        date: new Date(day.date)
      }));
      setWeekSchedule(schedule);
    } else {
      // Initialize empty week schedule
      initializeWeekSchedule();
    }

    // Check notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, [user, isLoading]);

  const initializeWeekSchedule = () => {
    const today = new Date();
    const newSchedule = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      return {
        date,
        timeSlots: []
      };
    });
    setWeekSchedule(newSchedule);
    saveSchedule(newSchedule);
  };

  const saveSchedule = (schedule: DaySchedule[]) => {
    if (user) {
      localStorage.setItem(`timetable-${user.email}`, JSON.stringify(schedule));
    }
  };

  const handleAddEvent = (event: Partial<TimeSlot>) => {
    if (!selectedSlot || !event.subject) return;

    const newEvent: TimeSlot = {
      id: `event-${Date.now()}`,
      subject: event.subject,
      time: selectedSlot.time,
      startTime: selectedSlot.time,
      endTime: event.endTime || '',
      location: event.location || '',
      color: event.color || '#90CAF9',
      type: event.type || 'study',
      priority: event.priority,
      description: event.description,
      reminder: event.reminder,
      reminderTime: event.reminderTime,
    };

    // Update schedule
    const updatedSchedule = weekSchedule.map(day => {
      if (day.date.toDateString() === selectedSlot.day.toDateString()) {
        return {
          ...day,
          timeSlots: [...day.timeSlots, newEvent]
        };
      }
      return day;
    });

    setWeekSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
    setIsAddModalOpen(false);

    // Add to user's activity
    if (addActivity) {
      addActivity({
        type: 'timetable',
        title: `Added ${event.subject} to schedule`,
        description: `Scheduled for ${selectedSlot.time}`,
      });
    }

    // Schedule notification if enabled
    if (event.reminder) {
      scheduleNotification(newEvent);
    }

    toast({
      title: "Event Added",
      description: `${event.subject} has been added to your schedule`,
    });
  };

  const scheduleNotification = (event: TimeSlot) => {
    if (!event.reminder || !event.startTime || notificationPermission !== 'granted') {
      return;
    }

    const [hours, minutes] = event.startTime.split(':').map(Number);
    const eventTime = new Date(selectedSlot!.day);
    eventTime.setHours(hours, minutes, 0);
    
    const now = new Date();
    const timeUntilEvent = eventTime.getTime() - now.getTime();
    const reminderTime = timeUntilEvent - (event.reminderTime || 10) * 60 * 1000;

    if (reminderTime > 0) {
      setTimeout(() => {
        const notification = new Notification(`Upcoming: ${event.subject}`, {
          body: `Your ${event.type} session starts in ${event.reminderTime} minutes\n${event.location ? `Location: ${event.location}` : ''}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: event.id, // Prevent duplicate notifications
          requireInteraction: true // Keep notification until user interacts
        });

        notification.onclick = () => {
          window.focus();
          navigate('/timetable');
        };
      }, reminderTime);

      // Add a reminder to user's activity
      if (addActivity) {
        addActivity({
          type: 'timetable',
          title: `Reminder set for ${event.subject}`,
          description: `Will notify ${event.reminderTime} minutes before start`,
        });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleSlotClick = (time: string, day: Date) => {
    setSelectedSlot({ time, day });
    setIsAddModalOpen(true);
  };

  const pinnedTasks = weekSchedule
    .flatMap(day => day.timeSlots)
    .filter(slot => slot.isPinned);

  return (
    <AppLayout username={user.name.split(" ")[0]}>
      <div className="space-y-6" style={{ transform: `scale(${zoom})` }}>
        {/* View Toggle & Controls */}
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <Button
              variant={viewMode === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('daily')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Daily
            </Button>
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('weekly')}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Weekly
            </Button>
            <Button
              variant={viewMode === 'subject' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('subject')}
            >
              <List className="h-4 w-4 mr-2" />
              By Subject
            </Button>
          </div>

          <h2 className="text-xl font-semibold">
            {format(currentDate, viewMode === 'daily' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
          </h2>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
          >
            -
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
          >
            +
          </Button>
        </div>

        {/* Pinned Tasks */}
        {pinnedTasks.length > 0 && (
          <div className="bg-secondary/10 rounded-lg p-4">
            <h3 className="font-medium mb-3">📌 Pinned Tasks</h3>
            <div className="grid gap-2">
              {pinnedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center p-2 bg-background rounded border"
                >
                  <div
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: task.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{task.subject}</p>
                    <p className="text-sm text-muted-foreground">{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timetable Grid */}
        <TimetableView 
          weekSchedule={weekSchedule} 
          viewMode={viewMode}
          currentDate={currentDate}
          onSlotClick={handleSlotClick}
        />

        {/* Add Event Modal */}
        <AddEventModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddEvent}
          selectedTime={selectedSlot?.time}
          selectedDay={selectedSlot?.day}
        />

        {/* Task Sidebar */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-64 bg-background/80 backdrop-blur-sm rounded-lg p-4 border shadow-lg">
          <h3 className="font-medium mb-3">Pending Tasks</h3>
          <div className="space-y-2">
            {/* Add your draggable tasks here */}
          </div>
        </div>

        {notificationPermission !== 'granted' && (
          <div className="fixed bottom-4 right-4 p-4 bg-background/80 backdrop-blur-sm rounded-lg border shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-orange-400" />
              <p className="font-medium">Enable Notifications</p>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Get reminders for your upcoming study sessions
            </p>
            <Button
              size="sm"
              onClick={() => Notification.requestPermission().then(setNotificationPermission)}
            >
              Enable Now
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
