import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import Dashboard from "./components/dashboard/Dashboard";
import TaskManager from "./components/tasks/TaskManager";
import CalendarView from "./components/calendar/CalendarView";
import Records from "./components/records/Records";
import HabitTracker from "./components/habits/HabitTracker";
import Statistics from "./components/stats/Statistics";
import Loader from "./components/shared/Loader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return !user ? children : <Navigate to="/dashboard" />;
};

const App = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? "bg-mesh" : "bg-mesh-light"} transition-all duration-300`}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute><ForgotPassword /></PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute><TaskManager /></ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute><CalendarView /></ProtectedRoute>
        } />
        <Route path="/records" element={
          <ProtectedRoute><Records /></ProtectedRoute>
        } />
        <Route path="/habits" element={
          <ProtectedRoute><HabitTracker /></ProtectedRoute>
        } />
        <Route path="/stats" element={
          <ProtectedRoute><Statistics /></ProtectedRoute>
        } />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

export default App;