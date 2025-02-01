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
  const [loading, setLoading] = useState(true);
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Ensure hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch Attendance Records
  useEffect(() => {
    if (!hydrated) return;
    
    const fetchAttendanceRecords = async () => {
      setLoading(true);

      const { data: attendanceData, error } = await supabase
        .from("attendance")
        .select("student_id, status, date, month")
        .eq("month", currentMonth);

      if (error) {
        console.error("❌ Error fetching attendance records:", error.message);
        setLoading(false);
        return;
      }

      if (!attendanceData || attendanceData.length === 0) {
        console.warn("⚠ No attendance records found for", currentMonth);
        setLoading(false);
        return;
      }

      // Fetch Student Names
      const uniqueStudentIds = [...new Set(attendanceData.map(record => record.student_id))];
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, name")
        .in("id", uniqueStudentIds);

      if (studentError) {
        console.error("❌ Error fetching student names:", studentError.message);
        setLoading(false);
        return;
      }

      // Merge Student Names with Attendance Data
      const recordsWithNames = attendanceData.map(record => ({
        ...record,
        student_name: studentData.find(student => student.id === record.student_id)?.name || "Unknown",
      }));

      setAttendanceRecords(recordsWithNames);
      setLoading(false);
    };

    fetchAttendanceRecords();
  }, [hydrated, currentMonth]);

  if (!hydrated) return null;
  if (loading) return <p className="text-center text-gray-600">Loading activity records...</p>;

  // Ensure unique absences per student per day
  const uniqueAbsentRecords = Object.values(
    attendanceRecords
      .filter(record => record.status === "Absent")
      .reduce((acc, record) => {
        const key = `${record.student_id}-${record.date}`;
        if (!acc[key]) acc[key] = record;
        return acc;
      }, {} as Record<string, AttendanceRecord>)
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Activity Log - {currentMonth}
        </h1>

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
        <div className="mt-6">
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
  );
}


