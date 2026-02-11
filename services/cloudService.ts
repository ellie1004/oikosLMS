
import { db } from "../firebaseConfig";
import { collection, getDocs, setDoc, doc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export const cloudService = {
  // 학생 명단 전체 가져오기
  fetchStudents: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const students: any[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        students.push(doc.data());
      });
      return students;
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        console.error("Firebase 권한 에러: Firestore의 '규칙(Rules)' 탭에서 read, write를 true로 설정했는지 확인하세요.");
      } else {
        console.error("Firebase fetch error:", e);
      }
      return null;
    }
  },

  // 학생 데이터 저장 또는 업데이트
  syncStudent: async (student: { email: string; name: string; registeredCourseIds: string[] }) => {
    try {
      if (!student.email) return false;
      
      const email = student.email.trim().toLowerCase();
      await setDoc(doc(db, "students", email), {
        email: email,
        name: student.name.trim(),
        registeredCourseIds: student.registeredCourseIds || [],
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log("✅ Firebase 동기화 성공:", student.name);
      return true;
    } catch (e: any) {
      console.error("❌ Firebase 동기화 실패:", e.message);
      return false;
    }
  }
};
