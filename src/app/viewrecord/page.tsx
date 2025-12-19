"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
  idNumber: string;
  firstName: string;
  lastName: string;
  attendance: number | string;
  oral: number | string;
  pasiugda1: number | string;
  pasiugda2: number | string;
  pasiugda3: number | string;
  pasiugda4: number | string;
  prefinal: number | string;
  finalWritten: number | string;
  individualGrade: number | string;
  groupGrade: number | string;
  finalLab: number | string;
  finalGrade: number | string; // added field
}

export default function ViewRecordPage() {
  const router = useRouter();
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  const normalizeNumber = (val: unknown, fallback = 0) => {
    if (val === undefined || val === null || val === "") return fallback;
    const n = Number(val);
    return Number.isNaN(n) ? fallback : n;
  };

  useEffect(() => {
    const record = sessionStorage.getItem("studentRecord");
    if (record) {
      const parsed = JSON.parse(record);
      setStudentData({
        ...parsed,
        attendance: normalizeNumber(parsed.attendance),
        oral: normalizeNumber(parsed.oral),
        pasiugda1: normalizeNumber(parsed.pasiugda1),
        pasiugda2: normalizeNumber(parsed.pasiugda2),
        pasiugda3: normalizeNumber(parsed.pasiugda3),
        pasiugda4: normalizeNumber(parsed.pasiugda4),
        prefinal: normalizeNumber(parsed.prefinal),
        finalWritten: normalizeNumber(parsed.finalWritten),
        individualGrade: normalizeNumber(parsed.individualGrade),
        groupGrade: normalizeNumber(parsed.groupGrade),
        finalLab: normalizeNumber(parsed.finalLab),
        finalGrade: normalizeNumber(parsed.finalGrade), // kept as is
      });
    } else {
      router.push("/");
    }
  }, [router]);

  if (!studentData) return null;

  const formatScore = (value: number | string | undefined) => {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(value);
    if (!Number.isNaN(num)) {
      if (num === -1) return <span className="text-red-600 italic">Missed</span>;
      return num;
    }
    return value;
  };

  const formatFinalGrade = (value: number | string) => {
    const num = Number(value);
    return Number.isNaN(num) ? "0.00" : num.toFixed(2); // just display, no calculation
  };

  const gradeColor =
    Number(studentData.finalGrade) >= 3.25
      ? "text-red-600 font-bold"
      : "text-green-600 font-bold";

  const fullName = `${studentData.lastName.toUpperCase()}, ${studentData.firstName.toUpperCase()}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-4xl p-6 border">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
          Computer Programming 1
        </h1>
        <div className="text-center mb-6 text-black">
          <p className="font-semibold">Name: {fullName}</p>
          <p>ID Number: {studentData.idNumber}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-black">
            <thead>
              <tr className="bg-blue-100">
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Weight</th>
                <th className="border px-4 py-2">Component</th>
                <th className="border px-4 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {/* CLASS STANDING */}
              <tr>
                <td className="border px-4 py-2 font-semibold" rowSpan={10}>
                  Lecture (67%)
                </td>
                <td className="border px-4 py-2 font-semibold">10%</td>
                <td className="border px-4 py-2">Attendance</td>
                <td className="border px-4 py-2">{formatScore(studentData.attendance)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold" rowSpan={6}>
                  40%
                </td>
                <td className="border px-4 py-2">Oral</td>
                <td className="border px-4 py-2">{formatScore(studentData.oral)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Pasiugda Day 1</td>
                <td className="border px-4 py-2">{formatScore(studentData.pasiugda1)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Pasiugda Day 2</td>
                <td className="border px-4 py-2">{formatScore(studentData.pasiugda2)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Pasiugda Day 3</td>
                <td className="border px-4 py-2">{formatScore(studentData.pasiugda3)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Pasiugda Day 4</td>
                <td className="border px-4 py-2">{formatScore(studentData.pasiugda4)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Prefinal</td>
                <td className="border px-4 py-2">{formatScore(studentData.prefinal)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">30%</td>
                <td className="border px-4 py-2">Final Written</td>
                <td className="border px-4 py-2">{formatScore(studentData.finalWritten)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold" rowSpan={2}>
                  20%
                </td>
                <td className="border px-4 py-2">Individual Grade</td>
                <td className="border px-4 py-2">{formatScore(studentData.individualGrade)}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Group Grade</td>
                <td className="border px-4 py-2">{formatScore(studentData.groupGrade)}</td>
              </tr>
              {/* FINAL LAB */}
              <tr className="bg-gray-50">
                <td className="border px-4 py-2 font-semibold">Laboratory (33%)</td>
                <td className="border px-4 py-2 font-semibold">100%</td>
                <td className="border px-4 py-2">Final Laboratory Exam</td>
                <td className="border px-4 py-2">{formatScore(studentData.finalLab)}</td>
              </tr>
              {/* FINAL GRADE */}
              <tr className="bg-blue-100 font-bold">
                <td colSpan={3} className="border px-4 py-2 text-right">
                  Final Grade
                </td>
                <td className={`border px-4 py-2 ${gradeColor}`}>
                  {formatFinalGrade(studentData.finalGrade)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
