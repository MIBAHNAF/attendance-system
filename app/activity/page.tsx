"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";

interface AttendanceRecord {
  student_id: string;
  student_name: string;
  status: "Present" | "Absent";
  date: string;
  month: string;
}

export default function Activity() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const fetchAttendanceRecords = async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, status, date, month")
        .eq("month", currentMonth);

      if (error) {
        console.error("❌ Error fetching attendance records:", error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("⚠ No attendance records found for", currentMonth);
        return;
      }

      // Fetch student names
      const uniqueStudentIds = [...new Set(data.map(record => record.student_id))]; // Remove duplicate student IDs
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, name")
        .in("id", uniqueStudentIds);

      if (studentError) {
        console.error("❌ Error fetching student names:", studentError.message);
        return;
      }

      // Merge student names with attendance data
      const recordsWithNames = data.map(record => ({
        ...record,
        student_name: studentData.find(student => student.id === record.student_id)?.name || "Unknown",
      }));

      setAttendanceRecords(recordsWithNames);
    };

    fetchAttendanceRecords();
  }, [hydrated]);

  if (!hydrated) return null;

  // Prevent duplicate absences for the same student on the same day
  const uniqueAbsentRecords = Object.values(
    attendanceRecords
      .filter(record => record.status === "Absent")
      .reduce((acc, record) => {
        const key = `${record.student_id}-${record.date}`; // Unique key for each student per day
        if (!acc[key]) acc[key] = record;
        return acc;
      }, {} as Record<string, AttendanceRecord>)
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Activity Log - {currentMonth}</h1>
        <div className="grid grid-cols-1 gap-6">
          
          {/* Present Students */}
          <div>
            <h3 className="text-lg font-semibold text-green-700">Present Students</h3>
            {attendanceRecords.filter(record => record.status === "Present").length > 0 ? (
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Student Name</th>
                    <th className="border px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords
                    .filter(record => record.status === "Present")
                    .map((record, index) => (
                      <tr key={index} className="bg-green-100">
                        <td className="border px-4 py-2">{record.student_name}</td>
                        <td className="border px-4 py-2">{record.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 text-center">No Present Students</p>
            )}
          </div>

          {/* Absent Students */}
          <div>
            <h3 className="text-lg font-semibold text-red-700">Absent Students</h3>
            {uniqueAbsentRecords.length > 0 ? (
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Student Name</th>
                    <th className="border px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueAbsentRecords.map((record, index) => (
                    <tr key={index} className="bg-red-100">
                      <td className="border px-4 py-2">{record.student_name}</td>
                      <td className="border px-4 py-2">{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 text-center">No Absent Students</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}


