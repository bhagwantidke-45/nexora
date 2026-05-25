import { useState, useEffect } from "react";
import { getRecordsRealtime } from "../firebase/records";
import { useAuth } from "../context/AuthContext";

const useRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = getRecordsRealtime(user.uid, (data) => {
      setRecords(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { records, loading };
};

export default useRecords;