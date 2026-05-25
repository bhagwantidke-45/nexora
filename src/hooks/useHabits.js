import { useState, useEffect } from "react";
import { getHabitsRealtime } from "../firebase/habits";
import { useAuth } from "../context/AuthContext";

const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = getHabitsRealtime(user.uid, (data) => {
      setHabits(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { habits, loading };
};

export default useHabits;