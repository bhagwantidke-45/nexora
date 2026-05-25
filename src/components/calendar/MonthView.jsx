import { useMemo } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MonthView = ({ currentDate, events, onDayClick, onEventClick }) => {
  const today = new Date().toISOString().slice(0, 10);

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Prev month days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentDate]);

  const getDateStr = (date) => date.toISOString().slice(0, 10);

  const getEventsForDay = (date) => {
    const dateStr = getDateStr(date);
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div className="glass-card p-4 animate-fade-in">
      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, index) => {
          const dateStr = getDateStr(cell.date);
          const dayEvents = getEventsForDay(cell.date);
          const isToday = dateStr === today;
          const isCurrentMonth = cell.isCurrentMonth;

          return (
            <div
              key={index}
              onClick={() => onDayClick(dateStr)}
              className={`min-h-20 p-1.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                isCurrentMonth
                  ? "hover:bg-white/10"
                  : "opacity-30"
              } ${isToday ? "bg-primary-500/10 border border-primary-500/30" : ""}`}
            >
              {/* Day Number */}
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 transition-all ${
                isToday
                  ? "bg-primary-500 text-white"
                  : "text-gray-300 group-hover:bg-white/10"
              }`}>
                {cell.date.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    className="text-xs px-1.5 py-0.5 rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: event.color + "30",
                      color: event.color,
                      borderLeft: `2px solid ${event.color}`,
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;