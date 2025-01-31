import { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { studentId, status, date } = req.body;

        // Insert attendance record
        const { data, error } = await supabase.from("attendance").insert([
            { student_id: studentId, date, status },
        ]);

        // ✅ Ensure `error` is handled properly
        if (error) {
            console.error("Supabase Error:", error.message);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ message: "Attendance recorded successfully", data });

    } catch (err) { // 🔹 Fix: Renamed `error` to `err` to prevent conflicts
        console.error("Server Error:", err); // Log actual error for debugging
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

