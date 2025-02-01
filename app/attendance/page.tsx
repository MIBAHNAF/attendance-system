"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";

interface Student {
  id: string;
  name: string;
  phone: string;
  status: "" | "Present" | "Absent";
}

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const currentDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchStudents = async () => {
      const { data: studentData, error: studentError } = await supabase.from("students").select("id, name, phone");
      if (studentError) {
        console.error("Error fetching students:", studentError.message);
      } else {
        setStudents(studentData.map((student) => ({ ...student, status: "" })) || []);
      }
    };

    const fetchCredentials = async () => {
      const { data, error } = await supabase
        .from("user_credentials")
        .select("api_key, device_id")
        .limit(1) // Ensure only one row is fetched
        .single(); // Enforce single row

      if (error) {
        console.error("❌ Error fetching credentials:", error.message);
        alert("Failed to fetch API credentials. Please log in again.");
        return;
      }

      if (!data) {
        console.warn("⚠ No API credentials found.");
        alert("No API credentials found. Please log in again.");
        return;
      }

      setApiKey(data.api_key);
      setDeviceId(data.device_id);
      console.log("✅ Fetched credentials successfully:", data);
    };


    fetchStudents();
    fetchCredentials();
  }, []);

  const markAttendance = (id: string, status: "Present" | "Absent") => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id ? { ...student, status } : student
      )
    );
  };

  const sendSMS = async (phoneNumber: string, name: string) => {
    if (!apiKey || !deviceId) {
        alert("Missing API Key or Device ID. Please log in again.");
        return;
    }

    const message = `Student ${name} was absent!`;
    const payload = new URLSearchParams({
        secret: apiKey,
        mode: "devices",
        campaign: "bulk test",
        numbers: phoneNumber,
        device: deviceId,
        sim: "2",
        priority: "1",
        message: message,
    });

    try {
        const response = await fetch("https://www.cloud.smschef.com/api/send/sms.bulk", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Fix request headers
            body: payload.toString(),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("📨 SMS API Response:", result);

        if (result.status === 200) {
            alert(`✅ SMS sent to ${name}`);
        } else {
            alert(`❌ Failed to send SMS: ${result.message || "Unknown error"}`);
        }
    } catch (error) {
        console.error("❌ Error sending SMS:", error);
        alert("Failed to send SMS. Please check your network and try again.");
    }
};



  const finalizeAttendance = async () => {
    const attendanceRecords = students
      .filter(student => student.status)
      .map(({ id, status }) => ({
        student_id: id,
        status,
        date: currentDate,
        month: new Date().toLocaleString('default', { month: 'long' }),
      }));

    if (attendanceRecords.length === 0) {
      alert("No attendance data to store.");
      return;
    }

    console.log("⏳ Storing attendance records:", attendanceRecords);

    const { error } = await supabase.from("attendance").insert(attendanceRecords);

    if (error) {
      console.error("❌ Error storing attendance:", error.message);
      alert(`Failed to store attendance: ${error.message}`);
      return;
    }

    alert("✅ Attendance stored successfully!");

    students.forEach((student) => {
      if (student.status === "Absent") {
        sendSMS(student.phone, student.name);
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
