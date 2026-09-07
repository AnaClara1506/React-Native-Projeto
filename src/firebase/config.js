import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAut-1id339WgGxoQoSgIYncgrAIe4LJxE",
  authDomain: "techcall-cti.firebaseapp.com",
  projectId: "techcall-cti",
  storageBucket: "techcall-cti.firebasestorage.app",
  messagingSenderId: "990410529837",
  appId: "1:990410529837:web:39ba8d07b39cac85c56ca4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Identificador do aluno — usado para isolar os dados de cada
// um dentro do mesmo projeto Firebase compartilhado da turma.
// Cada aluno troca este valor pelo seu RA.
export const ALUNO_ID = 'RA2457016';