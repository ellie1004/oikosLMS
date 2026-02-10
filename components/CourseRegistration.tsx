
import React from 'react';
import { COURSES } from '../constants';
import { User } from '../types';

interface CourseRegistrationProps {
  user: User;
  onRegister: (courseId: string) => void;
  onUnregister: (courseId: string) => void;
}

export const CourseRegistration: React.FC<CourseRegistrationProps> = ({ user, onRegister, onUnregister }) => {
  const registeredIds = user.registeredCourseIds || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">2026년 봄학기 수강신청</h1>
        <p className="text-gray-500 mt-2">원하시는 과목을 선택하여 신청해주세요. 신청 즉시 나의 강의실에 반영됩니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {COURSES.map(course => {
          const isRegistered = registeredIds.includes(course.id);
          
          return (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  {course.type && (
                    <span className="px-2 py-0.5 bg-blue-50 text-[#00479d] text-[10px] font-bold rounded">
                      {course.type}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">{course.titleEn} | {course.instructor}</p>
                <p className="text-sm text-gray-600 max-w-2xl">{course.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.dates.map((date, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded border border-gray-100">
                      {date}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center">
                {isRegistered ? (
                  <button
                    onClick={() => onUnregister(course.id)}
                    className="w-full md:w-32 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100"
                  >
                    신청취소
                  </button>
                ) : (
                  <button
                    onClick={() => onRegister(course.id)}
                    className="w-full md:w-32 px-6 py-3 bg-[#00479d] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-md"
                  >
                    신청하기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
        <h4 className="font-bold text-[#00479d] mb-2">수강신청 유의사항</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>수강신청 기간 외에는 신청 및 취소가 불가능합니다.</li>
          <li>졸업 학점 이수 대상자는 별도의 신청 없이 강의에 참여 가능합니다.</li>
          <li>문의사항은 최영준 교수(010-8534-0387)에게 연락 바랍니다.</li>
        </ul>
      </div>
    </div>
  );
};
