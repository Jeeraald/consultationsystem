"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import Confetti (no SSR)
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

type FocusKeys = "first" | "last" | "id";

interface StudentData {
  firstName: string;
  lastName: string;
  idNumber: string;
  attendance: number;
  oral: number;
  pasiugda1: number;
  pasiugda2: number;
  pasiugda3: number;
  pasiugda4: number;
  prefinal: number;
  finalWritten: number;
  individualGrade: number;
  groupGrade: number;
  finalLab: number;
  finalGrade: number;
}

export default function HomePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const [placeholders, setPlaceholders] = useState<Record<FocusKeys, string>>({
    first: "",
    last: "",
    id: "",
  });

  const texts = useMemo(
    () => ({
      first: "ex: John",
      last: "ex: Doe",
      id: "ex: 2022123456",
    }),
    []
  );

  const [focused, setFocused] = useState<Record<FocusKeys, boolean>>({
    first: false,
    last: false,
    id: false,
  });

  const [cleared, setCleared] = useState<Record<FocusKeys, boolean>>({
    first: false,
    last: false,
    id: false,
  });

  const [error, setError] = useState("");
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [showRecordButton, setShowRecordButton] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const deletingRef = useRef(false);

  // Animated placeholders
  useEffect(() => {
    const animate = () => {
      const newPlaceholders = { ...placeholders };
      (["first", "last", "id"] as FocusKeys[]).forEach((key) => {
        if (!cleared[key] && !focused[key]) {
          newPlaceholders[key] = deletingRef.current
            ? texts[key].slice(0, indexRef.current - 1)
            : texts[key].slice(0, indexRef.current + 1);
        }
      });
      setPlaceholders(newPlaceholders);
      indexRef.current = deletingRef.current ? indexRef.current - 1 : indexRef.current + 1;

      const maxLength = Math.max(...Object.values(texts).map((t) => t.length));
      if (!deletingRef.current && indexRef.current >= maxLength) deletingRef.current = true;
      else if (deletingRef.current && indexRef.current <= 0) deletingRef.current = false;
    };

    intervalRef.current = window.setInterval(animate, 400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [focused, cleared, texts]); // Removed placeholders to avoid rerender loop

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const querySnapshot = await getDocs(collection(db, "classrecord"));
      let found = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Partial<StudentData>;
        const dbFirst = (data?.firstName || "").trim().toLowerCase();
        const dbLast = (data?.lastName || "").trim().toLowerCase();
        const dbId = String(data?.idNumber || "").trim();

        if (
          dbFirst === firstName.trim().toLowerCase() &&
          dbLast === lastName.trim().toLowerCase() &&
          dbId === idNumber.trim()
        ) {
          found = true;

          const record: StudentData = {
            firstName: String(data?.firstName || ""),
            lastName: String(data?.lastName || ""),
            idNumber: String(data?.idNumber || ""),
            attendance: Number(data?.attendance) || 0,
            oral: Number(data?.oral) || 0,
            pasiugda1: Number(data?.pasiugda1) || 0,
            pasiugda2: Number(data?.pasiugda2) || 0,
            pasiugda3: Number(data?.pasiugda3) || 0,
            pasiugda4: Number(data?.pasiugda4) || 0,
            prefinal: Number(data?.prefinal) || 0,
            finalWritten: Number(data?.finalWritten) || 0,
            individualGrade: Number(data?.individualGrade) || 0,
            groupGrade: Number(data?.groupGrade) || 0,
            finalLab: Number(data?.finalLab) || 0,
            finalGrade: Number(data?.finalGrade) || 0,
          };

          // Client-side only
          if (typeof window !== "undefined") {
            sessionStorage.setItem("studentRecord", JSON.stringify(record));
            localStorage.setItem("idNumber", record.idNumber);
          }

          setStudentData(record);

          if (record.finalGrade >= 50) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }

          setTimeout(() => setShowRecordButton(true), 2000);
        }
      });

      if (!found) setError("Invalid name or ID number. Please try again.");
    } catch (err) {
      console.error(err);
      setError("Error connecting to database. Please try again later.");
    }
  };

  const handleViewRecord = () => router.push("/viewrecord");

  const handleBack = () => {
    setStudentData(null);
    setShowRecordButton(false);
    setShowConfetti(false);
    setFirstName("");
    setLastName("");
    setIdNumber("");
    setCleared({ first: false, last: false, id: false });
  };

  const handleFocus = (key: FocusKeys) => {
    setFocused((prev) => ({ ...prev, [key]: true }));
    setCleared((prev) => ({ ...prev, [key]: true }));
  };

  const handleBlur = (key: FocusKeys) => {
    setFocused((prev) => ({ ...prev, [key]: false }));
    if ((key === "first" && !firstName) || (key === "last" && !lastName) || (key === "id" && !idNumber)) {
      setCleared((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-4 sm:p-6">
      {showConfetti && <Confetti width={typeof window !== "undefined" ? window.innerWidth : 0} height={typeof window !== "undefined" ? window.innerHeight : 0} />}

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl p-6 sm:p-8 md:p-10 lg:p-12">
        {!studentData ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-700">
                Grade Consultation
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 mt-1">
                Please enter your details to access your record
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
              {(["first", "last", "id"] as FocusKeys[]).map((key) => (
                <div key={key}>
                  <label className="block text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 mb-1 capitalize">
                    {key === "id" ? "Student ID" : key + " name"}
                  </label>
                  <input
                    type="text"
                    value={key === "first" ? firstName : key === "last" ? lastName : idNumber}
                    onChange={(e) =>
                      key === "first"
                        ? setFirstName(e.target.value)
                        : key === "last"
                        ? setLastName(e.target.value)
                        : setIdNumber(e.target.value)
                    }
                    onFocus={() => handleFocus(key)}
                    onBlur={() => handleBlur(key)}
                    className="w-full p-3 sm:p-3.5 md:p-4 lg:p-5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base md:text-lg lg:text-xl"
                    placeholder={placeholders[key]}
                    required
                  />
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 sm:py-3.5 md:py-4 lg:py-5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 shadow-md text-sm sm:text-base md:text-lg lg:text-xl"
              >
                View My Grade
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center text-xs sm:text-sm md:text-base lg:text-lg font-medium">
                {error}
              </div>
            )}
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-4"
            >
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-700"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
              >
                Final Grade
              </motion.h1>

              <motion.p
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold ${
                  studentData.finalGrade >= 50 ? "text-green-600" : "text-red-600"
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 150 }}
              >
                {studentData.finalGrade.toFixed(2)}
              </motion.p>

              <motion.p
                className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold ${
                  studentData.finalGrade >= 50 ? "text-green-500" : "text-red-500"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {studentData.finalGrade >= 50 ? "PASSED 🎉" : "FAILED ❌"}
              </motion.p>

              {showRecordButton && (
                <motion.button
                  onClick={handleViewRecord}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 sm:py-3.5 md:py-4 lg:py-5 rounded-xl font-semibold hover:bg-blue-700 shadow-md text-sm sm:text-base md:text-lg lg:text-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View My Class Record
                </motion.button>
              )}

              <button
                onClick={handleBack}
                className="block mx-auto mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 underline hover:text-blue-600"
              >
                Back to Login
              </button>
            </motion.div>
          </AnimatePresence>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-400">
            Computer Programming 1 | @Sir Jerald🪱
          </p>
        </div>
      </div>
    </div>
  );
}
