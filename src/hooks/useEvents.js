import { useState, useEffect } from "react";
import { getEventsRealtime } from "../firebase/calendar";
import { useAuth } from "../context/AuthContext";

const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = getEventsRealtime(user.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { events, loading };
};

export default useEvents;
