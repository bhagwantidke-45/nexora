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
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

// Add Task
export const addTask = async (userId, taskData) => {
  return await addDoc(collection(db, "tasks"), {
    ...taskData,
    userId,
    status: "todo",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update Task
export const updateTask = async (taskId, taskData) => {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, {
    ...taskData,
    updatedAt: serverTimestamp(),
  });
};

// Delete Task
export const deleteTask = async (taskId) => {
  return await deleteDoc(doc(db, "tasks", taskId));
};

// Get Tasks Realtime
export const getTasksRealtime = (userId, callback) => {
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tasks);
  });
};

// Toggle Task Status
export const toggleTaskStatus = async (taskId, currentStatus) => {
  const statusFlow = {
    todo: "inprogress",
    inprogress: "done",
    done: "todo",
  };
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, {
    status: statusFlow[currentStatus] || "todo",
    updatedAt: serverTimestamp(),
  });
};