const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WeekView = ({ currentDate, events, onEventClick }) => {
  const today = new Date().toISOString().slice(0, 10);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  const getDateStr = (date) => date.toISOString().slice(0, 10);

  const getEventsForDay = (date) => {
    const dateStr = getDateStr(date);
    return events.filter((e) => e.date === dateStr);
  };

  const getEventTop = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return (h * 60 + m) * (64 / 60);
  };

  const getEventHeight = (time, endTime) => {
    if (!time || !endTime) return 64;
    const [sh, sm] = time.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(diff * (64 / 60), 30);
  };

  return (
    <div className="glass-card p-4 animate-fade-in overflow-auto">
      {/* Header */}
      <div className="grid grid-cols-8 mb-2 sticky top-0 z-10">
        <div className="text-xs text-gray-500 py-2 text-center">Time</div>
        {weekDays.map((day, i) => {
          const dateStr = getDateStr(day);
          const isToday = dateStr === today;
          return (
            <div key={i} className="text-center py-2">
              <p className="text-xs text-gray-500">{DAYS[i]}</p>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto text-sm font-medium mt-1 ${
                isToday ? "bg-primary-500 text-white" : "text-gray-300"
              }`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-8 relative">
        {/* Time Labels */}
        <div>
          {HOURS.map((hour) => (
            <div key={hour} className="h-16 border-t border-white/5 flex items-start pt-1 pr-2">
              <span className="text-xs text-gray-600 text-right w-full">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {weekDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDay(day);
          const dateStr = getDateStr(day);
          const isToday = dateStr === today;

          return (
            <div
              key={dayIndex}
              className={`relative border-l border-white/5 ${isToday ? "bg-primary-500/5" : ""}`}
            >
              {/* Hour Rows */}
              {HOURS.map((hour) => (
                <div key={hour} className="h-16 border-t border-white/5" />
              ))}

              {/* Events */}
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                  style={{
                    top: event.allDay ? 4 : getEventTop(event.time),
                    height: event.allDay ? 28 : getEventHeight(event.time, event.endTime),
                    backgroundColor: event.color + "30",
                    borderLeft: `3px solid ${event.color}`,
                  }}
                >
                  <p className="text-xs font-medium truncate" style={{ color: event.color }}>
                    {event.title}
                  </p>
                  {event.time && (
                    <p className="text-xs opacity-70" style={{ color: event.color }}>
                      {event.time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;