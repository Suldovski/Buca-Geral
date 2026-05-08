import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "SUBSTITUA_PELA_API_KEY",
  authDomain: "SUBSTITUA_PELO_AUTH_DOMAIN",
  projectId: "SUBSTITUA_PELO_PROJECT_ID",
  storageBucket: "SUBSTITUA_PELO_STORAGE_BUCKET",
  messagingSenderId: "SUBSTITUA_PELO_MESSAGING_SENDER_ID",
  appId: "SUBSTITUA_PELO_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logout() {
  await signOut(auth);
}

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getObras() {
  const snapshot = await getDocs(collection(db, "obras"));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
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

export async function getFuncionarios(obraId = null) {
  const base = collection(db, "funcionarios");
  const ref = obraId ? query(base, where("obraId", "==", obraId)) : base;
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
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

export async function getUsuarios() {
  const snapshot = await getDocs(collection(db, "usuarios_sistema"));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function addUsuario(usuario) {
  const cred = await createUserWithEmailAndPassword(auth, usuario.email, usuario.senha);
  return addDoc(collection(db, "usuarios_sistema"), {
    nome: usuario.nome || "",
    email: usuario.email,
    perfil: usuario.perfil || "Operador",
    obraId: usuario.obraId || "",
    authUid: cred.user.uid
  });
}

export async function updateUsuario(id, usuario) {
  await updateDoc(doc(db, "usuarios_sistema", id), usuario);
}

export async function deleteUsuario(id) {
  await deleteDoc(doc(db, "usuarios_sistema", id));
}
