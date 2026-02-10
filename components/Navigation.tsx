
import React from 'react';
import { User, Role } from '../types';

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavigationProps> = ({ user, onLogout, activeView, setActiveView }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer" 
              onClick={() => setActiveView('home')}
            >
              <span className="text-xl font-bold text-[#00479d]">OIKOS AI LMS</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-[10px] text-gray-500 rounded uppercase tracking-wider">2026 Spring</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <button
                onClick={() => setActiveView('home')}
                className={`${activeView === 'home' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all`}
              >
                홈
              </button>
              
              {user?.role === Role.STUDENT && (
                <button
                  onClick={() => setActiveView('registration')}
                  className={`${activeView === 'registration' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all`}
                >
                  수강신청
                </button>
              )}

              <button
                onClick={() => setActiveView('courses')}
                className={`${activeView === 'courses' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all`}
              >
                나의 강의실
              </button>
              
              <button
                onClick={() => setActiveView('announcements')}
                className={`${activeView === 'announcements' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all`}
              >
                공지사항
              </button>
              
              {user?.role === Role.PROFESSOR && (
                <button
                  onClick={() => setActiveView('attendance')}
                  className={`${activeView === 'attendance' ? 'border-[#00479d] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all`}
                >
                  출석 관리
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 hidden md:inline">
                  <span className="font-bold">{user.name}</span>
                  <span className="ml-1 text-gray-400">({user.role === Role.STUDENT ? '학생' : user.role === Role.PROFESSOR ? '교수' : '관리자'})</span>
                </span>
                <button
                  onClick={onLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
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
