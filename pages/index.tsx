import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const [apiKey, setApiKey] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    // Load stored credentials on page load
    useEffect(() => {
        const savedApiKey = localStorage.getItem("smsChefApiKey");
        const savedDeviceId = localStorage.getItem("smsChefDeviceId");

        if (savedApiKey && savedDeviceId) {
            setApiKey(savedApiKey);
            setDeviceId(savedDeviceId);
            router.push("/dashboard"); // Redirect if already logged in
        }
    }, [router]);

    const handleLogin = () => {
        if (!apiKey || !deviceId) {
            alert("Please enter both API Key and Device ID.");
            return;
        }

        // Save credentials if "Keep me signed in" is checked
        if (rememberMe) {
            localStorage.setItem("smsChefApiKey", apiKey);
            localStorage.setItem("smsChefDeviceId", deviceId);
        }

        // Redirect to Dashboard
        router.push("/dashboard");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome to Attendance System</h1>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter SMS Chef API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                    <input
                        type="text"
                        placeholder="Enter Device ID"
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="mr-2"
                        />
                        <label>Keep me signed in</label>
                    </div>
                    <button
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-600"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}
