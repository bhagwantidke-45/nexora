import { useState, useEffect } from "react";
import { getTasksRealtime } from "../firebase/tasks";
import { useAuth } from "../context/AuthContext";

const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = getTasksRealtime(user.uid, (data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { tasks, loading };
};

export default useTasks;