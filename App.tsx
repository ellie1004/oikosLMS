
import React, { useState, useEffect } from 'react';
import { User, Role, Course } from './types';
import { COURSES, ANNOUNCEMENTS, AUTHORIZED_PROFESSORS } from './constants';
import { Navbar } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CourseDetail } from './components/CourseDetail';
import { CourseRegistration } from './components/CourseRegistration';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [rememberEmail, setRememberEmail] = useState(false);

  useEffect(() => {
    // Load saved email if exists
    const savedEmail = localStorage.getItem('lms_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }

    const savedUser = localStorage.getItem('lms_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalName = name;

    // Professor restriction check
    if (role === Role.PROFESSOR) {
      const professor = AUTHORIZED_PROFESSORS.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!professor) {
        setError('등록되지 않은 교수 이메일입니다. 다시 확인해주세요.');
        return;
      }
      finalName = professor.name; // Automatically use authorized name
    }

    if (email && (role === Role.PROFESSOR || finalName)) {
      const newUser: User = { 
        email, 
        name: finalName, 
        role, 
        registeredCourseIds: role === Role.STUDENT ? [] : COURSES.map(c => c.id) 
      };

      // Email saving logic
      if (rememberEmail) {
        localStorage.setItem('lms_remembered_email', email);
      } else {
        localStorage.removeItem('lms_remembered_email');
      }

      setUser(newUser);
      localStorage.setItem('lms_user', JSON.stringify(newUser));
      setActiveView('home');
    } else {
      setError('모든 정보를 정확히 입력해주세요.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
    setActiveView('home');
    setSelectedCourseId(null);
  };

  const handleRegisterCourse = (courseId: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      registeredCourseIds: [...(user.registeredCourseIds || []), courseId]
    };
    setUser(updatedUser);
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
    
    // Simulating "auto-update" of attendance for the device
    // In a real app, this would be pushed to a DB that the professor reads.
  };

  const handleUnregisterCourse = (courseId: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      registeredCourseIds: (user.registeredCourseIds || []).filter(id => id !== courseId)
    };
    setUser(updatedUser);
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#00479d] tracking-tight">OIKOS AI LMS</h1>
            <p className="text-gray-500 mt-2 font-medium">AI융합학과 학습관리시스템</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">이메일</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="example@oikos.ac.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {role !== Role.PROFESSOR && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">성함</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">접속 권한</label>
              <div className="grid grid-cols-3 gap-2">
                {[Role.STUDENT, Role.PROFESSOR, Role.ADMIN].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setError(null);
                    }}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${role === r ? 'bg-[#00479d] border-[#00479d] text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {r === Role.STUDENT ? '학생' : r === Role.PROFESSOR ? '교수' : '관리자'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                className="h-4 w-4 text-[#00479d] focus:ring-[#00479d] border-gray-300 rounded" 
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-600 cursor-pointer">이메일 기억하기</label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-[#00479d] text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-blue-800 transition-all active:scale-[0.98]"
            >
              로그인
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400">© 2026 AI융합학과 LMS. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedCourse = COURSES.find(c => c.id === selectedCourseId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'home' && (
          <div className="space-y-8">
            <Dashboard 
              user={user} 
              setActiveView={setActiveView} 
              setSelectedCourseId={setSelectedCourseId} 
            />
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#00479d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  학과 공식 홈페이지
                </h3>
                <a href="https://www.oikos.ai.kr/" target="_blank" rel="noreferrer" className="text-xs text-[#00479d] hover:underline font-bold">새 창에서 열기</a>
              </div>
              <iframe 
                src="https://www.oikos.ai.kr/" 
                className="flex-grow w-full border-none" 
                title="Department Homepage"
              />
            </div>
          </div>
        )}

        {activeView === 'registration' && user.role === Role.STUDENT && (
          <CourseRegistration 
            user={user} 
            onRegister={handleRegisterCourse} 
            onUnregister={handleUnregisterCourse} 
          />
        )}

        {activeView === 'courses' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">나의 강의실</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COURSES.filter(c => user.role !== Role.STUDENT || user.registeredCourseIds?.includes(c.id)).map(course => (
                <div 
                  key={course.id}
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setActiveView('course-detail');
                  }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="h-32 bg-gradient-to-br from-[#00479d] to-blue-600 p-6 flex flex-col justify-end">
                    <span className="text-blue-100 text-xs font-medium mb-1">{course.instructor}</span>
                    <h3 className="text-white font-bold leading-tight group-hover:underline">
                      {course.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">{course.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>강의 횟수: {course.dates.length}회</span>
                      <span className="text-[#00479d] font-bold">강의실 입장 &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
              {(user.role === Role.STUDENT && (!user.registeredCourseIds || user.registeredCourseIds.length === 0)) && (
                <div 
                  onClick={() => setActiveView('registration')}
                  className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-[#00479d] hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-[#00479d] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <h3 className="font-bold text-gray-800">수강신청 하러가기</h3>
                  <p className="text-xs text-gray-500 mt-1">아직 신청한 과목이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'course-detail' && selectedCourse && (
          <CourseDetail 
            course={selectedCourse} 
            user={user} 
            onBack={() => setActiveView('courses')} 
          />
        )}

        {activeView === 'announcements' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {ANNOUNCEMENTS.map(announcement => (
                  <li key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="px-2 py-0.5 bg-blue-50 text-[#00479d] text-[10px] font-bold rounded">공지</span>
                          <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{announcement.content}</p>
                      </div>
                      <div className="flex items-center text-xs text-gray-400 whitespace-nowrap">
                        <span className="mr-3">{announcement.author}</span>
                        <span>{announcement.date}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeView === 'attendance' && user.role === Role.PROFESSOR && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">출석 통합 관리</h1>
            <p className="text-gray-500">교수님께서 담당하시는 과목별 출석 현황을 확인하고 수정할 수 있습니다.</p>
            <div className="grid grid-cols-1 gap-4">
              {COURSES.filter(c => c.instructor.includes(user.name) || user.role === Role.ADMIN).map(course => (
                <div 
                  key={course.id} 
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{course.dates.join(', ')}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveView('course-detail');
                    }}
                    className="px-4 py-2 border border-[#00479d] text-[#00479d] rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    명단 확인
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#00479d] font-bold text-xl">
                <span>OIKOS UNIVERSITY</span>
              </div>
              <div className="text-sm text-gray-500 leading-relaxed">
                <p className="font-bold text-gray-700">OFFICE OF ADMISSIONS, OIKOS UNIVERSITY</p>
                <p>7901 Oakport St. Suite 3000, Oakland, CA 94621</p>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end gap-2">
              <p className="text-sm text-gray-600">
                <span className="font-bold">문의하기 : </span>
                <a href="tel:01085340387" className="text-[#00479d] hover:underline font-bold">최영준교수 010-8534-0387</a>
              </p>
              <div className="flex space-x-4 text-xs text-gray-400">
                <a href="#" className="hover:text-gray-600">이용약관</a>
                <span>|</span>
                <a href="#" className="hover:text-gray-600 font-bold">개인정보처리방침</a>
                <span>|</span>
                <a href="https://www.oikos.ai.kr/" className="hover:text-gray-600">학과 홈페이지</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-300 uppercase tracking-widest">© 2026 Oikos AI Convergence Department LMS | All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
