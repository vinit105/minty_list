import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  orderBy,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

const notesCollection = collection(db, "notes");

export async function addNote(userId: string, title: string, content: string) {
  return await addDoc(notesCollection, {
    userId,
    title,
    content,
    createdAt: Timestamp.now(),
  });
}

export async function getUserNotes(userId: string) {
const q = query(
  notesCollection,
  where("userId", "==", userId),
  orderBy("createdAt", "desc") // latest first
);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateNote(id: string, data: Partial<{ title: string; content: string }>) {
  const noteRef = doc(db, "notes", id);
  await updateDoc(noteRef, data);
}

export async function deleteNote(id: string) {
  const noteRef = doc(db, "notes", id);
  await deleteDoc(noteRef);
}
