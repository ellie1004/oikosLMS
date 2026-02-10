
import React from 'react';
import { COURSES, SEMESTER_INFO, DEFENSE_SCHEDULES } from '../constants';
import { User, Role } from '../types';

interface DashboardProps {
  user: User;
  setActiveView: (view: string) => void;
  setSelectedCourseId: (id: string | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, setActiveView, setSelectedCourseId }) => {
  const registeredCourses = COURSES.filter(course => 
    user.registeredCourseIds?.includes(course.id)
  );

  const isStudent = user.role === Role.STUDENT;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-[#00479d] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">반갑습니다, {user.name} 님!</h1>
          <p className="text-blue-100 text-lg">AI융합학과 2026년 봄학기 LMS에 오신 것을 환영합니다.</p>
          
          {isStudent && registeredCourses.length === 0 && (
            <div className="mt-6 animate-pulse">
              <button 
                onClick={() => setActiveView('registration')}
                className="bg-white text-[#00479d] px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
              >
                신규 수강신청 하러가기 →
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
              <span className="text-xs text-blue-200 block">개강일</span>
              <span className="font-semibold">{SEMESTER_INFO.start}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
              <span className="text-xs text-blue-200 block">등록기간</span>
              <span className="font-semibold">{SEMESTER_INFO.registration}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
              <span className="text-xs text-blue-200 block">종강일</span>
              <span className="font-semibold">{SEMESTER_INFO.end}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <svg className="w-48 h-48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {isStudent ? '나의 수강 목록' : '개설 과목 안내'}
            </h2>
            <button 
              onClick={() => setActiveView('courses')}
              className="text-sm text-[#00479d] hover:underline font-medium"
            >
              전체 보기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isStudent ? registeredCourses : COURSES).length > 0 ? (
              (isStudent ? registeredCourses : COURSES).map(course => (
                <div 
                  key={course.id}
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setActiveView('course-detail');
                  }}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  {course.type && (
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded mb-2">
                      {course.type}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-900 group-hover:text-[#00479d] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{course.titleEn}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <span className="font-medium">{course.instructor}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span>{course.dates.length}회 강의</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-gray-500 mb-4">현재 수강 중인 과목이 없습니다.</p>
                <button 
                  onClick={() => setActiveView('registration')}
                  className="text-[#00479d] font-bold hover:underline"
                >
                  수강신청 하러가기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: News & Defense */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">논문 Final Defense 일정</h2>
            <div className="space-y-4">
              {DEFENSE_SCHEDULES.map((defense, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border-l-4 border-[#00479d]">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-[#00479d]">{defense.date}</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded text-gray-500">{defense.time}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {defense.students.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">수강신청 안내</h2>
            <div className="text-sm text-gray-600 space-y-3">
              <p className="font-medium text-gray-800">2026.02.23 ~ 2026.03.06</p>
              <p>수강신청은 제공된 링크 혹은 시스템 내 수강신청 메뉴를 이용해주세요.</p>
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs leading-relaxed">
                <strong>주의:</strong> 졸업 학점 이수는 수강신청을 별도로 하지 않고 강의에 참여하시면 됩니다.
              </div>
              <a 
                href="https://www.oikos.ai.kr/" 
                target="_blank" 
                rel="noreferrer"
                className="block w-full text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                학과 홈페이지 방문
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
