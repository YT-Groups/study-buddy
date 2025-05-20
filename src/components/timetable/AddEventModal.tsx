import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TimeSlot } from "@/pages/Timetable";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: Partial<TimeSlot>) => void;
  selectedTime?: string;
  selectedDay?: Date;
}

export function AddEventModal({ isOpen, onClose, onAdd, selectedTime, selectedDay }: AddEventModalProps) {
  const [event, setEvent] = useState<Partial<TimeSlot>>({
    subject: '',
    location: '',
    description: '',
    type: 'study',
    priority: 'medium',
    reminder: true,
    reminderTime: 10,
    color: '#90CAF9',
    isPinned: false
  });

  const subjectColors = {
    Mathematics: '#F9A58B',
    Physics: '#90CAF9',
    Chemistry: '#A5D6A7',
    Biology: '#FFB74D',
    History: '#BA68C8',
    Languages: '#4FC3F7',
    Other: '#E0E0E0'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(event);
    setEvent({
      subject: '',
      location: '',
      description: '',
      type: 'study',
      priority: 'medium',
      reminder: true,
      reminderTime: 10,
      color: '#90CAF9',
      isPinned: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Study Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={event.subject}
              onValueChange={(value) => setEvent(prev => ({
                ...prev,
                subject: value,
                color: subjectColors[value as keyof typeof subjectColors] || subjectColors.Other
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(subjectColors).map(subject => (
                  <SelectItem key={subject} value={subject}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: subjectColors[subject as keyof typeof subjectColors] }}
                      />
                      {subject}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={event.type}
              onValueChange={(value) => setEvent(prev => ({ ...prev, type: value as TimeSlot['type'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              value={event.location}
              onChange={(e) => setEvent(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Room number or location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={event.description}
              onChange={(e) => setEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any notes"
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(priority => (
                <Button
                  key={priority}
                  type="button"
                  variant={event.priority === priority ? 'default' : 'outline'}
                  onClick={() => setEvent(prev => ({ ...prev, priority }))}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={event.isPinned}
              onCheckedChange={(checked) => setEvent(prev => ({ ...prev, isPinned: checked }))}
            />
            <Label>Pin to top</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={event.reminder}
              onCheckedChange={(checked) => setEvent(prev => ({ ...prev, reminder: checked }))}
            />
            <Label>Set reminder</Label>
            {event.reminder && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="5"
                  max="60"
                  value={event.reminderTime}
                  onChange={(e) => setEvent(prev => ({ ...prev, reminderTime: Number(e.target.value) }))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">mins before</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}