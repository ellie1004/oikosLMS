
import React, { useState, useMemo } from 'react';
import { Course, Resource, Role, User } from '../types';
import { RESOURCES, MOCK_STUDENT_REGISTRY } from '../constants';

interface CourseDetailProps {
  course: Course;
  user: User;
  onBack: () => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'materials' | 'attendance'>('info');
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  // 해당 과목을 수강 신청한 학생 명단을 동적으로 계산 (예시 데이터 + 실제 신청자)
  const enrolledStudents = useMemo(() => {
    // 1. 시스템 기본 예시 명단
    const fromRegistry = MOCK_STUDENT_REGISTRY
      .filter(s => s.registeredCourseIds.includes(course.id))
      .map(s => s.name);
    
    // 2. 현재 브라우저에서 '학생'으로 로그인해 수강신청을 클릭한 실제 사용자의 성함 추가
    // (로컬 스토리지에 저장된 정보를 바탕으로 실시간 반영됨)
    if (user.role === Role.STUDENT && user.registeredCourseIds?.includes(course.id)) {
      if (!fromRegistry.includes(user.name)) {
        fromRegistry.push(user.name);
      }
    }
    
    return fromRegistry.sort();
  }, [course.id, user]);

  const handleToggleAttendance = (student: string) => {
    setAttendance(prev => ({
      ...prev,
      [student]: prev[student] === 'present' ? 'absent' : 'present'
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-[#00479d] transition-colors font-bold text-sm"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        강의 목록으로
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#00479d] p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                  Course ID: {course.id}
                </span>
                <span className="text-blue-200 text-xs font-bold">Oikos University AI Convergence</span>
              </div>
              <h1 className="text-3xl font-black">{course.title}</h1>
              <p className="text-blue-100 mt-2 font-medium opacity-80">{course.titleEn}</p>
            </div>
            <div className="md:text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-blue-200 uppercase font-black mb-1">Instructor</span>
              <span className="text-xl font-bold">{course.instructor}</span>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100 bg-gray-50/50">
          <nav className="flex px-8 space-x-10 overflow-x-auto">
            {[
              { id: 'info', label: '과목 정보' },
              { id: 'materials', label: '강의 자료실' },
              { id: 'attendance', label: '출석 체크', count: enrolledStudents.length }
            ].map((tab) => {
              if (tab.id === 'attendance' && user.role === Role.STUDENT) return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id ? 'border-[#00479d] text-[#00479d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-[#00479d]' : 'bg-gray-200 text-gray-500'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'info' && (
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#00479d] rounded-full"></div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">과목 개요</h3>
                </div>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative">
                  <svg className="absolute top-4 left-4 w-8 h-8 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H15.017C13.9124 14 13.017 13.1046 13.017 12V5C13.017 3.89543 13.9124 3 15.017 3H21.017C22.1216 3 23.017 3.89543 23.017 5V12C23.017 13.1046 22.1216 14 21.017 14H19.017V16H21.017C22.1216 16 23.017 16.8954 23.017 18V21H14.017ZM1 21L1 18C1 16.8954 1.89543 16 3 16H6V14H2C0.89543 14 0 13.1046 0 12V5C0 3.89543 0.89543 3 2 3H8C9.10457 3 10 3.89543 10 5V12C10 13.1046 9.10457 14 8 14H6V16H8C9.10457 16 10 16.8954 10 18V21H1ZM1 21" /></svg>
                  <p className="text-gray-700 leading-relaxed text-lg font-medium relative z-10 pl-4">
                    {course.description}
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#00479d] rounded-full"></div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">강의 일정 안내</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {course.dates.map((date, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                      <div className="w-12 h-12 bg-blue-50 group-hover:bg-[#00479d] group-hover:text-white rounded-xl flex items-center justify-center text-[#00479d] font-black text-base mr-4 border border-blue-100 transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] font-black uppercase block mb-0.5">Session {idx + 1}</span>
                        <span className="text-gray-800 font-black text-lg">{date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              {RESOURCES.length > 0 ? (
                RESOURCES.map(resource => (
                  <a
                    key={resource.id}
                    href={resource.link}
                    className="flex items-center justify-between p-6 bg-white rounded-2xl hover:bg-blue-50 transition-all border border-gray-100 shadow-sm group"
                  >
                    <div className="flex items-center">
                      <div className={`p-4 rounded-2xl mr-5 ${resource.type === 'file' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {resource.type === 'file' ? (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        ) : (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg group-hover:text-[#00479d] transition-colors">{resource.title}</p>
                        <p className="text-xs text-gray-400 font-bold mt-1 tracking-wider uppercase">Uploaded at {resource.date}</p>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 text-gray-600 group-hover:bg-[#00479d] group-hover:text-white group-hover:border-[#00479d] px-5 py-2 rounded-xl text-xs font-black transition-all shadow-sm">
                      DOWNLOAD
                    </div>
                  </a>
                ))
              ) : (
                <div className="py-24 text-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                  등록된 강의 자료가 존재하지 않습니다.
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (user.role === Role.PROFESSOR || user.role === Role.ADMIN) && (
            <div className="animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-5">
                <div>
                  <h3 className="text-xl font-black text-gray-800 tracking-tight">수강생 실시간 출석부</h3>
                  <p className="text-sm text-gray-400 mt-1.5 font-medium">실제 수강 신청을 완료한 학생들의 명단입니다. (신청 시 자동 추가)</p>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none text-sm bg-[#00479d] text-white px-6 py-3 rounded-xl font-black shadow-lg hover:bg-blue-800 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    출석부 저장
                  </button>
                  <button className="flex-1 sm:flex-none text-sm bg-white text-gray-700 px-6 py-3 rounded-xl font-black border border-gray-200 hover:bg-gray-50 transition-all">
                    EXCEL 출력
                  </button>
                </div>
              </div>
              
              {enrolledStudents.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">수강생 성함</th>
                        <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">출결 상태</th>
                        <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">비고 / 액션</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {enrolledStudents.map((student, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-black text-gray-400 mr-4 border border-slate-200/50 group-hover:bg-[#00479d] group-hover:text-white group-hover:border-[#00479d] transition-all">
                                {student.charAt(0)}
                              </div>
                              <div>
                                <span className="text-base font-black text-gray-900">{student}</span>
                                {student === user.name && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-[9px] rounded font-black tracking-tighter">본인</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-center">
                            <span className={`inline-flex px-4 py-1.5 text-xs rounded-full font-black shadow-sm ${attendance[student] === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                              {attendance[student] === 'present' ? '출석 완료' : '결석'}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                            <button 
                              onClick={() => handleToggleAttendance(student)}
                              className="text-[#00479d] hover:text-blue-800 font-black underline underline-offset-4 decoration-2 decoration-blue-200 hover:decoration-[#00479d] transition-all"
                            >
                              상태 변경하기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-32 text-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl font-bold">
                  수강 신청 완료 인원이 존재하지 않습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
