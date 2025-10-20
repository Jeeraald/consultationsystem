"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
  idNumber: string;
  firstName: string;
  lastName: string;
  attendance: number | string;
  activity1: number | string;
  assignment1: number | string;
  quiz1: number | string;
  quiz2: number | string;
  quiz3: number | string;
  quiz4: number | string;
  prelim: number | string;
  midtermwrittenexam: number | string;
  midtermlabexam: number | string;
  midtermGrade: number | string;
}

export default function ViewRecordPage() {
  const router = useRouter();
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    const record = sessionStorage.getItem("studentRecord");
    if (record) setStudentData(JSON.parse(record));
    else router.push("/"); // redirect if no data found
  }, [router]);

  if (!studentData) return null;

  // ✅ Show "Missed" if -1 (italic, red text only)
  const formatScore = (value: number | string | undefined) => {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(value);
    if (!Number.isNaN(num)) {
      if (num === -1) {
        return <span className="text-red-600 italic">Missed</span>;
      }
      return Number.isInteger(num) ? num : Number(num.toFixed(2));
    }
    return value;
  };

  // ✅ Color based on grade value
  const gradeNum = Number(studentData.midtermGrade);
  const gradeColor =
    !Number.isNaN(gradeNum) && gradeNum >= 3.25
      ? "text-red-600 font-bold"
      : "text-green-600 font-bold";

  const fullName = `${String(studentData.lastName || "").toUpperCase()}, ${String(
    studentData.firstName || ""
  ).toUpperCase()}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-4xl p-6 border border-gray-200">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 text-center mb-6">
          Computer Programming 1 - Midterm Record
        </h1>

        {/* Student Info */}
        <div className="mb-6 text-black text-center">
          <p className="font-semibold">
            Name: <span className="font-bold">{fullName}</span>
          </p>
          <p>ID Number: {studentData.idNumber}</p>
        </div>

        {/* Record Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm sm:text-base text-black">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Weight</th>
                <th className="px-4 py-2 border">Component</th>
                <th className="px-4 py-2 border">Score</th>
              </tr>
            </thead>
            <tbody>
              {/* Lecture Section */}
              <tr>
                <td className="px-4 py-2 border font-semibold" rowSpan={7}>
                  Lecture (67%)
                </td>
                <td className="px-4 py-2 border font-semibold">20%</td>
                <td className="px-4 py-2 border">Attendance</td>
                <td className="px-4 py-2 border">{formatScore(studentData.attendance)}</td>
              </tr>

              <tr>
                <td className="px-4 py-2 border font-semibold" rowSpan={5}>
                  40%
                </td>
                <td className="px-4 py-2 border">Quiz 1</td>
                <td className="px-4 py-2 border">{formatScore(studentData.quiz1)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border">Quiz 2</td>
                <td className="px-4 py-2 border">{formatScore(studentData.quiz2)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border">Quiz 3</td>
                <td className="px-4 py-2 border">{formatScore(studentData.quiz3)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border">Quiz 4</td>
                <td className="px-4 py-2 border">{formatScore(studentData.quiz4)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border">Prelim</td>
                <td className="px-4 py-2 border">{formatScore(studentData.prelim)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border font-semibold">40%</td>
                <td className="px-4 py-2 border">Midterm Exam</td>
                <td className="px-4 py-2 border">{formatScore(studentData.midtermwrittenexam)}</td>
              </tr>

              {/* Laboratory Section */}
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border font-semibold" rowSpan={3}>
                  Laboratory (33%)
                </td>
                <td className="px-4 py-2 border font-semibold">30%</td>
                <td className="px-4 py-2 border">Assignment 1</td>
                <td className="px-4 py-2 border">{formatScore(studentData.assignment1)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border font-semibold">30%</td>
                <td className="px-4 py-2 border">Activity 1</td>
                <td className="px-4 py-2 border">{formatScore(studentData.activity1)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border font-semibold">40%</td>
                <td className="px-4 py-2 border">Midterm Lab Exam</td>
                <td className="px-4 py-2 border">{formatScore(studentData.midtermlabexam)}</td>
              </tr>

              {/* Midterm Grade */}
              <tr className="bg-blue-100 font-bold">
                <td className="px-4 py-2 border text-right" colSpan={3}>
                  Midterm Grade
                </td>
                <td className={`px-4 py-2 border ${gradeColor}`}>
                  {formatScore(studentData.midtermGrade)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Back Button */}
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
