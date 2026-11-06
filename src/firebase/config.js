import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBlxN5obzzkK98Rg7NmTO1EFXa-6t5Qz60",
  authDomain: "techcall3-99ef9.firebaseapp.com",
  projectId: "techcall3-99ef9",
  storageBucket: "techcall3-99ef9.firebasestorage.app",
  messagingSenderId: "127162678608",
  appId: "1:127162678608:web:502faafe6b70d62f43c055"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Identificador do aluno — usado para isolar os dados de cada
// um dentro do mesmo projeto Firebase compartilhado da turma.
// Cada aluno troca este valor pelo seu RA.
export const ALUNO_ID = 'RA2457016';