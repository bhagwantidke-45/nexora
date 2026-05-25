import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./config";

export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logoutUser = () => signOut(auth);

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email);

export const updateUserProfile = (user, data) =>
  updateProfile(user, data);

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);