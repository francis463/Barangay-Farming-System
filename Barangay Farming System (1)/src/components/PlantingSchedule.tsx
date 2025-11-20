import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { useState } from "react";

export interface ScheduleEvent {
  id: string;
  date: string;
  title: string;
  type: "planting" | "harvest" | "maintenance" | "event";
  description: string;
}

interface PlantingScheduleProps {
  events: ScheduleEvent[];
}

export function PlantingSchedule({ events }: PlantingScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get events for selected date
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const eventsForDate = events.filter(event => event.date === selectedDateStr);

  // Get dates that have events
  const eventDates = events.map(event => new Date(event.date));

  const getBadgeColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "planting":
        return "bg-green-500 hover:bg-green-600";
      case "harvest":
        return "bg-orange-500 hover:bg-orange-600";
      case "maintenance":
        return "bg-blue-500 hover:bg-blue-600";
      case "event":
        return "bg-purple-500 hover:bg-purple-600";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Planting Calendar</CardTitle>
          <CardDescription>View scheduled activities and events</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvent: eventDates
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/10 font-bold"
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? `Events for ${selectedDate.toLocaleDateString()}` : "Select a Date"}
          </CardTitle>
          <CardDescription>Scheduled activities for this day</CardDescription>
        </CardHeader>
        <CardContent>
          {eventsForDate.length > 0 ? (
            <div className="space-y-4">
              {eventsForDate.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4>{event.title}</h4>
                    <Badge className={getBadgeColor(event.type)} variant="default">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No events scheduled for this day</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
