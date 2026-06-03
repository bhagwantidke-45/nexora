import { useState, useEffect } from "react";
import {
  Plus, Search, BookOpen, Star,
  FileText, Calendar, User, Link,
  Phone, Mail, MapPin, ExternalLink, Edit2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../shared/Navbar";
import Modal from "../shared/Modal";
import NoteCard from "./NoteCard";
import ContactCard from "./ContactCard";
import DateCard from "./DateCard";
import FileCard from "./FileCard";
import {
  getRecordsRealtime,
  addRecord,
  updateRecord,
  deleteRecord,
  togglePin,
} from "../../firebase/records";
import toast from "react-hot-toast";

const TYPES = [
  { id: "all",     label: "All",      icon: BookOpen  },
  { id: "note",    label: "Notes",    icon: FileText  },
  { id: "date",    label: "Dates",    icon: Calendar  },
  { id: "contact", label: "Contacts", icon: User      },
  { id: "file",    label: "Files",    icon: Link      },
];

const Records = () => {
  const { user }   = useAuth();
  const { isDark } = useTheme();

  const [records,    setRecords]    = useState([]);
  const [search,     setSearch]     = useState("");
  const [activeType, setActiveType] = useState("all");
  const [showForm,   setShowForm]   = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [form, setForm] = useState({
    type: "note", title: "", content: "", date: "",
    phone: "", email: "", address: "", url: "", fileDesc: "", pinned: false,
  });

  useEffect(() => {
    if (!user) return;
    const unsub = getRecordsRealtime(user.uid, (data) => {
      setRecords(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (editRecord) {
      setForm({
        type:     editRecord.type     || "note",
        title:    editRecord.title    || "",
        content:  editRecord.content  || "",
        date:     editRecord.date     || "",
        phone:    editRecord.phone    || "",
        email:    editRecord.email    || "",
        address:  editRecord.address  || "",
        url:      editRecord.url      || "",
        fileDesc: editRecord.fileDesc || "",
        pinned:   editRecord.pinned   || false,
      });
    } else {
      setForm({
        type: "note", title: "", content: "", date: "",
        phone: "", email: "", address: "", url: "", fileDesc: "", pinned: false,
      });
    }
  }, [editRecord]);

  const filtered = records
    .filter((r) => activeType === "all" || r.type === activeType)
    .filter((r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.content?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required!"); return; }
    try {
      if (editRecord) {
        await updateRecord(editRecord.id, form);
        toast.success("Record updated!");
      } else {
        await addRecord(user.uid, form);
        toast.success("Record added!");
      }
      setShowForm(false);
      setEditRecord(null);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecord(id);
      toast.success("Record deleted!");
      if (viewRecord?.id === id) setViewRecord(null);
    } catch {
      toast.error("Failed to delete!");
    }
  };

  const handlePin = async (id, pinned) => {
    try { await togglePin(id, pinned); }
    catch { toast.error("Failed to pin!"); }
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setShowForm(true);
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}`}>
      <Navbar />
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <BookOpen size={24} className="text-primary-400" />
              Records
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {records.length} records · {records.filter(r => r.pinned).length} pinned
            </p>
          </div>
          <button onClick={() => { setEditRecord(null); setShowForm(true); }} className="btn-primary">
            <Plus size={18} /> Add Record
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4 animate-slide-up">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass pl-10"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-slide-up">
          {TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeType === type.id
                    ? "bg-primary-600/30 text-primary-300 border border-primary-500/30"
                    : "glass-card text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={14} />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Records Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <BookOpen size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No records found!</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto mt-4">
              <Plus size={16} /> Add Record
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filtered.map((record) => {
              if (record.type === "note")
                return <NoteCard    key={record.id} record={record} onView={setViewRecord} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} />;
              if (record.type === "contact")
                return <ContactCard key={record.id} record={record} onView={setViewRecord} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} />;
              if (record.type === "date")
                return <DateCard    key={record.id} record={record} onView={setViewRecord} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} />;
              if (record.type === "file")
                return <FileCard    key={record.id} record={record} onView={setViewRecord} onEdit={handleEdit} onDelete={handleDelete} onPin={handlePin} />;
              return null;
            })}
          </div>
        )}
      </div>

      {/* ── View Record Modal ── */}
      <Modal
        isOpen={!!viewRecord}
        onClose={() => setViewRecord(null)}
        title={viewRecord?.title || ""}
        size="md"
      >
        {viewRecord && (
          <div className="space-y-4">

            {/* NOTE */}
            {viewRecord.type === "note" && (
              <div className="glass-card p-4 rounded-xl bg-white/5">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                  {viewRecord.content || "No content."}
                </p>
              </div>
            )}

            {/* CONTACT */}
            {viewRecord.type === "contact" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-blue-400 font-bold text-xl">
                      {viewRecord.title?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{viewRecord.title}</p>
                    <p className="text-gray-500 text-xs">Contact</p>
                  </div>
                </div>
                {viewRecord.phone && (
                  <a href={`tel:${viewRecord.phone}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <Phone size={16} className="text-green-400 shrink-0" />
                    <span className="text-gray-300 text-sm">{viewRecord.phone}</span>
                  </a>
                )}
                {viewRecord.email && (
                  <a href={`mailto:${viewRecord.email}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <Mail size={16} className="text-blue-400 shrink-0" />
                    <span className="text-gray-300 text-sm">{viewRecord.email}</span>
                  </a>
                )}
                {viewRecord.address && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <MapPin size={16} className="text-red-400 shrink-0" />
                    <span className="text-gray-300 text-sm">{viewRecord.address}</span>
                  </div>
                )}
                {viewRecord.content && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-gray-400 text-sm leading-relaxed">{viewRecord.content}</p>
                  </div>
                )}
              </div>
            )}

            {/* DATE */}
            {viewRecord.type === "date" && (
              <div className="space-y-3">
                {viewRecord.date && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Calendar size={20} className="text-orange-400 shrink-0" />
                    <p className="text-orange-300 font-medium">
                      {new Date(viewRecord.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {viewRecord.content && (
                  <div className="glass-card p-4 rounded-xl bg-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {viewRecord.content}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* FILE / LINK */}
            {viewRecord.type === "file" && (
              <div className="space-y-3">
                {viewRecord.url && (
                  <a
                    href={viewRecord.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                  >
                    <ExternalLink size={16} className="text-cyan-400 shrink-0" />
                    <span className="text-cyan-300 text-sm break-all">{viewRecord.url}</span>
                  </a>
                )}
                {viewRecord.fileDesc && (
                  <div className="glass-card p-4 rounded-xl bg-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {viewRecord.fileDesc}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Created at */}
            {viewRecord.createdAt?.toDate && (
              <p className="text-gray-600 text-xs">
                Created {viewRecord.createdAt.toDate().toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => { handleEdit(viewRecord); setViewRecord(null); }}
                className="btn-secondary text-sm"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                onClick={() => setViewRecord(null)}
                className="btn-primary text-sm ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add / Edit Record Modal ── */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditRecord(null); }}
        title={editRecord ? "Edit Record" : "Add Record"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.filter(t => t.id !== "all").map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setForm({ ...form, type: type.id })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all ${
                      form.type === type.id
                        ? "bg-primary-600/30 text-primary-300 border border-primary-500/30"
                        : "glass-card text-gray-400 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Record title..."
              className="input-glass"
              required
            />
          </div>

          {/* Note Fields */}
          {form.type === "note" && (
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your note..."
                rows={4}
                className="input-glass resize-none"
              />
            </div>
          )}

          {/* Date Fields */}
          {form.type === "date" && (
            <>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-glass" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Notes</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Additional notes..." rows={2} className="input-glass resize-none" />
              </div>
            </>
          )}

          {/* Contact Fields */}
          {form.type === "contact" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" className="input-glass" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="input-glass" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address..." className="input-glass" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Notes</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Additional notes..." rows={2} className="input-glass resize-none" />
              </div>
            </>
          )}

          {/* File Fields */}
          {form.type === "file" && (
            <>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">URL / Link</label>
                <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="input-glass" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
                <textarea value={form.fileDesc} onChange={(e) => setForm({ ...form, fileDesc: e.target.value })} placeholder="File description..." rows={3} className="input-glass resize-none" />
              </div>
            </>
          )}

          {/* Pin */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="pinned" className="text-sm text-gray-400 flex items-center gap-1">
              <Star size={12} className="text-yellow-400" /> Pin to dashboard
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditRecord(null); }}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editRecord ? "Update" : "Add Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Records;