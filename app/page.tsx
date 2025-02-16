"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabase";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load saved credentials if 'Keep me signed in' was selected
    const savedApiKey = localStorage.getItem("smsChefApiKey");
    const savedDeviceId = localStorage.getItem("smsChefDeviceId");
    if (savedApiKey && savedDeviceId) {
      setApiKey(savedApiKey);
      setDeviceId(savedDeviceId);
    }
  }, []);

  const handleLogin = async () => {
    if (!apiKey || !deviceId) {
      alert("Please enter both API Key and Device ID.");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("smsChefApiKey", apiKey);
      localStorage.setItem("smsChefDeviceId", deviceId);
    }

    // Debugging: Log before inserting
    console.log("Attempting to insert:", { api_key: apiKey, device_id: deviceId });

    // Store credentials in Supabase
    const { data, error } = await supabase
      .from("user_credentials")
      .upsert([{ api_key: apiKey, device_id: deviceId }])
      .select("*");

    if (error) {
      console.error("❌ Error storing credentials in Supabase:", error.message);
      alert(`Failed to save credentials: ${error.message}`);
      return;
    }

    console.log("✅ Credentials stored successfully in Supabase:", data);
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Attendance System</h1>
        <div className="space-y-6">
          <input
            type="text"
            placeholder="Enter SMS Chef API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Enter Device ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex items-center justify-center text-gray-800">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-gray-800 text-sm">Keep me signed in</label>
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 font-semibold transition duration-200"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}


