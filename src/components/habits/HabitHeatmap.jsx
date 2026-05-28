import { useMemo } from "react";

/**
 * HabitHeatmap — GitHub-style contribution heatmap for a single habit.
 * Shows the last 16 weeks (112 days) of completion data.
 *
 * Props:
 *   completedDates: string[]  — array of "YYYY-MM-DD" strings
 *   color: string             — hex color for the habit
 *   title?: string            — optional label
 */
const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const HabitHeatmap = ({ completedDates = [], color = "#a855f7", title }) => {
  const { grid, monthLabels, totalDone, currentStreak, longestStreak } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build 16 weeks × 7 days grid (most recent day = bottom-right)
    const totalDays = 16 * 7;
    const doneSet   = new Set(completedDates);
    const cells     = [];
    const months    = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const done = doneSet.has(iso);

      // Track month label positions (show when we hit the 1st)
      if (d.getDate() === 1) {
        months.push({ label: MONTHS[d.getMonth()], col: Math.floor((totalDays - 1 - i) / 7) });
      }

      cells.push({ iso, done, day: d.getDay(), future: d > today });
    }

    // Build week columns
    const weeks = [];
    for (let w = 0; w < 16; w++) {
      weeks.push(cells.slice(w * 7, w * 7 + 7));
    }

    // Stats
    const totalDone = doneSet.size;

    // Current streak
    let streak = 0;
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (doneSet.has(d.toISOString().slice(0, 10))) streak++;
      else break;
    }

    // Longest streak
    const sorted = [...completedDates].sort();
    let longest = 0, cur = 0, prev = null;
    for (const iso of sorted) {
      if (prev) {
        const diff = (new Date(iso) - new Date(prev)) / 86400000;
        if (diff === 1) { cur++; longest = Math.max(longest, cur); }
        else cur = 1;
      } else {
        cur = 1;
      }
      prev = iso;
    }
    longest = Math.max(longest, cur);

    return { grid: weeks, monthLabels: months, totalDone, currentStreak: streak, longestStreak: longest };
  }, [completedDates]);

  const cellSize = 12;
  const gap      = 3;
  const unit     = cellSize + gap;

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
        {title && <span className="font-medium text-white">{title}</span>}
        <span>🔥 {currentStreak} day streak</span>
        <span>⭐ {longestStreak} best streak</span>
        <span>✅ {totalDone} total</span>
      </div>

      {/* Month labels */}
      <div className="relative overflow-x-auto custom-scrollbar pb-1">
        <div style={{ width: 16 * unit + 20 }}>
          {/* Month row */}
          <div className="flex mb-1 pl-5">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-500 absolute"
                style={{ left: m.col * unit + 20 }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0" style={{ marginTop: 14 }}>
            {/* Day-of-week labels */}
            <div className="flex flex-col mr-1" style={{ gap }}>
              {WEEK_DAYS.map((d, i) => (
                <div
                  key={i}
                  className="text-[9px] text-gray-600 flex items-center justify-center"
                  style={{ width: 10, height: cellSize }}
                >
                  {i % 2 === 1 ? d : ""}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex" style={{ gap }}>
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap }}>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      title={`${cell.iso}${cell.done ? " ✓" : ""}`}
                      className="rounded-sm transition-all duration-200 hover:scale-125 cursor-default"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: cell.future
                          ? "transparent"
                          : cell.done
                          ? color
                          : "rgba(255,255,255,0.06)",
                        opacity: cell.future ? 0 : 1,
                        border: cell.done ? `1px solid ${color}40` : "1px solid rgba(255,255,255,0.04)",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span className="text-[10px] text-gray-600">Less</span>
            {[0.1, 0.3, 0.5, 0.75, 1].map((opacity, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: i === 0 ? "rgba(255,255,255,0.06)" : color,
                  opacity: i === 0 ? 1 : opacity,
                }}
              />
            ))}
            <span className="text-[10px] text-gray-600">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitHeatmap;