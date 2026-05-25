import { useState, useEffect } from "react";
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";
import Modal from "../shared/Modal";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import { getEventsRealtime, addEvent, updateEvent, deleteEvent } from "../../firebase/calendar";
import toast from "react-hot-toast";

const VIEWS = ["month", "week", "day"];

const CalendarView = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    endTime: "",
    color: "#a855f7",
    category: "general",
    description: "",
    allDay: false,
  });

  useEffect(() => {
    if (!user) return;
    const unsub = getEventsRealtime(user.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (editEvent) {
      setForm({
        title: editEvent.title || "",
        date: editEvent.date || "",
        time: editEvent.time || "",
        endTime: editEvent.endTime || "",
        color: editEvent.color || "#a855f7",
        category: editEvent.category || "general",
        description: editEvent.description || "",
        allDay: editEvent.allDay || false,
      });
    } else {
      setForm({
        title: "",
        date: selectedDate || new Date().toISOString().slice(0, 10),
        time: "",
        endTime: "",
        color: "#a855f7",
        category: "general",
        description: "",
        allDay: false,
      });
    }
  }, [editEvent, selectedDate]);

  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const getTitle = () => {
    if (view === "month")
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (view === "week") {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setEditEvent(null);
    setShowForm(true);
  };

  const handleEventClick = (event) => {
    setEditEvent(event);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Event title required!"); return; }
    if (!form.date) { toast.error("Event date required!"); return; }
    try {
      if (editEvent) {
        await updateEvent(editEvent.id, form);
        toast.success("Event updated!");
      } else {
        await addEvent(user.uid, form);
        toast.success("Event created!");
      }
      setShowForm(false);
      setEditEvent(null);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(editEvent.id);
      toast.success("Event deleted!");
      setShowForm(false);
      setEditEvent(null);
    } catch {
      toast.error("Failed to delete event!");
    }
  };

  const colors = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"];

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
      <Navbar />
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <Calendar size={24} className="text-primary-400" />
              Calendar
            </h1>
            <p className="text-gray-400 text-sm mt-1">{events.length} events scheduled</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex gap-1 glass-card p-1">
              {VIEWS.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                    view === v
                      ? "bg-primary-600/50 text-primary-300 border border-primary-500/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button onClick={() => { setEditEvent(null); setSelectedDate(new Date().toISOString().slice(0, 10)); setShowForm(true); }} className="btn-primary">
              <Plus size={18} /> Add Event
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4 animate-slide-up">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="font-display font-semibold text-lg text-white">{getTitle()}</h2>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-xs text-primary-400 hover:text-primary-300 glass-card px-3 py-1"
            >
              Today
            </button>
          </div>
          <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Views */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {view === "month" && <MonthView currentDate={currentDate} events={events} onDayClick={handleDayClick} onEventClick={handleEventClick} />}
            {view === "week" && <WeekView currentDate={currentDate} events={events} onEventClick={handleEventClick} />}
            {view === "day" && <DayView currentDate={currentDate} events={events} onEventClick={handleEventClick} />}
          </>
        )}
      </div>

      {/* Event Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditEvent(null); }} title={editEvent ? "Edit Event" : "Add Event"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title..." className="input-glass" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-glass" required />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-glass">
                <option value="general">General</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="social">Social</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="allDay" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} className="rounded" />
            <label htmlFor="allDay" className="text-sm text-gray-400">All day event</label>
          </div>
          {!form.allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Start Time</label>
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input-glass" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">End Time</label>
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input-glass" />
              </div>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Event description..." rows={2} className="input-glass resize-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            {editEvent && (
              <button type="button" onClick={handleDelete} className="btn-danger flex-1 justify-center">Delete</button>
            )}
            <button type="button" onClick={() => { setShowForm(false); setEditEvent(null); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editEvent ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarView;