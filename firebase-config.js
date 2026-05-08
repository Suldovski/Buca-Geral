// firebase-config.js - Versão COMPLETA com todas as funções CRUD
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmbMa8UjpgAm2GFW8B8HqVb8b2cDy3agc",
  authDomain: "buca-geral.firebaseapp.com",
  projectId: "buca-geral",
  storageBucket: "buca-geral.firebasestorage.app",
  messagingSenderId: "413310771037",
  appId: "1:413310771037:web:a30c43ec73c4f25c4b92b4",
  measurementId: "G-DSVZEL4L51"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ==================== AUTENTICAÇÃO ====================
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function criarUsuarioAuth(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logout() {
  await signOut(auth);
}

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ==================== CRUD OBRAS ====================
export async function getObras() {
  const snapshot = await getDocs(collection(db, "obras"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getObraById(id) {
  const docRef = doc(db, "obras", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function addObra(obra) {
  return await addDoc(collection(db, "obras"), obra);
}

export async function updateObra(id, obra) {
  const docRef = doc(db, "obras", id);
  await updateDoc(docRef, obra);
}

export async function deleteObra(id) {
  const docRef = doc(db, "obras", id);
  await deleteDoc(docRef);
}

// ==================== CRUD FUNCIONÁRIOS ====================
export async function getFuncionarios(obraId = null) {
  let q;
  if (obraId) {
    q = query(collection(db, "funcionarios"), where("obraId", "==", obraId));
  } else {
    q = collection(db, "funcionarios");
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getFuncionarioById(id) {
  const docRef = doc(db, "funcionarios", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function addFuncionario(funcionario) {
  return await addDoc(collection(db, "funcionarios"), funcionario);
}

export async function updateFuncionario(id, funcionario) {
  const docRef = doc(db, "funcionarios", id);
  await updateDoc(docRef, funcionario);
}

export async function deleteFuncionario(id) {
  const docRef = doc(db, "funcionarios", id);
  await deleteDoc(docRef);
}

// ==================== CRUD USUÁRIOS DO SISTEMA ====================
export async function getUsuarios() {
  const snapshot = await getDocs(collection(db, "usuarios_sistema"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getUsuarioByEmail(email) {
  const q = query(collection(db, "usuarios_sistema"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function addUsuario(usuario) {
  // Primeiro cria no Firebase Auth
  const userAuth = await criarUsuarioAuth(usuario.email, usuario.senha);
  // Depois salva no Firestore
  const usuarioData = {
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    obraId: usuario.obraId || null,
    authUid: userAuth.uid,
    criadoEm: new Date().toISOString()
  };
  return await addDoc(collection(db, "usuarios_sistema"), usuarioData);
}

export async function updateUsuario(id, usuario) {
  const docRef = doc(db, "usuarios_sistema", id);
  await updateDoc(docRef, usuario);
}

export async function deleteUsuario(id) {
  const docRef = doc(db, "usuarios_sistema", id);
  await deleteDoc(docRef);
}
