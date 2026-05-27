// Profile.jsx — 10-theme picker, dark/light independent, live preview
import { useState } from "react";
import {
  User, Mail, Lock, Trash2, Shield,
  Download, Moon, Sun, Bell, Save,
  CheckCircle, AlertTriangle, LogOut, Palette,
} from "lucide-react";
import { useAuth }  from "../../context/AuthContext";
import { useTheme, THEMES } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Navbar   from "../shared/Navbar";
import Modal    from "../shared/Modal";
import Alert    from "../shared/Alert";
import PageTransition from "../shared/PageTransition";
import {
  updateUserProfile,
  changeEmail,
  changePassword,
  deleteAccount,
} from "../../firebase/profile";
import {
  exportTasksCSV,
  exportHabitsCSV,
  exportRecordsCSV,
  exportEventsCSV,
} from "../../utils/exportUtils";
import useTasks   from "../../hooks/useTaska";
import useHabits  from "../../hooks/useHabits";
import useRecords from "../../hooks/useRecords";
import useEvents  from "../../hooks/useEvents";
import toast from "react-hot-toast";

/* ── Section wrapper ── */
const Section = ({ title, description, icon: Icon, children }) => (
  <div className="glass-card p-6 animate-fade-in hover-lift">
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(var(--glow),0.15)" }}
      >
        <Icon size={17} style={{ color: "var(--p400)" }} />
      </div>
      <div>
        <h3 className="font-display font-semibold text-white text-sm">{title}</h3>
        {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user, logout }              = useAuth();
  const { isDark, toggleMode, colorTheme, setColorTheme } = useTheme();
  const navigate                      = useNavigate();
  const { tasks }   = useTasks();
  const { habits }  = useHabits();
  const { records } = useRecords();
  const { events }  = useEvents();

  /* form states */
  const [displayName,   setDisplayName]   = useState(user?.displayName || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [emailForm,     setEmailForm]     = useState({ currentPassword: "", newEmail: "" });
  const [emailLoading,  setEmailLoading]  = useState(false);
  const [pwForm,        setPwForm]        = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwLoading,     setPwLoading]     = useState(false);
  const [showDelete,    setShowDelete]    = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Handlers ── */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) { toast.error("Name cannot be empty"); return; }
    setProfileLoading(true);
    try {
      await updateUserProfile(displayName.trim(), user.photoURL || "");
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile."); }
    finally  { setProfileLoading(false); }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      await changeEmail(emailForm.currentPassword, emailForm.newEmail);
      toast.success("Email updated! Please re-login.");
      await logout(); navigate("/login");
    } catch (err) {
      toast.error(err.code === "auth/wrong-password" ? "Wrong password." : "Failed to update email.");
    } finally { setEmailLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error("Passwords don't match!"); return; }
    if (pwForm.newPassword.length < 6) { toast.error("Min 6 characters."); return; }
    setPwLoading(true);
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success("Password updated!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.code === "auth/wrong-password" ? "Wrong current password." : "Failed to update password.");
    } finally { setPwLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      toast.success("Account deleted.");
      navigate("/login");
    } catch (err) {
      toast.error(err.code === "auth/wrong-password" ? "Wrong password." : "Failed to delete account.");
    } finally { setDeleteLoading(false); }
  };

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com";

  return (
    <PageTransition>
      <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} pb-24 lg:pb-10`}>
        <Navbar />
        <div className="pt-20 px-4 max-w-3xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <User size={24} style={{ color: "var(--p400)" }} />
              Profile & Settings
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your account, themes and preferences</p>
          </div>

          {/* ── Avatar card ── */}
          <div className="glass-card p-6 mb-6 flex items-center gap-5 animate-slide-up hover-lift">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center
                         text-white text-2xl font-display font-bold shadow-lg shrink-0"
              style={{
                background:  `linear-gradient(135deg, var(--grad1), var(--grad2))`,
                boxShadow:   `0 8px 24px rgba(var(--glow),0.35)`,
              }}
            >
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-display font-semibold text-lg truncate">
                {user?.displayName || "User"}
              </p>
              <p className="text-gray-400 text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    background: "rgba(var(--glow),0.12)",
                    color:      "var(--p400)",
                    border:     "1px solid rgba(var(--glow),0.25)",
                  }}
                >
                  {isGoogleUser ? "Google Account" : "Email Account"}
                </span>
                {user?.emailVerified && (
                  <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5
                                   rounded-full border border-green-500/20 flex items-center gap-1">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white font-bold font-display text-lg">
                {tasks.length + habits.length + records.length}
              </p>
              <p className="text-gray-500 text-xs">total items</p>
            </div>
          </div>

          <div className="space-y-6">

            {/* ══ THEME SECTION ══════════════════════════════════════════════ */}
            <Section title="Appearance & Themes" description="Choose your color theme and display mode" icon={Palette}>

              {/* Dark / Light toggle */}
              <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-white text-sm font-medium">
                    {isDark ? "Dark Mode" : "Light Mode"}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {isDark ? "Deep dark background with glass effects" : "Clean light background"}
                  </p>
                </div>
                <button
                  onClick={toggleMode}
                  className="relative w-14 h-7 rounded-full transition-all duration-300 hover:scale-105"
                  style={{
                    background: isDark ? `rgba(var(--glow),0.25)` : `rgba(var(--glow),0.15)`,
                    border:     `1px solid rgba(var(--glow),0.3)`,
                  }}
                >
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-yellow-300">
                    <Sun size={12} />
                  </span>
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--p300)" }}>
                    <Moon size={12} />
                  </span>
                  <span
                    className="absolute top-0.5 w-6 h-6 rounded-full shadow-md
                               flex items-center justify-center
                               transition-all duration-300"
                    style={{
                      transform:  isDark ? "translateX(28px)" : "translateX(2px)",
                      background: isDark
                        ? `linear-gradient(135deg, var(--grad1), var(--grad2))`
                        : "#ffffff",
                    }}
                  >
                    {isDark
                      ? <Moon size={12} className="text-white" />
                      : <Sun  size={12} className="text-yellow-500" />
                    }
                  </span>
                </button>
              </div>

              {/* Color theme picker */}
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
                Color Theme
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(THEMES).map(([key, theme]) => {
                  const isSelected = colorTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setColorTheme(key);
                        toast.success(`${theme.emoji} ${theme.name} applied!`);
                      }}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl
                                  transition-all duration-300 group hover:scale-105 active:scale-95 ${
                        isSelected ? "scale-105" : ""
                      }`}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${theme.vars["--grad1"]}22, ${theme.vars["--grad2"]}11)`
                          : "rgba(255,255,255,0.04)",
                        border: isSelected
                          ? `2px solid ${theme.vars["--p500"]}`
                          : "2px solid rgba(255,255,255,0.08)",
                        boxShadow: isSelected
                          ? `0 0 20px ${theme.vars["--p500"]}40`
                          : "none",
                      }}
                    >
                      {/* Color swatch preview */}
                      <div className="flex gap-1">
                        {[theme.vars["--p300"], theme.vars["--p500"], theme.vars["--p700"]].map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full transition-all duration-300
                                       group-hover:scale-110"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      {/* Emoji + name */}
                      <div className="text-center">
                        <span className="text-base leading-none">{theme.emoji}</span>
                        <p className="text-xs mt-1 leading-tight font-medium"
                          style={{ color: isSelected ? theme.vars["--p400"] : "#9ca3af" }}>
                          {theme.name.split(" ")[0]}
                        </p>
                      </div>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div
                          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full
                                     flex items-center justify-center animate-scale-in"
                          style={{ background: theme.vars["--p500"] }}
                        >
                          <CheckCircle size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Current theme preview bar */}
              <div className="mt-4 p-3 rounded-xl bg-white/5 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl shrink-0"
                  style={{ background: `linear-gradient(135deg, var(--grad1), var(--grad2))` }}
                />
                <div>
                  <p className="text-white text-xs font-medium">
                    {THEMES[colorTheme]?.emoji} {THEMES[colorTheme]?.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Active theme · {isDark ? "Dark" : "Light"} mode
                  </p>
                </div>
                <div className="ml-auto flex gap-1.5">
                  {["--p300","--p500","--p700"].map(v => (
                    <div
                      key={v}
                      className="w-5 h-5 rounded-full border-2 border-white/10"
                      style={{ backgroundColor: THEMES[colorTheme]?.vars[v] }}
                    />
                  ))}
                </div>
              </div>
            </Section>

            {/* ── Display Name ── */}
            <Section title="Display Name" description="How you appear in the app" icon={User}>
              <form onSubmit={handleProfileSave} className="flex gap-3">
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="input-glass flex-1"
                />
                <button type="submit" disabled={profileLoading} className="btn-primary px-5">
                  {profileLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Save size={15} /> Save</>
                  }
                </button>
              </form>
            </Section>

            {/* ── Export Data ── */}
            <Section title="Export Data" description="Download your data as CSV files" icon={Download}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Tasks",   count:tasks.length,   fn:()=>exportTasksCSV(tasks),     g:"from-purple-500 to-primary-600" },
                  { label:"Habits",  count:habits.length,  fn:()=>exportHabitsCSV(habits),   g:"from-orange-500 to-amber-600"   },
                  { label:"Records", count:records.length, fn:()=>exportRecordsCSV(records), g:"from-blue-500 to-cyan-600"      },
                  { label:"Events",  count:events.length,  fn:()=>exportEventsCSV(events),   g:"from-green-500 to-emerald-600"  },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.fn}
                    disabled={item.count === 0}
                    className="glass-card p-4 text-center hover:bg-white/10
                               transition-all disabled:opacity-40 disabled:cursor-not-allowed
                               group hover-lift"
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.g}
                                    flex items-center justify-center mx-auto mb-2
                                    group-hover:scale-110 transition-transform`}>
                      <Download size={14} className="text-white" />
                    </div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-gray-500 text-xs">{item.count} items</p>
                  </button>
                ))}
              </div>
            </Section>

            {/* ── Security (email/password users only) ── */}
            {!isGoogleUser && (
              <>
                <Section title="Change Email" description="Update your login email address" icon={Mail}>
                  <form onSubmit={handleEmailChange} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Current Password</label>
                      <input type="password" value={emailForm.currentPassword}
                        onChange={e => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                        placeholder="••••••••" className="input-glass" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">New Email</label>
                      <input type="email" value={emailForm.newEmail}
                        onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                        placeholder="new@email.com" className="input-glass" required />
                    </div>
                    <Alert variant="warning" message="You'll be logged out after changing your email." />
                    <button type="submit" disabled={emailLoading} className="btn-primary">
                      {emailLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Mail size={15} /> Update Email</>
                      }
                    </button>
                  </form>
                </Section>

                <Section title="Change Password" description="Use a strong, unique password" icon={Lock}>
                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Current Password</label>
                      <input type="password" value={pwForm.currentPassword}
                        onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                        placeholder="••••••••" className="input-glass" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">New Password</label>
                        <input type="password" value={pwForm.newPassword}
                          onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                          placeholder="Min 6 chars" className="input-glass" required />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Confirm</label>
                        <input type="password" value={pwForm.confirm}
                          onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                          placeholder="Repeat" className="input-glass" required />
                      </div>
                    </div>
                    <button type="submit" disabled={pwLoading} className="btn-primary">
                      {pwLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Lock size={15} /> Update Password</>
                      }
                    </button>
                  </form>
                </Section>
              </>
            )}

            {isGoogleUser && (
              <Section title="Security" description="Account secured via Google" icon={Shield}>
                <Alert variant="info" title="Google-managed account"
                  message="Your email and password are managed by Google." />
              </Section>
            )}

            {/* ── Danger Zone ── */}
            <Section title="Danger Zone" description="Irreversible actions — be careful!" icon={AlertTriangle}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl
                                bg-red-500/5 border border-red-500/20">
                  <div>
                    <p className="text-red-300 text-sm font-medium">Delete Account</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Permanently delete your account and all data.
                    </p>
                  </div>
                  <button onClick={() => setShowDelete(true)} className="btn-danger shrink-0">
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl
                                bg-white/5 border border-white/10">
                  <div>
                    <p className="text-white text-sm font-medium">Sign Out</p>
                    <p className="text-gray-500 text-xs mt-0.5">Log out from this device.</p>
                  </div>
                  <button
                    onClick={async () => { await logout(); navigate("/login"); }}
                    className="btn-secondary shrink-0"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            </Section>

          </div>
        </div>

        {/* ── Delete Confirm Modal ── */}
        <Modal isOpen={showDelete} onClose={() => setShowDelete(false)}
          title="Delete Account" size="sm">
          <div className="space-y-4">
            <Alert variant="error" title="This is permanent!"
              message="All your tasks, habits, records, and events will be deleted forever." />
            {!isGoogleUser && (
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Enter your password to confirm
                </label>
                <input type="password" value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="••••••••" className="input-glass" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)}
                className="btn-secondary flex-1 justify-center">Cancel</button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || (!isGoogleUser && !deletePassword)}
                className="btn-danger flex-1 justify-center"
              >
                {deleteLoading
                  ? <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin" />
                  : <><Trash2 size={15} /> Confirm Delete</>
                }
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default Profile;