"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

interface StudentRecord {
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

export default function UploadRecord() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "classrecord"), (snapshot) => {
      const data: StudentRecord[] = snapshot.docs.map((d) => ({
        idNumber: d.id,
        ...(d.data() as object),
      })) as StudentRecord[];
      setRecords(data);
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file first.");
      return;
    }

    setStatus("Reading Excel file...");
    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length <= 1) {
          setStatus("❌ No student records found in the file.");
          setIsUploading(false);
          return;
        }

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const idNumber = row[0] ? String(row[0]).trim() : "";
          const lastName = row[1] ? String(row[1]).trim() : "";
          const firstName = row[2] ? String(row[2]).trim() : "";

          if (!idNumber || !firstName || !lastName) continue;

          const dataToSave: StudentRecord = {
            idNumber,
            firstName,
            lastName,
            attendance: Number(row[3]) || 0,
            activity1: Number(row[4]) || 0,
            activity2: Number(row[5]) || 0,
            activity3: Number(row[6]) || 0,
            assignment1: Number(row[7]) || 0,
            assignment2: Number(row[8]) || 0,
            assignment3: Number(row[9]) || 0,
            assignment4: Number(row[10]) || 0,
            quiz1: Number(row[11]) || 0,
            quiz2: Number(row[12]) || 0,
            quiz3: Number(row[13]) || 0,
            quiz4: Number(row[14]) || 0,
            quiz5: Number(row[15]) || 0,
            prelim: Number(row[16]) || 0,
            midtermwrittenexam: Number(row[17]) || 0,
            midtermlabexam: Number(row[18]) || 0,
            midtermGrade: Number(row[19]) || 0,
          };

          await setDoc(doc(collection(db, "classrecord"), idNumber), dataToSave, {
            merge: true,
          });

          setStatus(`Uploading record ${i} of ${rows.length - 1}...`);
        }

        setStatus("✅ Upload complete! All student data saved to Firestore.");
      } catch (error) {
        console.error(error);
        setStatus("❌ Upload failed. Please check the file format.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const normalized = (v: unknown) =>
    (v === undefined || v === null ? "" : String(v)).toLowerCase();

  const filteredRecords = records.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      normalized(r.idNumber).includes(q) ||
      normalized(r.firstName).includes(q) ||
      normalized(r.lastName).includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-7xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Upload Class Record
        </h1>

        {/* Search (left) and Upload (right) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Search on left */}
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-full md:w-1/3"
          />

          {/* Upload on right */}
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-6 py-2 rounded text-white font-semibold ${
                isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {status && (
          <p className="text-center mb-6 text-gray-700 font-medium">{status}</p>
        )}

        {/* Table */}
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto max-h-[70vh] border rounded-lg">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-blue-100 text-blue-900 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="border px-3 py-2">ID Number</th>
                  <th className="border px-3 py-2">Last Name</th>
                  <th className="border px-3 py-2">First Name</th>
                  <th className="border px-3 py-2">Attendance</th>
                  <th className="border px-3 py-2">Activity 1</th>
                  <th className="border px-3 py-2">Activity 2</th>
                  <th className="border px-3 py-2">Activity 3</th>
                  <th className="border px-3 py-2">Assignment 1</th>
                  <th className="border px-3 py-2">Assignment 2</th>
                  <th className="border px-3 py-2">Assignment 3</th>
                  <th className="border px-3 py-2">Assignment 4</th>
                  <th className="border px-3 py-2">Quiz 1</th>
                  <th className="border px-3 py-2">Quiz 2</th>
                  <th className="border px-3 py-2">Quiz 3</th>
                  <th className="border px-3 py-2">Quiz 4</th>
                  <th className="border px-3 py-2">Quiz 5</th>
                  <th className="border px-3 py-2">Prelim</th>
                  <th className="border px-3 py-2">Midterm Written</th>
                  <th className="border px-3 py-2">Midterm Lab</th>
                  <th className="border px-3 py-2">Midterm Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.idNumber} className="text-center border-t">
                    <td className="border px-3 py-1">{r.idNumber}</td>
                    <td className="border px-3 py-1">{r.lastName}</td>
                    <td className="border px-3 py-1">{r.firstName}</td>
                    <td className="border px-3 py-1">{r.attendance}</td>
                    <td className="border px-3 py-1">{r.activity1}</td>
                    <td className="border px-3 py-1">{r.activity2}</td>
                    <td className="border px-3 py-1">{r.activity3}</td>
                    <td className="border px-3 py-1">{r.assignment1}</td>
                    <td className="border px-3 py-1">{r.assignment2}</td>
                    <td className="border px-3 py-1">{r.assignment3}</td>
                    <td className="border px-3 py-1">{r.assignment4}</td>
                    <td className="border px-3 py-1">{r.quiz1}</td>
                    <td className="border px-3 py-1">{r.quiz2}</td>
                    <td className="border px-3 py-1">{r.quiz3}</td>
                    <td className="border px-3 py-1">{r.quiz4}</td>
                    <td className="border px-3 py-1">{r.quiz5}</td>
                    <td className="border px-3 py-1">{r.prelim}</td>
                    <td className="border px-3 py-1">{r.midtermwrittenexam}</td>
                    <td className="border px-3 py-1">{r.midtermlabexam}</td>
                    <td
                      className={`border px-3 py-1 font-semibold ${
                        r.midtermGrade >= 3.25 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {r.midtermGrade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">No records found.</p>
        )}
      </div>
    </div>
  );
}
