import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// Add Event
export const addEvent = async (userId, eventData) => {
  return await addDoc(collection(db, "events"), {
    ...eventData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update Event
export const updateEvent = async (eventId, eventData) => {
  const eventRef = doc(db, "events", eventId);
  return await updateDoc(eventRef, {
    ...eventData,
    updatedAt: serverTimestamp(),
  });
};

// Delete Event
export const deleteEvent = async (eventId) => {
  return await deleteDoc(doc(db, "events", eventId));
};

// Get Events Realtime
export const getEventsRealtime = (userId, callback) => {
  const q = query(
    collection(db, "events"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(events);
  });
};