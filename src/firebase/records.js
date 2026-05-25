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

// Add Record
export const addRecord = async (userId, recordData) => {
  return await addDoc(collection(db, "records"), {
    ...recordData,
    userId,
    pinned: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update Record
export const updateRecord = async (recordId, recordData) => {
  const recordRef = doc(db, "records", recordId);
  return await updateDoc(recordRef, {
    ...recordData,
    updatedAt: serverTimestamp(),
  });
};

// Delete Record
export const deleteRecord = async (recordId) => {
  return await deleteDoc(doc(db, "records", recordId));
};

// Toggle Pin
export const togglePin = async (recordId, currentPinned) => {
  const recordRef = doc(db, "records", recordId);
  return await updateDoc(recordRef, {
    pinned: !currentPinned,
    updatedAt: serverTimestamp(),
  });
};

// Get Records Realtime
export const getRecordsRealtime = (userId, callback) => {
  const q = query(
    collection(db, "records"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(records);
  });
};