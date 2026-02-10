
import React from 'react';
import { User, Role } from '../types';

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const LogoIcon = () => (
  <svg className="w-8 h-8 mr-2" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export const Navbar: React.FC<NavigationProps> = ({ user, onLogout, activeView, setActiveView }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group" 
              onClick={() => setActiveView('home')}
            >
              <LogoIcon />
              <div>
                <span className="text-xl font-black text-[#00479d] tracking-tighter">OIKOS AI LMS</span>
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-[9px] text-gray-500 rounded uppercase font-bold tracking-wider">2026 Spring</span>
              </div>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <button
                onClick={() => setActiveView('home')}
                className={`${activeView === 'home' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-black transition-all`}
              >
                홈
              </button>
              
              {user?.role === Role.STUDENT && (
                <button
                  onClick={() => setActiveView('registration')}
                  className={`${activeView === 'registration' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-black transition-all`}
                >
                  수강신청
                </button>
              )}

              <button
                onClick={() => setActiveView('courses')}
                className={`${activeView === 'courses' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-black transition-all`}
              >
                나의 강의실
              </button>
              
              <button
                onClick={() => setActiveView('announcements')}
                className={`${activeView === 'announcements' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-black transition-all`}
              >
                공지사항
              </button>
              
              {user?.role === Role.PROFESSOR && (
                <button
                  onClick={() => setActiveView('attendance')}
                  className={`${activeView === 'attendance' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-black transition-all`}
                >
                  출석 관리
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-700 hidden md:inline">
                  <span className="font-black">{user.name}</span>
                  <span className="ml-1 text-gray-400 font-bold">({user.role === Role.STUDENT ? '학생' : user.role === Role.PROFESSOR ? '교수' : '관리자'})</span>
                </span>
                <button
                  onClick={onLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-black transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
