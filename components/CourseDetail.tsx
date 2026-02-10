
import React, { useState, useMemo } from 'react';
import { Course, Resource, Role, User } from '../types';

interface CourseDetailProps {
  course: Course;
  user: User;
  students: any[];
  resources: Resource[];
  onAddResource: (resource: Resource) => void;
  onBack: () => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ 
  course, user, students, resources, onAddResource, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'materials' | 'attendance'>('info');
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  
  // Resource Form State
  const [isUploading, setIsUploading] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResLink, setNewResLink] = useState('');
  const [newResType, setNewResType] = useState<'file' | 'link'>('file');

  // 실시간 통합 명단에서 이 과목을 신청한 학생 필터링
  const enrolledStudents = useMemo(() => {
    return students
      .filter(s => s.registeredCourseIds?.includes(course.id))
      .map(s => s.name)
      .sort();
  }, [course.id, students]);

  const handleToggleAttendance = (student: string) => {
    setAttendance(prev => ({
      ...prev,
      [student]: prev[student] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle) return;

    const newRes: Resource = {
      id: 'res-' + Date.now(),
      title: newResTitle,
      link: newResLink || '#',
      type: newResType,
      date: new Date().toISOString().split('T')[0]
    };

    onAddResource(newRes);
    setNewResTitle('');
    setNewResLink('');
    setIsUploading(false);
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
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <p className="text-gray-700 leading-relaxed text-lg font-medium">
                    {course.description}
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#00479d] rounded-full"></div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">강의 일정</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {course.dates.map((date, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <span className="text-gray-400 text-[10px] font-black uppercase block mb-1">Session {idx+1}</span>
                      <span className="text-gray-800 font-black text-lg">{date}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6">
              {user.role === Role.PROFESSOR && (
                <div className="mb-8">
                  {!isUploading ? (
                    <button 
                      onClick={() => setIsUploading(true)}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-[#00479d] hover:text-[#00479d] transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      새로운 강의 자료 올리기
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitResource} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="자료 제목 (예: 1주차 강의안)"
                          className="px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
                          value={newResTitle}
                          onChange={(e) => setNewResTitle(e.target.value)}
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="링크 URL (선택사항)"
                          className="px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
                          value={newResLink}
                          onChange={(e) => setNewResLink(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <label className="flex items-center text-sm font-bold text-gray-600">
                            <input type="radio" className="mr-2" checked={newResType === 'file'} onChange={() => setNewResType('file')} /> 파일
                          </label>
                          <label className="flex items-center text-sm font-bold text-gray-600">
                            <input type="radio" className="mr-2" checked={newResType === 'link'} onChange={() => setNewResType('link')} /> 링크
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setIsUploading(false)} className="px-4 py-2 text-sm font-bold text-gray-400">취소</button>
                          <button type="submit" className="px-6 py-2 bg-[#00479d] text-white rounded-lg text-sm font-bold shadow-md">자료 등록</button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {resources.length > 0 ? (
                  resources.map(resource => (
                    <div key={resource.id} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center">
                        <div className={`p-4 rounded-2xl mr-5 ${resource.type === 'file' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          {resource.type === 'file' ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg">{resource.title}</p>
                          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">Uploaded at {resource.date}</p>
                        </div>
                      </div>
                      <a 
                        href={resource.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-white border border-gray-200 text-gray-500 hover:bg-[#00479d] hover:text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm"
                      >
                        DOWNLOAD
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">등록된 강의 자료가 없습니다.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (user.role === Role.PROFESSOR || user.role === Role.ADMIN) && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">수강생 명단 (실시간 신청자 포함)</h3>
                <p className="text-sm text-gray-400 mt-1.5 font-medium">실제 학생이 신청을 누르는 즉시 아래 명단에 반영됩니다.</p>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">이름</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">상태</th>
                      <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">액션</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {enrolledStudents.map((student, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-black text-gray-400 mr-4 border border-slate-200/50 group-hover:bg-[#00479d] group-hover:text-white transition-all">
                              {student.charAt(0)}
                            </div>
                            <span className="text-base font-black text-gray-900">{student}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className={`inline-flex px-4 py-1.5 text-xs rounded-full font-black shadow-sm ${attendance[student] === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {attendance[student] === 'present' ? '출석' : '결석'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                          <button 
                            onClick={() => handleToggleAttendance(student)}
                            className="text-[#00479d] hover:text-blue-800 font-black underline underline-offset-4"
                          >
                            변경하기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
