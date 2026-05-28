/**
 * App.jsx — Final version with all improvements
 */

import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/config";
import { useAuth }  from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

import Loader            from "./components/shared/Loader";
import MobileNav         from "./components/shared/MobileNav";
import ErrorBoundary     from "./components/shared/ErrorBoundary";
import OfflineBanner     from "./components/shared/OfflineBanner";
import QuickAdd          from "./components/shared/QuickAdd";
import KeyboardShortcuts from "./components/shared/KeyboardShortcuts";
import Onboarding        from "./components/onboarding/Onboarding";
import { NotificationProvider } from "./context/NotificationContext";

import Login          from "./components/auth/Login";
import Register       from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";

const Dashboard    = lazy(() => import("./components/dashboard/Dashboard"));
const TaskManager  = lazy(() => import("./components/tasks/TaskManager"));
const CalendarView = lazy(() => import("./components/calendar/CalendarView"));
const Records      = lazy(() => import("./components/records/Records"));
const HabitTracker = lazy(() => import("./components/habits/HabitTracker"));
const Statistics   = lazy(() => import("./components/stats/Statistics"));
const Profile      = lazy(() => import("./components/profile/Profile"));
const Finance      = lazy(() => import("./components/finance/Finance"));
const Goals        = lazy(() => import("./components/goals/Goals"));
const Focus        = lazy(() => import("./components/focus/Focus"));
const AIAssistant  = lazy(() => import("./components/ai/AIAssistant"));
const NotFound     = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center" aria-busy="true">
    <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

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

const OnboardingGate = ({ children }) => {
  const { user }          = useAuth();
  const { setColorTheme } = useTheme();
  const [checked,  setChecked]  = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!user) { setChecked(true); return; }
    getDoc(doc(db, "userProfiles", user.uid))
      .then((snap) => {
        if (!snap.exists() || !snap.data()?.onboardingComplete) {
          setNeedsOnboarding(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [user]);

  if (!checked) return <Loader />;

  if (needsOnboarding) {
    return (
      <Onboarding
        onComplete={({ theme }) => {
          if (theme) setColorTheme(theme);
          setNeedsOnboarding(false);
        }}
      />
    );
  }

  return children;
};

const Page = ({ component: Component }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

const App = () => {
  const { isDark }  = useTheme();
  const { user }    = useAuth();
  const location    = useLocation();

  const noMobileNav   = ["/login", "/register", "/forgot-password"];
  const showMobileNav = user && !noMobileNav.includes(location.pathname);

  return (
    <NotificationProvider>
      <div id="main-content" className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} transition-all duration-500`}>
        <OfflineBanner />
        <KeyboardShortcuts />

        <Routes>
          <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><OnboardingGate><Page component={Dashboard} /></OnboardingGate></ProtectedRoute>} />
          <Route path="/tasks"     element={<ProtectedRoute><Page component={TaskManager} /></ProtectedRoute>} />
          <Route path="/calendar"  element={<ProtectedRoute><Page component={CalendarView} /></ProtectedRoute>} />
          <Route path="/records"   element={<ProtectedRoute><Page component={Records} /></ProtectedRoute>} />
          <Route path="/habits"    element={<ProtectedRoute><Page component={HabitTracker} /></ProtectedRoute>} />
          <Route path="/stats"     element={<ProtectedRoute><Page component={Statistics} /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Page component={Profile} /></ProtectedRoute>} />
          <Route path="/finance"   element={<ProtectedRoute><Page component={Finance} /></ProtectedRoute>} />
          <Route path="/goals"     element={<ProtectedRoute><Page component={Goals} /></ProtectedRoute>} />
          <Route path="/focus"     element={<ProtectedRoute><Page component={Focus} /></ProtectedRoute>} />
          <Route path="/ai"        element={<ProtectedRoute><Page component={AIAssistant} /></ProtectedRoute>} />

          <Route path="/"    element={<Navigate to="/dashboard" replace />} />
          <Route path="/404" element={<Page component={NotFound} />} />
          <Route path="*"    element={<Page component={NotFound} />} />
        </Routes>

        {user && <QuickAdd />}
        {showMobileNav && <MobileNav />}
      </div>
    </NotificationProvider>
  );
};

export default App;