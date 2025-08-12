"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db,auth } from "@/lib/firebase"; // your firebase init file


export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [page, setPage] = useState(1);
  const NOTES_PER_PAGE = 10;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        fetchNotes(u.uid);
        setCheckingAuth(false);
      } else {
        setCheckingAuth(false);
        router.replace("/login");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const fetchNotes = async (uid: string) => {
    const q = query(collection(db, "notes"), where("userId", "==", uid));
    const querySnap = await getDocs(q);
    const data = querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setNotes(data);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!newNote.title.trim() || !newNote.content.trim()) {
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "notes", editingId), newNote);
      } else {
        await addDoc(collection(db, "notes"), {
          ...newNote,
          userId: user.uid,
          createdAt: new Date(),
        });
      }
      setNewNote({ title: "", content: "" });
      setEditingId(null);
      await fetchNotes(user.uid);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note: any) => {
    setNewNote({ title: note.title, content: note.content });
    setEditingId(note.id);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "notes", id));
      if (user) await fetchNotes(user.uid);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);
  const paginatedNotes = filteredNotes.slice((page - 1) * NOTES_PER_PAGE, page * NOTES_PER_PAGE);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200">
        <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 via-white to-green-200 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 py-3 bg-white/80 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#22c55e" /><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span className="font-bold text-lg text-gray-800 tracking-tight">Minty List</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold shadow hover:from-green-500 hover:to-green-700 transition"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-2 py-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-2 text-center md:text-left">My Notes</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white text-black"
        />

        {/* Form */}
        <div className="space-y-2 bg-white/80 rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white text-black"
          />
          <textarea
            placeholder="Content"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white text-black min-h-[80px]"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white font-bold text-lg shadow-md hover:from-green-500 hover:to-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {editingId ? (loading ? "Updating..." : "Update Note") : (loading ? "Adding..." : "Add Note")}
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {paginatedNotes.length > 0 ? (
            paginatedNotes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-200 rounded-xl p-4 shadow bg-white/90 flex flex-col md:flex-row md:justify-between md:items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-lg truncate">{note.title}</h2>
                  <p className="text-gray-700 break-words whitespace-pre-line">{note.content}</p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0 md:flex-col md:items-end">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-green-600 font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-500 font-medium hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No notes found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-green-200 text-green-800 font-semibold disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-700">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-green-200 text-green-800 font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 bg-white/80 text-right text-gray-500 text-sm mt-auto">
        &copy; {new Date().getFullYear()} MintyList. All rights reserved.
      </footer>
    </div>
  );
}
