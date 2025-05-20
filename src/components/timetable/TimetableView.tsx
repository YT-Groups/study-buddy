import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { format, isSameDay } from "date-fns";
import { DaySchedule } from "@/pages/Timetable";

// Types
export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'subject';

export type EventPriority = 'low' | 'medium' | 'high';
export type EventStatus = 'pending' | 'completed' | 'missed';

export interface TimeSlot {
  id: string;
  subject: string;
  time: string;
  location: string;
  duration: number; 
  color: string;
  type?: 'class' | 'study' | 'break' | 'deadline';
  priority?: EventPriority;
  status?: EventStatus;
  description?: string;
  reminder?: boolean;
  reminderTime?: number; // minutes before event
  isPinned?: boolean;
  startTime: string;
  endTime: string;
}

export interface DragItem {
  type: string;
  id: string;
  subject: string;
  duration: number;
  color: string;
}

// Helper function to get day name
const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export interface TimetableViewProps {
  weekSchedule: DaySchedule[];
  viewMode: ViewMode;
  currentDate: Date;
  onSlotClick: (time: string, day: Date) => void;
}

export function TimetableView({ weekSchedule, viewMode, currentDate, onSlotClick }: TimetableViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const hourSlots = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 10 PM

  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };
  
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  if (viewMode === 'daily') {
    const daySchedule = weekSchedule.find(day => 
      isSameDay(day.date, currentDate)
    ) || { date: currentDate, timeSlots: [] };

    return (
      <div className="space-y-4">
        {hourSlots.map((hour) => (
          <div key={hour} className="grid grid-cols-12 gap-4">
            <div className="col-span-2 text-sm text-muted-foreground">
              {format(new Date().setHours(hour), 'ha')}
            </div>
            <div className="col-span-10 min-h-[60px] border-l pl-4">
              {daySchedule.timeSlots
                .filter(slot => {
                  const [startHour] = slot.time.split(' - ')[0].split(':');
                  return parseInt(startHour) === hour;
                })
                .map(slot => (
                  <div
                    key={slot.id}
                    className="p-2 rounded"
                    style={{ backgroundColor: `${slot.color}30` }}
                  >
                    <p className="font-medium">{slot.subject}</p>
                    <p className="text-sm">{slot.location}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === 'subject') {
    const subjects = [...new Set(weekSchedule.flatMap(day => 
      day.timeSlots.map(slot => slot.subject)
    ))];

    return (
      <div className="grid gap-6">
        {subjects.map((subject) => (
          <div key={subject} className="space-y-2">
            <h3 className="font-medium">{subject}</h3>
            <div className="grid gap-2">
              {weekSchedule
                .flatMap(day => day.timeSlots)
                .filter(slot => slot.subject === subject)
                .map(slot => (
                  <div
                    key={slot.id}
                    className="flex items-center p-3 rounded"
                    style={{ backgroundColor: `${slot.color}30` }}
                  >
                    <div className="flex-1">
                      <p>{format(currentDate, 'EEEE')}</p>
                      <p className="text-sm text-muted-foreground">{slot.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{slot.location}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Weekly view (default)
  return (
    <div className="overflow-x-auto">
      {/* Time column headers */}
      <div className="grid grid-cols-8 gap-4 mb-4 sticky top-0 bg-background z-10">
        <div className="w-20">Time</div> {/* Fixed width for time column */}
        {weekSchedule.map((day) => (
          <div key={day.date.toISOString()} className="text-center">
            <p className="font-medium">{format(day.date, 'EEE')}</p>
            <p className="text-sm text-muted-foreground">{format(day.date, 'MMM d')}</p>
          </div>
        ))}
      </div>

      {/* Time slots grid */}
      <div className="relative">
        {hourSlots.map((hour) => (
          <div key={hour} className="grid grid-cols-8 gap-4 min-h-[100px]">
            {/* Time column */}
            <div className="w-20 text-sm text-muted-foreground py-2">
              {format(new Date().setHours(hour), 'ha')}
            </div>

            {/* Days columns */}
            {weekSchedule.map((day) => (
              <div 
                key={`${day.date.toISOString()}-${hour}`}
                className="relative border-l border-t border-border first:border-l-0"
              >
                {day.timeSlots
                  .filter(slot => {
                    const [slotHour] = slot.startTime.split(':').map(Number);
                    return slotHour === hour;
                  })
                  .map(slot => (
                    <div
                      key={slot.id}
                      className="absolute left-0 right-0 m-1 p-2 rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-primary/20 transition-all"
                      style={{
                        backgroundColor: `${slot.color}20`,
                        borderLeft: `3px solid ${slot.color}`,
                        minHeight: '60px'
                      }}
                      onClick={() => onSlotClick(slot.time, day.date)}
                    >
                      <p className="font-medium text-sm truncate">{slot.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{slot.time}</p>
                      <p className="text-xs text-muted-foreground truncate">{slot.location}</p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
