
import { db } from "../firebaseConfig";
import { collection, getDocs, setDoc, doc, getDoc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

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
      console.error("Firebase fetch error:", e);
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
      return true;
    } catch (e: any) {
      console.error("❌ Firebase sync error:", e.message);
      return false;
    }
  },

  // 특정 강의의 모든 출석 데이터 가져오기
  fetchAttendance: async (courseId: string) => {
    try {
      const docRef = doc(db, "attendance", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return {};
    } catch (e) {
      console.error("Attendance fetch error:", e);
      return {};
    }
  },

  // 특정 강의의 출석 데이터 업데이트
  saveAttendance: async (courseId: string, attendanceData: any) => {
    try {
      await setDoc(doc(db, "attendance", courseId), attendanceData, { merge: true });
      console.log("✅ 출석 데이터 서버 저장 완료");
      return true;
    } catch (e) {
      console.error("Attendance save error:", e);
      return false;
    }
  }
};
