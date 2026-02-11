
import React, { useState, useEffect, useCallback } from 'react';
import { User, Role, Resource } from './types';
import { COURSES, ANNOUNCEMENTS, AUTHORIZED_PROFESSORS, AUTHORIZED_ADMINS, RESOURCES } from './constants';
import { Navbar } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CourseDetail } from './components/CourseDetail';
import { CourseRegistration } from './components/CourseRegistration';
import { storageService } from './services/storageService';
import { cloudService } from './services/cloudService';

const DB_VERSION = "2.0.0 (Powered by Firebase)"; 

const LogoIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M256 32L64 96V224C64 341.2 145.6 449.2 256 480C366.4 449.2 448 341.2 448 224V96L256 32Z" fill="#FF8C00"/>
    <path d="M256 120L180 320H215L230 280H282L297 320H332L256 120ZM240 250L256 205L272 250H240Z" fill="white"/>
    <circle cx="360" cy="180" r="8" fill="white"/>
    <path d="M360 188V240M360 240L380 260M360 240L340 260" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="360" cy="300" r="8" fill="white"/>
    <path d="M360 292V270" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="150" cy="280" r="6" fill="white"/>
    <path d="M150 274V220" stroke="white" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Database States
  const [globalStudents, setGlobalStudents] = useState<any[]>([]);
  const [globalResources, setGlobalResources] = useState<Resource[]>([]);

  // Login form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [rememberEmail, setRememberEmail] = useState(false);

  // Cloud Sync Data Fetching
  const refreshCloudData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const students = await cloudService.fetchStudents();
      if (students) {
        setGlobalStudents(students);
        // Update local session if current user exists in cloud
        const savedUserStr = localStorage.getItem('OIKOS_LMS_V1.1_current_user');
        if (savedUserStr) {
          const currentUser = JSON.parse(savedUserStr);
          const me = students.find((s: any) => s.email.toLowerCase() === currentUser.email.toLowerCase());
          if (me) {
            const updatedUser = { ...currentUser, name: me.name || currentUser.name, registeredCourseIds: me.registeredCourseIds };
            setUser(updatedUser);
            localStorage.setItem('OIKOS_LMS_V1.1_current_user', JSON.stringify(updatedUser));
          }
        }
      }
    } catch (e) {
      console.error("Cloud Refresh Failed", e);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const localStudents = storageService.load<any[]>('global_students', []);
        const resources = storageService.load<Resource[]>('global_resources', RESOURCES);
        const savedEmail = localStorage.getItem('OIKOS_LMS_REMEMBERED_EMAIL');
        const savedUserStr = localStorage.getItem('OIKOS_LMS_V1.1_current_user');

        setGlobalResources(resources);
        if (savedEmail) { setEmail(savedEmail); setRememberEmail(true); }
        if (savedUserStr) { setUser(JSON.parse(savedUserStr)); }
        
        // Fetch from Firebase
        const cloudStudents = await cloudService.fetchStudents();
        if (cloudStudents) setGlobalStudents(cloudStudents);
        else setGlobalStudents(localStudents);

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    initData();
  }, []);

  // Sync to LocalStorage as fallback
  useEffect(() => {
    if (isLoading) return;
    storageService.save('global_students', globalStudents);
    storageService.save('global_resources', globalResources);
  }, [globalStudents, globalResources, isLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let finalName = name.trim();
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
      // Student login: check cloud first
      const existingStudent = globalStudents.find(s => s.email.toLowerCase() === normalizedEmail);
      if (existingStudent) {
        finalName = existingStudent.name || name.trim();
        finalRegisteredIds = existingStudent.registeredCourseIds || [];
      }
      if (!finalName) { setError('성함을 입력해주세요.'); return; }
    }

    const newUser: User = { email: normalizedEmail, name: finalName, role, registeredCourseIds: finalRegisteredIds };
    
    if (rememberEmail) localStorage.setItem('OIKOS_LMS_REMEMBERED_EMAIL', normalizedEmail);
    else localStorage.removeItem('OIKOS_LMS_REMEMBERED_EMAIL');

    setUser(newUser);
    localStorage.setItem('OIKOS_LMS_V1.1_current_user', JSON.stringify(newUser));

    if (role === Role.STUDENT) {
      const studentData = { name: finalName, email: normalizedEmail, registeredCourseIds: finalRegisteredIds };
      setGlobalStudents(prev => {
        const idx = prev.findIndex(s => s.email.toLowerCase() === normalizedEmail);
        if (idx === -1) return [...prev, studentData];
        const updated = [...prev];
        updated[idx] = studentData;
        return updated;
      });
      
      setIsSyncing(true);
      await cloudService.syncStudent(studentData);
      setIsSyncing(false);
    }
    setActiveView('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('OIKOS_LMS_V1.1_current_user');
    setActiveView('home');
    setSelectedCourseId(null);
  };

  const handleRegisterCourse = async (courseId: string) => {
    if (!user) return;
    const currentRegistered = user.registeredCourseIds || [];
    if (currentRegistered.includes(courseId)) return;

    const updatedIds = [...currentRegistered, courseId];
    const updatedUser = { ...user, registeredCourseIds: updatedIds };
    setUser(updatedUser);
    localStorage.setItem('OIKOS_LMS_V1.1_current_user', JSON.stringify(updatedUser));

    const studentInfo = { name: user.name, email: user.email, registeredCourseIds: updatedIds };
    
    setGlobalStudents(prev => {
      const existingIdx = prev.findIndex(s => s.email.toLowerCase() === user.email.toLowerCase());
      if (existingIdx > -1) {
        const newStudents = [...prev];
        newStudents[existingIdx] = studentInfo;
        return newStudents;
      }
      return [...prev, studentInfo];
    });

    setIsSyncing(true);
    await cloudService.syncStudent(studentInfo);
    setIsSyncing(false);
  };

  const handleUnregisterCourse = async (courseId: string) => {
    if (!user) return;
    const updatedIds = (user.registeredCourseIds || []).filter(id => id !== courseId);
    const updatedUser = { ...user, registeredCourseIds: updatedIds };
    setUser(updatedUser);
    localStorage.setItem('OIKOS_LMS_V1.1_current_user', JSON.stringify(updatedUser));

    const studentInfo = { name: user.name, email: user.email, registeredCourseIds: updatedIds };
    
    setGlobalStudents(prev => prev.map(s => 
      s.email.toLowerCase() === user.email.toLowerCase() ? studentInfo : s
    ));

    setIsSyncing(true);
    await cloudService.syncStudent(studentInfo);
    setIsSyncing(false);
  };

  const handleAddResource = (newResource: Resource) => {
    setGlobalResources(prev => [newResource, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-6 font-['Noto_Sans_KR']">
        <div className="text-center space-y-4">
          <LogoIcon className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-gray-400 font-black text-sm tracking-[0.3em] uppercase">Oikos University AI Convergence LMS</h2>
          <p className="text-gray-300 text-[10px] font-bold tracking-[0.4em] uppercase">Cloud Engine Loading...</p>
        </div>
        <div className="flex gap-2">
           <div className="w-2 h-2 bg-[#00479d] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
           <div className="w-2 h-2 bg-[#00479d] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
           <div className="w-2 h-2 bg-[#00479d] rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 font-['Noto_Sans_KR']">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00479d]"></div>
          <div className="text-center mb-10">
            <LogoIcon className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-4xl font-black text-[#00479d] tracking-tighter text-center">OIKOS AI LMS</h1>
            <p className="text-gray-400 mt-3 font-bold uppercase text-[10px] tracking-[0.2em] text-center">Cloud Synchronized System</p>
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
      <Navbar user={user} onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-4 h-6">
           <div className="flex gap-4">
             {isSyncing ? (
               <span className="text-[10px] font-black text-orange-500 animate-pulse flex items-center gap-2">
                 <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 FIREBASE CLOUD SYNCING...
               </span>
             ) : (
               <button onClick={refreshCloudData} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 FIREBASE CONNECTED
               </button>
             )}
           </div>
           <span className="text-[9px] font-black text-gray-400 flex items-center gap-1">
             OIKOS UNIVERSITY ENGINE V{DB_VERSION}
           </span>
        </div>

        {activeView === 'home' && (
          <div className="space-y-8">
            <Dashboard user={user} setActiveView={setActiveView} setSelectedCourseId={setSelectedCourseId} />
            
            {(user.role === Role.ADMIN || user.role === Role.PROFESSOR) && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-blue-50 pb-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-black text-blue-800 uppercase">Cloud Students Directory</h3>
                    <p className="text-sm text-blue-600/70 font-bold mt-1">Firestore 기반 수강생: <span className="text-blue-900">{globalStudents.length}명</span></p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={refreshCloudData} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:scale-105 transition-transform">명단 동기화</button>
                  </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-8 bg-[#00479d] rounded-full"></div>
                 <h1 className="text-3xl font-black text-gray-900 tracking-tighter">실시간 수강 및 출석 현황</h1>
              </div>
              <button onClick={refreshCloudData} className="px-4 py-2 bg-blue-50 text-[#00479d] rounded-xl text-xs font-black hover:bg-blue-100 transition-all flex items-center gap-2">
                <svg className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                서버 데이터 동기화
              </button>
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

      <footer className="bg-white border-t border-gray-100 pt-16 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-8 flex flex-col items-center">
             <a href="https://www.oikos.ai.kr/" target="_blank" rel="noreferrer" className="flex items-center gap-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                <LogoIcon className="h-12 w-12" />
                <span className="text-sm font-black text-gray-700">OIKOS UNIVERSITY</span>
             </a>
          </div>
          
          <div className="space-y-2">
            <p className="text-[#00479d] text-sm font-black tracking-widest uppercase">AI Convergence Learning Management System</p>
            <p className="text-gray-400 text-xs font-bold">문의 - 최영준 교수 010 8534 0387</p>
          </div>
          <p className="mt-8 text-[10px] text-gray-300 font-medium">&copy; 2026 Oikos University. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
