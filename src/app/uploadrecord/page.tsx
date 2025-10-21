"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

interface StudentRecord {
  idNumber: string;
  firstName: string;
  lastName: string;
  attendance: number;
  activity1: number;
  assignment1: number;
  quiz1: number;
  quiz2: number;
  quiz3: number;
  quiz4: number;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedRecord, setEditedRecord] = useState<Partial<StudentRecord>>({});
  const [search, setSearch] = useState("");

  // fields that must remain strings in Firestore
  const stringFields = ["idNumber", "firstName", "lastName"] as const;
  type StringField = typeof stringFields[number];

  // list of numeric fields (derived from StudentRecord keys minus string ones)
  const numericFields: (keyof StudentRecord)[] = [
    "attendance",
    "activity1",
    "assignment1",
    "quiz1",
    "quiz2",
    "quiz3",
    "quiz4",
    "prelim",
    "midtermwrittenexam",
    "midtermlabexam",
    "midtermGrade",
  ];

  // Auto-hide status after 2 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Load Firestore data safely and normalize types
  useEffect(() => {
    const classCollection = collection(db, "classrecord");

    const unsubscribe = onSnapshot(classCollection, (snapshot) => {
      const data: StudentRecord[] = snapshot.docs.map((d) => {
        const record = d.data() as Partial<StudentRecord>;

        // Ensure numeric fields are numbers even if stored as strings in Firestore
        const normalized: Partial<StudentRecord> = { ...record } as Partial<StudentRecord>;
        numericFields.forEach((k) => {
          const raw = (record as any)[k];
          const num = Number(raw);
          (normalized as any)[k] = Number.isNaN(num) ? 0 : num;
        });

        // midtermGrade should be 2 decimal number
        const midtermRaw = (normalized as any).midtermGrade ?? 0;
        const parsedMid = Number(midtermRaw);
        const midtermGrade =
          !Number.isNaN(parsedMid) ? parseFloat(parsedMid.toFixed(2)) : 0;

        return {
          idNumber: d.id,
          firstName: String(normalized.firstName ?? ""),
          lastName: String(normalized.lastName ?? ""),
          attendance: Number(normalized.attendance ?? 0),
          quiz1: Number(normalized.quiz1 ?? 0),
          quiz2: Number(normalized.quiz2 ?? 0),
          quiz3: Number(normalized.quiz3 ?? 0),
          quiz4: Number(normalized.quiz4 ?? 0),
          prelim: Number(normalized.prelim ?? 0),
          midtermwrittenexam: Number(normalized.midtermwrittenexam ?? 0),
          assignment1: Number(normalized.assignment1 ?? 0),
          activity1: Number(normalized.activity1 ?? 0),
          midtermlabexam: Number(normalized.midtermlabexam ?? 0),
          midtermGrade,
        } as StudentRecord;
      });
      setRecords(data);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
  };

  // Upload Excel data to Firestore
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
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length <= 1) {
          setStatus("❌ No student records found in the file.");
          setIsUploading(false);
          return;
        }

        const classCollection = collection(db, "classrecord");

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const idNumber = row[0] ? String(row[0]).trim() : "";
          const lastName = row[1] ? String(row[1]).trim() : "";
          const firstName = row[2] ? String(row[2]).trim() : "";

          if (!idNumber || !firstName || !lastName) continue;

          const rawGrade = parseFloat(String(row[13] ?? 0));
          const midtermGrade = !isNaN(rawGrade)
            ? parseFloat(rawGrade.toFixed(2))
            : 0;

          const dataToSave: StudentRecord = {
            idNumber,
            firstName,
            lastName,
            attendance: Number(row[3]) || 0,
            quiz1: Number(row[4]) || 0,
            quiz2: Number(row[5]) || 0,
            quiz3: Number(row[6]) || 0,
            quiz4: Number(row[7]) || 0,
            prelim: Number(row[8]) || 0,
            midtermwrittenexam: Number(row[9]) || 0,
            assignment1: Number(row[10]) || 0,
            activity1: Number(row[11]) || 0,
            midtermlabexam: Number(row[12]) || 0,
            midtermGrade,
          };

          await setDoc(doc(classCollection, idNumber), dataToSave, { merge: true });
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

  // Handle edit
  const handleEdit = (record: StudentRecord) => {
    setEditingId(record.idNumber);
    // put original typed values into editedRecord (numbers remain numbers)
    setEditedRecord({ ...record });
  };

  // Handle save changes (ensures types remain correct)
  const handleSave = async () => {
    if (!editingId || !editedRecord) return;

    // flexible map that allows number | string so assignment is safe in TS
    const flexible: Partial<Record<keyof StudentRecord, number | string>> = {};

    Object.entries(editedRecord).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      const key = k as keyof StudentRecord;

      // keep string fields as strings
      if ((stringFields as readonly string[]).includes(k)) {
        flexible[key] = String(v);
      } else {
        // numeric fields: if already a number, keep it; if string, try parseFloat
        const asNum = typeof v === "number" ? v : Number(v);
        flexible[key] = Number.isNaN(asNum) ? 0 : asNum;
      }
    });

    // Now convert flexible -> payload typed as Partial<StudentRecord>
    const payloadEntries = Object.entries(flexible).map(([k, v]) => {
      if ((stringFields as readonly string[]).includes(k)) {
        return [k, String(v)];
      } else {
        return [k, Number(v)];
      }
    });

    const payload = Object.fromEntries(payloadEntries) as Partial<StudentRecord>;

    // Ensure midtermGrade has 2 decimals (and is a number)
    if (payload.midtermGrade !== undefined) {
      payload.midtermGrade = parseFloat(Number(payload.midtermGrade).toFixed(2));
    }

    try {
      await setDoc(doc(db, "classrecord", editingId), payload, { merge: true });
      setStatus("✅ Successfully saved!");
      setEditingId(null);
      setEditedRecord({});
    } catch (error) {
      console.error(error);
      setStatus("❌ Failed to save changes.");
    }
  };

  // Handle delete
  const handleDelete = async (record: StudentRecord) => {
    if (confirm(`Are you sure you want to delete ${record.firstName} ${record.lastName}?`)) {
      await deleteDoc(doc(db, "classrecord", record.idNumber));
      setStatus(`🗑️ Record ${record.idNumber} deleted!`);
    }
  };

  const filteredRecords = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.idNumber.toLowerCase().includes(q) ||
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q)
    );
  });

  // Display
  const displayValue = (key: string, value: number | string) => {
    if (Number(value) === -1) {
      return <span className="text-red-600 italic font-semibold">Missed</span>;
    }
    if (key === "midtermGrade") {
      const parsed = parseFloat(String(value));
      const safe = !isNaN(parsed) ? parsed.toFixed(2) : "0.00";
      return <span className="text-black">{safe}</span>;
    }
    return <span className="text-black">{value}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-7xl border border-black">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Upload Class Record
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-black rounded w-full md:w-1/3 text-black"
          />
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="flex-1 p-2 border border-black rounded text-black"
            />
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-6 py-2 rounded text-white font-semibold ${
                isUploading
                  ? "bg-black cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {status && (
          <div
            className={`fixed top-5 right-5 px-4 py-2 rounded-lg text-white shadow-lg ${
              status.includes("✅")
                ? "bg-green-600"
                : status.includes("❌")
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {status}
          </div>
        )}

        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto max-h-[70vh] border border-black rounded-lg">
            <table className="min-w-full text-sm border-collapse text-black">
              <thead className="bg-blue-100 text-blue-900 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="border border-black px-3 py-2">ID Number</th>
                  <th className="border border-black px-3 py-2">Last Name</th>
                  <th className="border border-black px-3 py-2">First Name</th>
                  <th className="border border-black px-3 py-2">Attendance</th>
                  <th className="border border-black px-3 py-2">Quiz 1</th>
                  <th className="border border-black px-3 py-2">Quiz 2</th>
                  <th className="border border-black px-3 py-2">Quiz 3</th>
                  <th className="border border-black px-3 py-2">Quiz 4</th>
                  <th className="border border-black px-3 py-2">Prelim</th>
                  <th className="border border-black px-3 py-2">Midterm Written</th>
                  <th className="border border-black px-3 py-2">Assignment 1</th>
                  <th className="border border-black px-3 py-2">Activity 1</th>
                  <th className="border border-black px-3 py-2">Midterm Lab</th>
                  <th className="border border-black px-3 py-2">Midterm Grade</th>
                  <th className="border border-black px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.idNumber} className="text-center border-t border-black">
                    {Object.entries({
                      idNumber: r.idNumber,
                      lastName: r.lastName,
                      firstName: r.firstName,
                      attendance: r.attendance,
                      quiz1: r.quiz1,
                      quiz2: r.quiz2,
                      quiz3: r.quiz3,
                      quiz4: r.quiz4,
                      prelim: r.prelim,
                      midtermwrittenexam: r.midtermwrittenexam,
                      assignment1: r.assignment1,
                      activity1: r.activity1,
                      midtermlabexam: r.midtermlabexam,
                      midtermGrade: r.midtermGrade,
                    }).map(([key, value]) => (
                      <td key={key} className="border border-black px-2 py-1 text-black">
                        {editingId === r.idNumber ? (
                          <input
                            type={(stringFields as readonly string[]).includes(key) ? "text" : "number"}
                            value={(editedRecord as any)[key] ?? value}
                            onChange={(e) => {
                              const input = e.target.value;
                              setEditedRecord((prev) => ({
                                ...prev,
                                [key]: (stringFields as readonly string[]).includes(key)
                                  ? input
                                  : input === "" || isNaN(Number(input))
                                  ? 0
                                  : Number(input),
                              }));
                            }}
                            className="w-full border border-black rounded px-1 text-center text-black"
                          />
                        ) : (
                          displayValue(key, value)
                        )}
                      </td>
                    ))}

                    <td className="border border-black px-3 py-1 flex gap-2 justify-center">
                      {editingId === r.idNumber ? (
                        <button
                          onClick={handleSave}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(r)}
                          className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-black italic">No records found.</p>
        )}
      </div>
    </div>
  );
}
