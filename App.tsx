
import React, { useState, useEffect, useCallback } from 'react';
import { User, Role, Course, Resource } from './types';
import { COURSES, ANNOUNCEMENTS, AUTHORIZED_PROFESSORS, AUTHORIZED_ADMINS, RESOURCES } from './constants';
import { Navbar } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CourseDetail } from './components/CourseDetail';
import { CourseRegistration } from './components/CourseRegistration';
import { storageService } from './services/storageService';

const DB_VERSION = "1.6.0 (Cloud Connected)"; 

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Database States
  const [globalStudents, setGlobalStudents] = useState<any[]>([]);
  const [globalResources, setGlobalResources] = useState<Resource[]>([]);

  // Login form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [rememberEmail, setRememberEmail] = useState(false);

  // Load Database ASYNC from Service
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const students = await storageService.load<any[]>('global_students', []);
        const resources = await storageService.load<Resource[]>('global_resources', RESOURCES);
        
        // Use local storage for user/email for faster boot
        const savedEmail = localStorage.getItem('OIKOS_LMS_REMEMBERED_EMAIL');
        const savedUserStr = localStorage.getItem('OIKOS_LMS_V1_current_user');

        setGlobalStudents(students);
        setGlobalResources(resources);
        
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberEmail(true);
        }
        if (savedUserStr) {
          setUser(JSON.parse(savedUserStr));
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Sync Global Data with Debounce to prevent too many Firebase writes
  useEffect(() => {
    if (isLoading) return; // Don't sync during initial load
    
    const sync = async () => {
      setSyncing(true);
      await storageService.save('global_students', globalStudents);
      setTimeout(() => setSyncing(false), 1000);
    };

    const timer = setTimeout(sync, 1500);
    return () => clearTimeout(timer);
  }, [globalStudents, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    storageService.save('global_resources', globalResources);
  }, [globalResources, isLoading]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('OIKOS_LMS_V1_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('OIKOS_LMS_V1_current_user');
    }
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let finalName = name;
    let finalRegisteredIds: string[] = [];
    const normalizedEmail = email.trim().toLowerCase();

    if (role === Role.PROFESSOR) {
      const professor = AUTHORIZED_PROFESSORS.find(p => p.email.toLowerCase() === normalizedEmail);
      if (!professor) { setError('등록되지 않은 교수 이메일입니다.'); return; }
      finalName = professor.name;
      finalRegisteredIds = COURSES.map(c => c.id);
    } 
    else if (role === Role.ADMIN) {
      const admin = AUTHORIZED_ADMINS.find(a => a.email.toLowerCase() === normalizedEmail);
      if (!admin) { setError('등록되지 않은 관리자 이메일입니다.'); return; }
      finalName = admin.name;
      finalRegisteredIds = COURSES.map(c => c.id);
    }
    else {
      const existingStudent = globalStudents.find(s => s.email.toLowerCase() === normalizedEmail);
      if (existingStudent) {
        finalName = existingStudent.name;
        finalRegisteredIds = existingStudent.registeredCourseIds || [];
      }
      if (!finalName && !name) { setError('성함을 입력해주세요.'); return; }
    }

    const newUser: User = { email: normalizedEmail, name: finalName, role, registeredCourseIds: finalRegisteredIds };
    
    if (rememberEmail) localStorage.setItem('OIKOS_LMS_REMEMBERED_EMAIL', normalizedEmail);
    else localStorage.removeItem('OIKOS_LMS_REMEMBERED_EMAIL');

    setUser(newUser);

    if (role === Role.STUDENT) {
      setGlobalStudents(prev => {
        if (!prev.find(s => s.email.toLowerCase() === normalizedEmail)) {
          return [...prev, { name: finalName, email: normalizedEmail, registeredCourseIds: finalRegisteredIds }];
        }
        return prev;
      });
    }
    setActiveView('home');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveView('home');
    setSelectedCourseId(null);
  };

  const handleRegisterCourse = (courseId: string) => {
    if (!user) return;
    const currentRegistered = user.registeredCourseIds || [];
    if (currentRegistered.includes(courseId)) return;

    const updatedIds = [...currentRegistered, courseId];
    const updatedUser = { ...user, registeredCourseIds: updatedIds };
    setUser(updatedUser);

    setGlobalStudents(prev => {
      const email = user.email.toLowerCase();
      const existingIdx = prev.findIndex(s => s.email.toLowerCase() === email);
      if (existingIdx > -1) {
        const newStudents = [...prev];
        newStudents[existingIdx] = { ...newStudents[existingIdx], registeredCourseIds: updatedIds };
        return newStudents;
      }
      return [...prev, { name: user.name, email: user.email, registeredCourseIds: updatedIds }];
    });
  };

  const handleUnregisterCourse = (courseId: string) => {
    if (!user) return;
    const updatedIds = (user.registeredCourseIds || []).filter(id => id !== courseId);
    const updatedUser = { ...user, registeredCourseIds: updatedIds };
    setUser(updatedUser);

    setGlobalStudents(prev => prev.map(s => 
      s.email.toLowerCase() === user.email.toLowerCase() ? { ...s, registeredCourseIds: updatedIds } : s
    ));
  };

  const handleAddResource = (newResource: Resource) => {
    setGlobalResources(prev => [newResource, ...prev]);
  };

  const exportDB = () => {
    const dbData = storageService.exportAll();
    const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OIKOS_LMS_CLOUD_BACKUP.json`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-[#00479d] rounded-full animate-spin"></div>
        <p className="text-[#00479d] font-black text-sm animate-pulse">CONNECTING TO CLOUD DATABASE...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 font-['Noto_Sans_KR']">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00479d]"></div>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-[#00479d] tracking-tighter">OIKOS AI LMS</h1>
            <p className="text-gray-400 mt-3 font-bold uppercase text-[10px] tracking-[0.2em]">Learning Management System</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">이메일 주소</label>
              <input type="email" required className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-medium" placeholder="example@oikos.ac.kr" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {role === Role.STUDENT && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase ml-1">이름</label>
                <input type="text" required className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-medium" placeholder="성함을 입력하세요" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">접속 모드</label>
              <div className="grid grid-cols-3 gap-2">
                {[Role.STUDENT, Role.PROFESSOR, Role.ADMIN].map((r) => (
                  <button key={r} type="button" onClick={() => { setRole(r); setError(null); }} className={`py-3 rounded-xl border text-[11px] font-black transition-all ${role === r ? 'bg-[#00479d] border-[#00479d] text-white shadow-lg shadow-blue-200' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                    {r === Role.STUDENT ? 'STUDENT' : r === Role.PROFESSOR ? 'FACULTY' : 'ADMIN'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center ml-1">
              <input id="rem" type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#00479d] focus:ring-[#00479d]" checked={rememberEmail} onChange={(e) => setRememberEmail(e.target.checked)} />
              <label htmlFor="rem" className="ml-2 text-sm text-gray-500 font-bold select-none cursor-pointer">이메일 정보 기억하기</label>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-500 text-xs font-black text-center rounded-xl border border-red-100">{error}</div>}

            <button type="submit" className="w-full bg-[#00479d] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-800 hover:-translate-y-1 active:translate-y-0 transition-all">
              로그인하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  const selectedCourse = COURSES.find(c => c.id === selectedCourseId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Sync Status Indicator */}
      <div className={`h-1 transition-all duration-700 ${syncing ? 'bg-blue-400 w-full opacity-100' : 'bg-transparent w-0 opacity-0'}`} />
      
      <Navbar user={user} onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4 h-4">
           {syncing ? (
             <span className="text-[9px] font-black text-blue-400 flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
               SYNCING TO FIREBASE...
             </span>
           ) : (
             <span className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
               CLOUD CONNECTED (V{DB_VERSION})
             </span>
           )}
        </div>

        {activeView === 'home' && (
          <div className="space-y-8">
            <Dashboard user={user} setActiveView={setActiveView} setSelectedCourseId={setSelectedCourseId} />
            {user.role === Role.ADMIN && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-black text-orange-800">DATABASE CENTER</h3>
                  <p className="text-sm text-orange-600/70 font-bold mt-1">시스템에 등록된 실제 학생 데이터: {globalStudents.length}명</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={exportDB} className="px-8 py-3 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-100 hover:scale-105 transition-transform">백업 파일 생성</button>
                  <button onClick={() => { if(window.confirm("초기화하시겠습니까?")) { storageService.clear(); window.location.reload(); } }} className="px-8 py-3 bg-white border-2 border-orange-100 text-orange-300 rounded-2xl font-black hover:bg-orange-50 transition-colors">시스템 리셋</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'registration' && user.role === Role.STUDENT && (
          <CourseRegistration user={user} onRegister={handleRegisterCourse} onUnregister={handleUnregisterCourse} />
        )}

        {activeView === 'courses' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4">
               <div className="w-2 h-8 bg-[#00479d] rounded-full"></div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tighter">나의 강의실</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {COURSES.filter(c => user.role !== Role.STUDENT || user.registeredCourseIds?.includes(c.id)).map(course => (
                <div key={course.id} onClick={() => { setSelectedCourseId(course.id); setActiveView('course-detail'); }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="h-40 bg-[#00479d] p-8 flex flex-col justify-end relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <span className="text-blue-100 text-[10px] font-black uppercase tracking-widest relative z-10">{course.instructor}</span>
                    <h3 className="text-white font-black text-xl mt-1 relative z-10">{course.title}</h3>
                  </div>
                  <div className="p-8">
                    <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-2 mb-6">{course.description}</p>
                    <div className="flex items-center text-[#00479d] font-black text-xs group-hover:gap-2 transition-all">
                      입장하여 학습하기 <span className="text-lg">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'course-detail' && selectedCourse && (
          <CourseDetail course={selectedCourse} user={user} students={globalStudents} resources={globalResources} onAddResource={handleAddResource} onBack={() => setActiveView('courses')} />
        )}

        {activeView === 'attendance' && (user.role === Role.PROFESSOR || user.role === Role.ADMIN) && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4">
               <div className="w-2 h-8 bg-[#00479d] rounded-full"></div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tighter">실시간 수강 및 출석 현황</h1>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {COURSES.map(course => {
                const enrolled = globalStudents.filter(s => s.registeredCourseIds?.includes(course.id));
                return (
                  <div key={course.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:border-[#00479d]/30 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-2 py-0.5 bg-blue-50 text-[#00479d] text-[10px] font-black rounded uppercase">LECTURE</span>
                          <h3 className="text-xl font-black text-gray-900">{course.title}</h3>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{course.instructor} • 신청 인원 <span className="text-[#00479d]">{enrolled.length}명</span></p>
                      </div>
                      <button 
                        onClick={() => { setSelectedCourseId(course.id); setActiveView('course-detail'); }}
                        className="px-6 py-3 bg-[#00479d] text-white text-xs font-black rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-50 transition-all"
                      >
                        상세 출석부 관리
                      </button>
                    </div>
                    {enrolled.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {enrolled.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-100">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                            {s.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 border-2 border-dashed border-gray-50 rounded-2xl text-center">
                         <p className="text-xs text-gray-300 font-bold italic uppercase tracking-widest">No Students Enrolled Yet</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'announcements' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4">
               <div className="w-2 h-8 bg-[#00479d] rounded-full"></div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tighter">공지사항</h1>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-50">
                {ANNOUNCEMENTS.map(announcement => (
                  <li key={announcement.id} className="p-8 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-gray-900 group-hover:text-[#00479d] transition-colors">{announcement.title}</h3>
                        <p className="text-sm text-gray-400 font-medium mt-2 leading-relaxed">{announcement.content}</p>
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{announcement.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-6 opacity-30 flex justify-center gap-4 grayscale">
             <img src="https://www.oikos.ac.kr/images/common/logo.png" alt="Oikos Logo" className="h-8" />
          </div>
          <p className="text-gray-400 text-sm font-black tracking-widest uppercase">OIKOS University AI Convergence LMS</p>
          <p className="text-gray-300 text-[10px] mt-4 font-bold tracking-[0.3em] uppercase">Persistent Cloud Sync V{DB_VERSION}</p>
          <div className="mt-8 flex justify-center gap-6">
             <span className="w-2 h-2 bg-blue-100 rounded-full"></span>
             <span className="w-2 h-2 bg-blue-100 rounded-full"></span>
             <span className="w-2 h-2 bg-blue-100 rounded-full"></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
