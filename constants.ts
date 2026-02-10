
import { Course, Announcement, Resource, DefenseSchedule, Role } from './types';

export const SEMESTER_INFO = {
  name: "2026년 봄학기",
  registration: "2026.02.23 ~ 2026.03.06",
  start: "2026.03.09",
  end: "2026.05.02"
};

export const AUTHORIZED_PROFESSORS = [
  { name: "김세광", email: "metalab1004@gmail.com" },
  { name: "최영준", email: "ezr710@gmail.com" },
  { name: "마상욱", email: "issacma70@gmail.com" },
  { name: "최진이", email: "chlwlsdl@gmail.com" },
  { name: "최윤식", email: "ysfuture@gmail.com" }
];

export const AUTHORIZED_ADMINS = [
  { name: "시스템 관리자", email: "admin@oikos.ac.kr" },
  { name: "학과장", email: "head@oikos.ac.kr" },
  { name: "최영준", email: "ezr710@gmail.com" }
];

export const COURSES: Course[] = [
  {
    id: "gen-ai-101",
    title: "생성형 AI의 이해와 활용",
    titleEn: "Understanding and Application of Generative AI",
    instructor: "최진이 교수",
    description: "GPT·GEMINI AI 등 생성형 도구의 구조, 활용 및 통합적 사고 함양하여 AI사용 역량을 함양한다.",
    dates: ["3월 9일", "3월 16일", "3월 23일"]
  },
  {
    id: "media-creation",
    title: "AI 기반 미디어 창작",
    titleEn: "AI-Based Media Create",
    instructor: "마상욱 교수",
    description: "AI를 활용한 영상 등 다양한 미디어 창작을 기반으로 하는 교육 컨텐츠 프로젝트를 연구한다.",
    dates: ["3월 26일", "4월 2일", "4월 9일"]
  },
  {
    id: "creative-writing",
    title: "AI기반 창의적 글쓰기",
    titleEn: "AI-Assisted Creative Writing",
    instructor: "김세광 교수",
    description: "AI를 활용하여 글을 작성하고 출판까지의 모든 크리에이터 컨텐츠를 연구한다.",
    dates: ["3월 31일", "4월 2일", "4월 9일"]
  },
  {
    id: "business-ai",
    title: "AI 기반 경영학 개론",
    titleEn: "AI-based Introduction to Business",
    instructor: "최윤식 교수",
    description: "AI시대, 우리에게는 새로운 경영학 이론이 필요하다. 이 과목에서는 AI 시대에는 경영학을 어떻게 써내려가야 할 지를 탐구한다.",
    dates: ["4월 25일", "5월 2일"]
  },
  {
    id: "ethics-ai",
    title: "AI 시대의 삶과 기독교윤리",
    titleEn: "Christian Ethics for Life in the Age of AI",
    instructor: "최영준 교수",
    description: "AI 시대의 사회와 문화 속에서 기독교 신앙을 실천하는 방법을 통합적으로 탐구한다.",
    dates: ["4월 6일", "4월 13일", "4월 20일"],
    type: "대학기초과목"
  }
];

export const DEFENSE_SCHEDULES: DefenseSchedule[] = [
  { date: "3월 3일(화)", time: "저녁 8시", students: ["배혜숙", "오경근", "김재성"] },
  { date: "3월 5일(목)", time: "저녁 8시", students: ["신이재", "성정민", "김신애"] },
  { date: "3월 9일(월)", time: "저녁 8시", students: ["이경숙", "김은하", "이경림", "조재윤"] }
];

export const MOCK_STUDENT_REGISTRY: any[] = [];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "2026년 봄학기 개강 안내",
    date: "2026-02-15",
    author: "행정실",
    content: "안녕하세요. AI융합학과 2026년 봄학기 개강 안내입니다. 일정 및 강의실을 확인해주세요."
  },
  {
    id: "2",
    title: "수강신청 방법 안내",
    date: "2026-02-20",
    author: "행정실",
    content: "졸업 학점 이수는 수강신청을 하지 않고 강의에 참여하시면 됩니다."
  }
];

export const RESOURCES: Resource[] = [
  { id: "r1", title: "생성형 AI 기초 가이드 PDF", date: "2026-03-09", link: "#", type: "file" },
  { id: "r2", title: "AI 미디어 창작 툴셋 링크", date: "2026-03-26", link: "https://example.com", type: "link" }
];
