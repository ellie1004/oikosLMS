
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
      <div className="bg-[#00479d] text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
             <span className="px-2 py-0.5 bg-white/20 text-blue-100 text-[10px] font-black rounded uppercase tracking-widest">SPRING 2026</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">반갑습니다, {user.name} 님!</h1>
          <p className="text-blue-100/80 text-lg font-medium">AI융합학과 LMS에 오신 것을 환영합니다.</p>
          
          {isStudent && registeredCourses.length === 0 && (
            <div className="mt-8">
              <button 
                onClick={() => setActiveView('registration')}
                className="bg-white text-[#00479d] px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                신규 수강신청 하러가기 →
              </button>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
              <span className="text-[10px] text-blue-200 block font-black uppercase tracking-wider mb-1">개강일</span>
              <span className="font-bold text-lg">{SEMESTER_INFO.start}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
              <span className="text-[10px] text-blue-200 block font-black uppercase tracking-wider mb-1">등록기간</span>
              <span className="font-bold text-lg">{SEMESTER_INFO.registration}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
              <span className="text-[10px] text-blue-200 block font-black uppercase tracking-wider mb-1">종강일</span>
              <span className="font-bold text-lg">{SEMESTER_INFO.end}</span>
            </div>
          </div>
        </div>
        
        {/* Cuter, Smaller AI Robot Icon */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-12 opacity-30 pointer-events-none transform transition-transform duration-1000">
          <svg className="w-40 h-40 md:w-52 md:h-52 animate-float" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A3,3 0 0,1 17,10V11H18A2,2 0 0,1 20,13V15A2,2 0 0,1 18,17H17V18A3,3 0 0,1 14,21H10A3,3 0 0,1 7,18V17H6A2,2 0 0,1 4,13V13A2,2 0 0,1 6,11H7V10A3,3 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M10.5,13A1.5,1.5 0 0,0 9,14.5A1.5,1.5 0 0,0 10.5,16A1.5,1.5 0 0,0 12,14.5A1.5,1.5 0 0,0 10.5,13M13.5,13A1.5,1.5 0 0,0 12,14.5A1.5,1.5 0 0,0 13.5,16A1.5,1.5 0 0,0 15,14.5A1.5,1.5 0 0,0 13.5,13Z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[#00479d] rounded-full"></div>
               <h2 className="text-xl font-black text-gray-800 tracking-tight">
                 {isStudent ? '나의 수강 목록' : '전체 개설 과목'}
               </h2>
            </div>
            <button 
              onClick={() => setActiveView('courses')}
              className="text-xs text-[#00479d] hover:underline font-black tracking-widest uppercase"
            >
              VIEW ALL
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(isStudent ? registeredCourses : COURSES).length > 0 ? (
              (isStudent ? registeredCourses : COURSES).map(course => (
                <div 
                  key={course.id}
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setActiveView('course-detail');
                  }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-[#00479d] text-[10px] font-black rounded uppercase">
                      {course.type || 'MAJOR'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-[#00479d] transition-colors">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900 text-lg group-hover:text-[#00479d] transition-colors leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 font-bold line-clamp-1">{course.titleEn}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                    <span className="text-sm font-black text-gray-600">{course.instructor}</span>
                    <span className="text-[10px] text-gray-400 font-black">{course.dates.length} SESSIONS</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center">
                <p className="text-gray-400 font-bold mb-4">현재 수강 중인 과목이 없습니다.</p>
                <button 
                  onClick={() => setActiveView('registration')}
                  className="bg-[#00479d] text-white px-6 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition-transform"
                >
                  수강신청 바로가기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: News & Defense */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-800 mb-6 border-b border-gray-50 pb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00479d] rounded-full"></span>
              논문 Defense 일정
            </h2>
            <div className="space-y-4">
              {DEFENSE_SCHEDULES.map((defense, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-[#00479d]/30 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-[#00479d] uppercase tracking-tighter">{defense.date}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-lg text-gray-400 font-bold">{defense.time}</span>
                  </div>
                  <div className="text-sm text-gray-800 font-black">
                    {defense.students.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
            <h2 className="text-lg font-black text-gray-800 mb-6 border-b border-gray-50 pb-4 relative z-10">행정 안내</h2>
            <div className="text-sm text-gray-600 space-y-4 relative z-10">
              <div>
                <span className="text-[10px] text-gray-400 font-black block mb-1 uppercase tracking-widest">Registration Period</span>
                <p className="font-black text-gray-900">2026.02.23 ~ 2026.03.06</p>
              </div>
              <p className="text-xs leading-relaxed text-gray-500 font-medium">졸업 학점 이수 대상자는 별도의 신청 없이 강의에 참여 가능합니다.</p>
              <a 
                href="https://www.oikos.ai.kr/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-2xl font-black text-xs hover:bg-[#00479d] transition-colors shadow-lg shadow-gray-100"
              >
                학과 홈페이지
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
