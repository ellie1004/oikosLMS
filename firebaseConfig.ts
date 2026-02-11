
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 사용자가 제공한 실제 Firebase 프로젝트 설정 값입니다.
const firebaseConfig = {
  apiKey: "AIzaSyAcWB7Q805aKE1bOiPu5oC4SaOEYeB2B64",
  authDomain: "oikosailms.firebaseapp.com",
  projectId: "oikosailms",
  storageBucket: "oikosailms.firebasestorage.app",
  messagingSenderId: "549645117789",
  appId: "1:549645117789:web:7446beb040c24e2725a0b4",
  measurementId: "G-PNX913VSMR"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 내보내기
export const db = getFirestore(app);
