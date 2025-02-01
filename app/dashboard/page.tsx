"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ apiKey: string; deviceId: string } | null>(null);

    useEffect(() => {
        // Fetch stored credentials
        const apiKey = localStorage.getItem("smsChefApiKey");
        const deviceId = localStorage.getItem("smsChefDeviceId");

        if (apiKey && deviceId) {
            setUser({ apiKey, deviceId });
        }
    }, []);

    const handleSignOut = () => {
        // Remove stored credentials
        localStorage.removeItem("smsChefApiKey");
        localStorage.removeItem("smsChefDeviceId");
        router.push("/");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
                
                {user ? (
                    <p className="text-gray-600 mb-4">
                        Logged in with SMS Chef API Key: <span className="font-semibold text-blue-600">{user.apiKey.slice(0, 5)}*****</span>
                    </p>
                ) : (
                    <p className="text-gray-600 mb-4">Not logged in. Please enter your credentials.</p>
                )}

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
                    <button
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg w-full hover:bg-purple-700 font-semibold transition duration-200"
                        onClick={() => router.push("/activity")}
                    >
                        Activity
                    </button>
                    <button
                        className="bg-red-600 text-white px-6 py-3 rounded-lg w-full hover:bg-red-700 font-semibold transition duration-200"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
