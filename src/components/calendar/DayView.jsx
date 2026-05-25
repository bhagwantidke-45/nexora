const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DayView = ({ currentDate, events, onEventClick }) => {
  const today = new Date().toISOString().slice(0, 10);
  const dateStr = currentDate.toISOString().slice(0, 10);
  const isToday = dateStr === today;

  const dayEvents = events.filter((e) => e.date === dateStr);

  const getEventTop = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return (h * 60 + m) * (80 / 60);
  };

  const getEventHeight = (time, endTime) => {
    if (!time || !endTime) return 80;
    const [sh, sm] = time.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    return Math.max(diff * (80 / 60), 40);
  };

  const currentHour = new Date().getHours();
  const currentMin = new Date().getMinutes();
  const currentTop = (currentHour * 60 + currentMin) * (80 / 60);

  return (
    <div className="glass-card p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center ${
          isToday ? "bg-primary-500" : "bg-white/10"
        }`}>
          <span className="text-xs text-white/70">
            {currentDate.toLocaleDateString("en-US", { weekday: "short" })}
          </span>
          <span className="text-lg font-bold text-white">
            {currentDate.getDate()}
          </span>
        </div>
        <div>
          <p className="text-white font-display font-semibold">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <p className="text-gray-400 text-sm">
            {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
      </div>

      {/* All Day Events */}
      {dayEvents.filter((e) => e.allDay).length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">All Day</p>
          <div className="space-y-1">
            {dayEvents.filter((e) => e.allDay).map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="px-3 py-2 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: event.color + "20",
                  borderLeft: `3px solid ${event.color}`,
                }}
              >
                <p className="text-sm font-medium" style={{ color: event.color }}>
                  {event.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Grid */}
      <div className="relative overflow-auto max-h-[600px] custom-scrollbar">
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="flex gap-3 h-20">
              {/* Time Label */}
              <div className="w-16 shrink-0 text-right pt-1">
                <span className="text-xs text-gray-600">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>
              {/* Hour Row */}
              <div className="flex-1 border-t border-white/5 relative" />
            </div>
          ))}

          {/* Current Time Line */}
          {isToday && (
            <div
              className="absolute left-20 right-0 flex items-center gap-2 z-10 pointer-events-none"
              style={{ top: currentTop }}
            >
              <div className="w-3 h-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50" />
              <div className="flex-1 h-0.5 bg-primary-500/70" />
            </div>
          )}

          {/* Timed Events */}
          {dayEvents
            .filter((e) => !e.allDay && e.time)
            .map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="absolute left-20 right-2 rounded-xl px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  top: getEventTop(event.time),
                  height: getEventHeight(event.time, event.endTime),
                  backgroundColor: event.color + "25",
                  borderLeft: `4px solid ${event.color}`,
                }}
              >
                <p className="text-sm font-medium" style={{ color: event.color }}>
                  {event.title}
                </p>
                {event.time && (
                  <p className="text-xs opacity-70" style={{ color: event.color }}>
                    {event.time}{event.endTime ? ` - ${event.endTime}` : ""}
                  </p>
                )}
                {event.description && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{event.description}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DayView;