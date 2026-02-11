
export const googleSheetService = {
  // API URL 가져오기
  getApiUrl: () => localStorage.getItem('OIKOS_SHEET_API_URL') || 'https://script.google.com/macros/s/AKfycbx-X3-5RtL_fJRgjfj2bcgdgIM8QfmDjDuGu3DHuKCK47cfq7cJid6bXQv5Zgw7o_Iu/exec',
  setApiUrl: (url: string) => localStorage.setItem('OIKOS_SHEET_API_URL', url),

  // 시트에서 학생 명단 읽기
  fetchStudents: async () => {
    const url = googleSheetService.getApiUrl();
    if (!url) return null;
    try {
      const response = await fetch(`${url}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (!Array.isArray(data)) return [];
      
      return data.map((s: any) => ({
        email: (s.email || '').toString().trim().toLowerCase(),
        name: (s.name || '').toString().trim(),
        registeredCourseIds: s.courseIds ? String(s.courseIds).split(',').filter(Boolean) : []
      }));
    } catch (e) {
      console.error("Sheet fetch error:", e);
      return null;
    }
  },

  // 시트에 데이터 쓰기 (최종 안정화 버전)
  syncStudent: async (student: { email: string; name: string; registeredCourseIds: string[] }) => {
    const url = googleSheetService.getApiUrl();
    if (!url || !url.includes('script.google.com')) return false;
    
    try {
      // 1. 전송 데이터 준비
      const payload = {
        email: student.email.trim().toLowerCase(),
        name: student.name.trim(),
        courseIds: (student.registeredCourseIds || []).join(',')
      };

      // 디버깅용 로그
      console.log("Attempting Cloud Sync...");
      console.table(payload);

      // 2. URLSearchParams 객체를 직접 전달 (브라우저 자동 헤더 설정 활용)
      const formData = new URLSearchParams();
      formData.append('email', payload.email);
      formData.append('name', payload.name);
      formData.append('courseIds', payload.courseIds);

      // 3. Fetch 요청 (no-cors 모드에서는 응답을 읽을 수 없지만 데이터는 전달됨)
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', 
        cache: 'no-cache',
        body: formData // 문자열 변환 없이 객체 그대로 전달
      });
      
      console.log("Cloud Sync signal sent for:", payload.name);
      return true;
    } catch (e) {
      console.error("Cloud Sync critical error:", e);
      return false;
    }
  }
};
