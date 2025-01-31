"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
                <p className="text-gray-600 mb-6">Welcome to the Attendance System</p>

                <div className="space-y-4 w-full">
                    <button
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 font-semibold transition duration-200"
                        onClick={() => router.push("/attendance")}
                    >
                        Attendance
                    </button>
                    <button
                        className="bg-green-600 text-white px-6 py-3 rounded-lg w-full hover:bg-green-700 font-semibold transition duration-200"
                        onClick={() => router.push("/students")}
                    >
                        Students
                    </button>
                </div>
            </div>
        </div>
    );
}
