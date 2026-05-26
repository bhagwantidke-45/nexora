// App.jsx — Page transitions, 404 route, MobileNav globally injected
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth }  from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

// Auth
import Login          from "./components/auth/Login";
import Register       from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";

// App pages
import Dashboard   from "./components/dashboard/Dashboard";
import TaskManager from "./components/tasks/TaskManager";
import CalendarView from "./components/calendar/CalendarView";
import Records     from "./components/records/Records";
import HabitTracker from "./components/habits/HabitTracker";
import Statistics  from "./components/stats/Statistics";
import Profile     from "./components/profile/Profile";
import Finance     from "./components/finance/Finance";
import Goals       from "./components/goals/Goals";
import Focus       from "./components/focus/Focus";
import AIAssistant from "./components/ai/AIAssistant";

// Shared
import Loader       from "./components/shared/Loader";
import MobileNav    from "./components/shared/MobileNav";
import NotFound     from "./pages/NotFound";
import PageTransition from "./components/shared/PageTransition";

/* ── Route guards ── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

/* ── Animated page wrapper ── */
const AnimatedPage = ({ children }) => {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      {children}
    </PageTransition>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════ */
const App = () => {
  const { isDark }  = useTheme();
  const { user }    = useAuth();
  const location    = useLocation();

  // Pages where bottom MobileNav should NOT appear
  const noMobileNav = ["/login", "/register", "/forgot-password"];
  const showMobileNav = user && !noMobileNav.includes(location.pathname);

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"}
                  transition-all duration-500`}
    >
      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={
          <PublicRoute>
            <AnimatedPage><Login /></AnimatedPage>
          </PublicRoute>
        }/>
        <Route path="/register" element={
          <PublicRoute>
            <AnimatedPage><Register /></AnimatedPage>
          </PublicRoute>
        }/>
        <Route path="/forgot-password" element={
          <PublicRoute>
            <AnimatedPage><ForgotPassword /></AnimatedPage>
          </PublicRoute>
        }/>

        {/* ── Protected ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AnimatedPage><Dashboard /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/tasks" element={
          <ProtectedRoute>
            <AnimatedPage><TaskManager /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/calendar" element={
          <ProtectedRoute>
            <AnimatedPage><CalendarView /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/records" element={
          <ProtectedRoute>
            <AnimatedPage><Records /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/habits" element={
          <ProtectedRoute>
            <AnimatedPage><HabitTracker /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/stats" element={
          <ProtectedRoute>
            <AnimatedPage><Statistics /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/profile" element={
          <ProtectedRoute>
            <AnimatedPage><Profile /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/finance" element={
          <ProtectedRoute>
            <AnimatedPage><Finance /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/goals" element={
          <ProtectedRoute>
            <AnimatedPage><Goals /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/focus" element={
          <ProtectedRoute>
            <AnimatedPage><Focus /></AnimatedPage>
          </ProtectedRoute>
        }/>
        <Route path="/ai" element={
          <ProtectedRoute>
            <AnimatedPage><AIAssistant /></AnimatedPage>
          </ProtectedRoute>
        }/>

        {/* ── Fallbacks ── */}
        <Route path="/"   element={<Navigate to="/dashboard" replace />} />
        <Route path="/404" element={<AnimatedPage><NotFound /></AnimatedPage>} />
        <Route path="*"   element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>

      {/* ── Global Mobile Bottom Nav ── */}
      {showMobileNav && <MobileNav />}
    </div>
  );
};

export default App;