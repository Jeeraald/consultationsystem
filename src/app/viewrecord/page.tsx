"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
  idNumber: string;
  firstName: string;
  lastName: string;
  attendance: number;
  activity1: number;
  activity2: number;
  activity3: number;
  assignment1: number;
  assignment2: number;
  assignment3: number;
  assignment4: number;
  quiz1: number;
  quiz2: number;
  quiz3: number;
  quiz4: number;
  quiz5: number;
  prelim: number;
  midtermwrittenexam: number;
  midtermlabexam: number;
  midtermGrade: number;
}

export default function ViewRecordPage() {
  const router = useRouter();
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    const record = sessionStorage.getItem("studentRecord");
    if (record) setStudentData(JSON.parse(record));
    else router.push("/"); // redirect if no data
  }, [router]);

  if (!studentData) return null;

  const lectureWeight = 0.67;
  const labWeight = 0.33;

  const formatScore = (value: number | undefined) => {
    if (value === -1) return "Missing";
    if (value === null || value === undefined) return "";
    return value;
  };

  const gradeColor = studentData.midtermGrade >= 3.25 ? "text-red-600" : "text-green-600";
  const fullName = `${studentData.lastName?.toUpperCase()}, ${studentData.firstName?.toUpperCase()}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-4 sm:p-6 md:p-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 text-center mb-4">
          Computer Programming 1 Midterm
        </h1>

        {/* Student Info */}
        <div className="mb-6 text-gray-700 text-center text-sm sm:text-base">
          <p className="font-semibold">
            Name: <span className="font-bold">{fullName}</span>
          </p>
          <p>ID Number: {studentData.idNumber}</p>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm sm:text-base">
            <thead>
              <tr className="bg-blue-100 text-gray-800">
                <th className="px-2 sm:px-4 py-2 border">Category</th>
                <th className="px-2 sm:px-4 py-2 border">Weight</th>
                <th className="px-2 sm:px-4 py-2 border">Component</th>
                <th className="px-2 sm:px-4 py-2 border">Score</th>
              </tr>
            </thead>
            <tbody>
              {/* Lecture Section */}
              <tr className="bg-gray-50">
                <td className="px-2 sm:px-4 py-2 border font-semibold" rowSpan={7}>
                  Lecture ({(lectureWeight * 100).toFixed(0)}%)
                </td>
                <td className="px-2 sm:px-4 py-2 border font-semibold">20%</td>
                <td className="px-2 sm:px-4 py-2 border">Attendance</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.attendance)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-2 sm:px-4 py-2 border font-semibold" rowSpan={5}>
                  40%
                </td>
                <td className="px-2 sm:px-4 py-2 border">Quiz 1</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.quiz1)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-2 sm:px-4 py-2 border">Quiz 2</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.quiz2)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-2 sm:px-4 py-2 border">Quiz 3</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.quiz3)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-2 sm:px-4 py-2 border">Quiz 4</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.quiz4)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-2 sm:px-4 py-2 border">Prelim</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.prelim)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-2 sm:px-4 py-2 border font-semibold">40%</td>
                <td className="px-2 sm:px-4 py-2 border">Midterm Exam</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.midtermwrittenexam)}</td>
              </tr>

              {/* Laboratory Section */}
              <tr className="bg-gray-100">
                <td className="px-2 sm:px-4 py-2 border font-semibold" rowSpan={3}>
                  Laboratory ({(labWeight * 100).toFixed(0)}%)
                </td>
                <td className="px-2 sm:px-4 py-2 border font-semibold">60%</td>
                <td className="px-2 sm:px-4 py-2 border">Assignment 1</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.assignment1)}</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-2 sm:px-4 py-2 border font-semibold">60%</td>
                <td className="px-2 sm:px-4 py-2 border">Activity 1</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.activity1)}</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-2 sm:px-4 py-2 border font-semibold">40%</td>
                <td className="px-2 sm:px-4 py-2 border">Midterm Lab Exam</td>
                <td className="px-2 sm:px-4 py-2 border">{formatScore(studentData.midtermlabexam)}</td>
              </tr>

              {/* Total Midterm */}
              <tr className="bg-blue-100 font-bold">
                <td className="px-2 sm:px-4 py-2 border text-right" colSpan={3}>
                  Midterm Grade
                </td>
                <td className={`px-2 sm:px-4 py-2 border text-left ${gradeColor}`}>
                  {formatScore(studentData.midtermGrade)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Button Section */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-1/2 md:w-1/3 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 shadow-md transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
