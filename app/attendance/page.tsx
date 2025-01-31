"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";

interface Student {
  id: string;
  name: string;
  status: "" | "Present" | "Absent";
}

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const currentDate = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase.from("students").select("id, name");
      if (error) {
        console.error("Error fetching students:", error);
      } else {
        setStudents(data.map((student) => ({ ...student, status: "" })) || []);
      }
    };
    fetchStudents();
  }, []);

  const markAttendance = (id: string, status: "Present" | "Absent") => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id ? { ...student, status } : student
      )
    );
  };

  const finalizeAttendance = async () => {
    const attendanceRecords = students.map(({ id, status }) => ({
      student_id: id,
      status,
      date: currentDate,
      month: new Date().toLocaleString('default', { month: 'long' }), // Store month name
    }));

    const { error } = await supabase.from("attendance").insert(attendanceRecords);
    if (error) {
      console.error("Error storing attendance:", error);
      alert("Failed to store attendance.");
    } else {
      alert("Attendance stored successfully!");
    }

    // Send SMS notifications to absent students
    students.forEach((student) => {
      if (student.status === "Absent") {
        console.log(`Sending SMS to ${student.name}: 'Student ${student.name} was absent on ${currentDate}.'`);
        // Integrate SMS API here
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Attendance - {currentDate}</h1>
        {students.length === 0 ? (
          <p className="text-gray-600 text-center">No students available. Please add students first.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Student Name</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center gap-2">
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${student.status === "Present" ? "bg-green-600 text-white" : "bg-gray-300 text-black"}`}
                      onClick={() => markAttendance(student.id, "Present")}
                    >
                      Present
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${student.status === "Absent" ? "bg-red-600 text-white" : "bg-gray-300 text-black"}`}
                      onClick={() => markAttendance(student.id, "Absent")}
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {students.length > 0 && (
          <button
            onClick={finalizeAttendance}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 font-semibold transition duration-200"
          >
            Finalize Attendance & Send SMS
          </button>
        )}
      </div>
    </div>
  );
}

