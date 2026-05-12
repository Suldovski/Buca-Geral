import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
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
  onSnapshot
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
  appId: "1:413310771037:web:a30c43ec73c4f25c4b92b4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

function getSecondaryAuth() {
  const secondaryName = "buca-geral-secondary-auth";
  const secondaryApp = getApps().find((a) => a.name === secondaryName)
    ?? initializeApp(firebaseConfig, secondaryName);
  return getAuth(secondaryApp);
}

// ==================== AUTENTICAÇÃO ====================
export async function login(email, password) {
  return (await signInWithEmailAndPassword(auth, email, password)).user;
}

export async function logout() {
  await signOut(auth);
}

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function criarUsuarioAuth(email, password) {
  const secondaryAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  await signOut(secondaryAuth);
  return cred.user;
}

// ==================== OBRAS ====================
export async function getObras() {
  const snap = await getDocs(collection(db, "obras"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeObras(callback) {
  return onSnapshot(collection(db, "obras"), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addObra(obra) {
  return addDoc(collection(db, "obras"), obra);
}

export async function updateObra(id, obra) {
  await updateDoc(doc(db, "obras", id), obra);
}

export async function deleteObra(id) {
  await deleteDoc(doc(db, "obras", id));
}

// ==================== FUNCIONÁRIOS ====================
export async function getFuncionarios(obraId = null) {
  const source = obraId
    ? query(collection(db, "funcionarios"), where("obraId", "==", obraId))
    : collection(db, "funcionarios");
  const snap = await getDocs(source);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeFuncionarios(obraId, callback) {
  const source = obraId
    ? query(collection(db, "funcionarios"), where("obraId", "==", obraId))
    : collection(db, "funcionarios");
  return onSnapshot(source, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addFuncionario(funcionario) {
  return addDoc(collection(db, "funcionarios"), funcionario);
}

export async function updateFuncionario(id, funcionario) {
  await updateDoc(doc(db, "funcionarios", id), funcionario);
}

export async function deleteFuncionario(id) {
  await deleteDoc(doc(db, "funcionarios", id));
}

// ==================== USUÁRIOS DO SISTEMA ====================
export async function getUsuarios() {
  const snap = await getDocs(collection(db, "usuarios_sistema"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeUsuarios(callback) {
  return onSnapshot(collection(db, "usuarios_sistema"), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addUsuario(usuario) {
  const userAuth = await criarUsuarioAuth(usuario.email, usuario.senha);
  const data = {
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    obraId: usuario.obraId || null,
    authUid: userAuth.uid,
    criadoEm: new Date().toISOString()
  };
  return addDoc(collection(db, "usuarios_sistema"), data);
}

export async function updateUsuario(id, usuario) {
  await updateDoc(doc(db, "usuarios_sistema", id), usuario);
}

export async function deleteUsuario(id) {
  await deleteDoc(doc(db, "usuarios_sistema", id));
}

export async function getUsuarioByEmail(email) {
  const q = query(collection(db, "usuarios_sistema"), where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}
