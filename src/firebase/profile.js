import {
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { auth } from "./config";

/**
 * Update display name (and optionally photoURL)
 */
export const updateUserProfile = async (displayName, photoURL) => {
  return await updateProfile(auth.currentUser, { displayName, photoURL });
};

/**
 * Re-authenticate the current user with their password.
 * Required before sensitive operations (email/password change, delete).
 */
export const reauthenticate = async (currentPassword) => {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  return await reauthenticateWithCredential(user, credential);
};

/**
 * Update email — requires recent authentication.
 */
export const changeEmail = async (currentPassword, newEmail) => {
  await reauthenticate(currentPassword);
  return await updateEmail(auth.currentUser, newEmail);
};

/**
 * Update password — requires recent authentication.
 */
export const changePassword = async (currentPassword, newPassword) => {
  await reauthenticate(currentPassword);
  return await updatePassword(auth.currentUser, newPassword);
};

/**
 * Delete account — requires recent authentication.
 */
export const deleteAccount = async (currentPassword) => {
  await reauthenticate(currentPassword);
  return await deleteUser(auth.currentUser);
};
