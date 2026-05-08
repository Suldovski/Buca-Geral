import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmbMa8UjpgAm2GFW8B8HqVb8b2cDy3agc",
  authDomain: "buca-geral.firebaseapp.com",
  projectId: "buca-geral",
  storageBucket: "buca-geral.firebasestorage.app",
  messagingSenderId: "413310771037",
  appId: "1:413310771037:web:a30c43ec73c4f25c4b92b4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function login(email, password) { return (await signInWithEmailAndPassword(auth, email, password)).user; }
export async function logout() { await signOut(auth); }
export function onAuth(callback) { return onAuthStateChanged(auth, callback); }
export async function criarUsuarioAuth(email, password) { return (await createUserWithEmailAndPassword(auth, email, password)).user; }

export async function getObras() { const snap = await getDocs(collection(db, "obras")); return snap.docs.map(d => ({ id: d.id, ...d.data() })); }
export async function addObra(obra) { return await addDoc(collection(db, "obras"), obra); }
export async function getFuncionarios(obraId = null) { let q = obraId ? query(collection(db, "funcionarios"), where("obraId", "==", obraId)) : collection(db, "funcionarios"); const snap = await getDocs(q); return snap.docs.map(d => ({ id: d.id, ...d.data() })); }
export async function addFuncionario(func) { return await addDoc(collection(db, "funcionarios"), func); }
export async function deleteFuncionario(id) { await deleteDoc(doc(db, "funcionarios", id)); }
export async function getUsuarios() { const snap = await getDocs(collection(db, "usuarios_sistema")); return snap.docs.map(d => ({ id: d.id, ...d.data() })); }
export async function addUsuario(usuario) { const userAuth = await criarUsuarioAuth(usuario.email, usuario.senha); return await addDoc(collection(db, "usuarios_sistema"), { nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, obraId: usuario.obraId || null, authUid: userAuth.uid }); }
export async function getUsuarioByEmail(email) { const q = query(collection(db, "usuarios_sistema"), where("email", "==", email)); const snap = await getDocs(q); if (snap.empty) return null; return { id: snap.docs[0].id, ...snap.docs[0].data() }; }