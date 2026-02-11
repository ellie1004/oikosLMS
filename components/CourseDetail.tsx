
import React, { useState, useMemo, useEffect } from 'react';
import { Course, Resource, Role, User } from '../types';
import { cloudService } from '../services/cloudService';

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
  // attendance structure: { [date]: { [studentEmail]: 'present' | 'absent' | 'late' } }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<string, string>>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResLink, setNewResLink] = useState('');
  const [newResType, setNewResType] = useState<'file' | 'link'>('file');

  // Load attendance data from cloud
  useEffect(() => {
    const loadAttendance = async () => {
      const data = await cloudService.fetchAttendance(course.id);
      setAttendanceMap(data || {});
    };
    loadAttendance();
  }, [course.id]);

  const courseResources = useMemo(() => {
    return resources.filter(res => res.courseId === course.id);
  }, [resources, course.id]);

  const enrolledStudents = useMemo(() => {
    return students
      .filter(s => s.registeredCourseIds?.includes(course.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [course.id, students]);

  const handleUpdateStatus = async (date: string, studentEmail: string, status: string) => {
    const newMap = {
      ...attendanceMap,
      [date]: {
        ...(attendanceMap[date] || {}),
        [studentEmail]: status
      }
    };
    setAttendanceMap(newMap);
    setIsSavingAttendance(true);
    await cloudService.saveAttendance(course.id, newMap);
    setIsSavingAttendance(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-500 text-white';
      case 'absent': return 'bg-rose-500 text-white';
      case 'late': return 'bg-amber-500 text-white';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return '출석';
      case 'absent': return '결석';
      case 'late': return '지각';
      default: return '미체크';
    }
  };

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle || !newResLink) return;

    const newRes: Resource = {
      id: 'res-' + Date.now(),
      courseId: course.id,
      title: newResTitle,
      link: newResLink,
      type: newResType,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
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
        {/* Header Section */}
        <div className="bg-[#00479d] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21.18L19,17.18V13.18L12,17.18L5,13.18Z" /></svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded uppercase tracking-wider">Course ID: {course.id}</span>
              <span className="text-blue-200 text-xs font-bold">Oikos AI Convergence</span>
            </div>
            <h1 className="text-3xl font-black">{course.title}</h1>
            <p className="text-blue-100 mt-2 font-medium opacity-80">{course.titleEn}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-100 bg-gray-50/50">
          <nav className="flex px-8 space-x-10 overflow-x-auto">
            {[
              { id: 'info', label: '과목 정보' },
              { id: 'materials', label: '강의 자료실' },
              { id: 'attendance', label: '출석 현황' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id ? 'border-[#00479d] text-[#00479d]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {tab.label}
              </button>
            ))}
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
                  <p className="text-gray-700 leading-relaxed text-lg font-medium">{course.description}</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#00479d] rounded-full"></div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">전체 강의 일정</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {course.dates.map((date, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-colors">
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
                      className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold hover:border-[#00479d] hover:text-[#00479d] transition-all flex items-center justify-center gap-2 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      새로운 강의 자료 등록
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitResource} className="bg-blue-50/30 p-8 rounded-3xl border border-blue-100 space-y-5 animate-fadeIn">
                      <h4 className="font-black text-[#00479d] text-sm uppercase tracking-wider">강의 자료 등록</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="자료 제목" className="px-5 py-3 rounded-xl bg-white shadow-sm font-medium outline-none focus:ring-2 focus:ring-[#00479d]" value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} required />
                        <input type="url" placeholder="다운로드/링크 URL" className="px-5 py-3 rounded-xl bg-white shadow-sm font-medium outline-none focus:ring-2 focus:ring-[#00479d]" value={newResLink} onChange={(e) => setNewResLink(e.target.value)} required />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <label className="flex items-center text-xs font-black text-gray-500 cursor-pointer"><input type="radio" checked={newResType === 'file'} onChange={() => setNewResType('file')} className="mr-2" /> 파일</label>
                          <label className="flex items-center text-xs font-black text-gray-500 cursor-pointer"><input type="radio" checked={newResType === 'link'} onChange={() => setNewResType('link')} className="mr-2" /> 링크</label>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setIsUploading(false)} className="px-4 py-2 text-xs font-black text-gray-400">취소</button>
                          <button type="submit" className="px-6 py-2 bg-[#00479d] text-white rounded-xl text-xs font-black">저장</button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}
              {/* Resources List (Same as before) */}
              <div className="space-y-4">
                {courseResources.length > 0 ? courseResources.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm group">
                    <div className="flex items-center">
                      <div className={`p-4 rounded-xl mr-5 ${res.type === 'file' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {res.type === 'file' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 group-hover:text-[#00479d] transition-colors">{res.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Uploaded {res.date}</p>
                      </div>
                    </div>
                    <a href={res.link} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-xl hover:bg-[#00479d] hover:text-white transition-all">VIEW</a>
                  </div>
                )) : <div className="text-center py-20 text-gray-300 font-bold">자료가 없습니다.</div>}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="animate-fadeIn">
              {user.role === Role.STUDENT ? (
                /* Student View: My Attendance Summary */
                <div className="space-y-6">
                   <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div>
                        <h3 className="text-xl font-black text-[#00479d] mb-1">{user.name} 님의 출석 요약</h3>
                        <p className="text-sm text-blue-600/70 font-medium">실시간 세션별 출석 현황입니다.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm text-center min-w-[80px]">
                           <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">출석</span>
                           <span className="text-xl font-black text-emerald-500">
                             {course.dates.filter(d => attendanceMap[d]?.[user.email.toLowerCase()] === 'present').length}
                           </span>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm text-center min-w-[80px]">
                           <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">결석</span>
                           <span className="text-xl font-black text-rose-500">
                             {course.dates.filter(d => attendanceMap[d]?.[user.email.toLowerCase()] === 'absent').length}
                           </span>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {course.dates.map((date, idx) => {
                       const status = attendanceMap[date]?.[user.email.toLowerCase()];
                       return (
                         <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                            <div>
                               <span className="text-[10px] text-gray-400 font-black uppercase block mb-1">Session {idx+1}</span>
                               <span className="text-gray-800 font-black">{date}</span>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${getStatusColor(status || 'default')}`}>
                               {getStatusLabel(status || 'default')}
                            </span>
                         </div>
                       );
                     })}
                   </div>
                </div>
              ) : (
                /* Professor/Admin View: Attendance Management Grid */
                <div className="space-y-6">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-800 tracking-tight">강의 세션별 출석부</h3>
                      <p className="text-sm text-gray-400 mt-1 font-medium">각 날짜별 버튼을 클릭하여 학생의 상태를 토글하세요.</p>
                    </div>
                    {isSavingAttendance && (
                      <span className="text-[10px] font-black text-emerald-500 animate-pulse flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        SAVING TO CLOUD...
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-50 z-10">학생 이름</th>
                          {course.dates.map((date, i) => (
                            <th key={i} className="px-4 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest border-l border-gray-100">
                              {date}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {enrolledStudents.map((student, sIdx) => (
                          <tr key={sIdx} className="hover:bg-blue-50/10 transition-colors group">
                            <td className="px-6 py-5 whitespace-nowrap sticky left-0 bg-white group-hover:bg-blue-50/30 transition-colors z-10 border-r border-gray-50">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 mr-3 border border-gray-200">
                                  {student.name.charAt(0)}
                                </div>
                                <span className="font-black text-gray-800">{student.name}</span>
                              </div>
                            </td>
                            {course.dates.map((date, dIdx) => {
                              const email = student.email.toLowerCase();
                              const currentStatus = attendanceMap[date]?.[email] || 'default';
                              return (
                                <td key={dIdx} className="px-4 py-5 text-center">
                                  <button
                                    onClick={() => {
                                      const nextStatus = currentStatus === 'present' ? 'absent' : currentStatus === 'absent' ? 'late' : 'present';
                                      handleUpdateStatus(date, email, nextStatus);
                                    }}
                                    className={`w-12 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all shadow-sm ${getStatusColor(currentStatus)}`}
                                  >
                                    {currentStatus === 'present' ? '출' : currentStatus === 'absent' ? '결' : currentStatus === 'late' ? '지' : '-'}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-6 mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <div className="flex items-center gap-2 text-[10px] font-black text-gray-400"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> 출석 (Present)</div>
                     <div className="flex items-center gap-2 text-[10px] font-black text-gray-400"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> 결석 (Absent)</div>
                     <div className="flex items-center gap-2 text-[10px] font-black text-gray-400"><span className="w-3 h-3 bg-amber-500 rounded-sm"></span> 지각 (Late)</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
