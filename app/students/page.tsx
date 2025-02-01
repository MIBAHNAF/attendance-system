"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";

interface Student {
    id: string;
    name: string;
    phone: string;
}

export default function Students() {
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudent, setNewStudent] = useState({ name: "", phone: "" });
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            const { data, error } = await supabase.from("students").select("id, name, phone");
            if (error) {
                console.error("Error fetching students:", error);
            } else {
                setStudents(data || []);
            }
        };
        fetchStudents();
    }, []);

    const addStudent = async () => {
        if (!newStudent.name.trim() || !newStudent.phone.trim()) {
            alert("Please enter both name and phone number.");
            return;
        }

        const { data, error } = await supabase
            .from("students")
            .insert([{ name: newStudent.name.trim(), phone: newStudent.phone.trim() }])
            .select();

        if (error) {
            console.error("Error adding student:", error);
            alert("Failed to add student.");
            return;
        }

        setStudents((prev) => [...prev, ...data]);
        setNewStudent({ name: "", phone: "" });
    };

    const updateStudent = async () => {
        if (!editingStudent) return;

        const { error } = await supabase
            .from("students")
            .update({ name: editingStudent.name, phone: editingStudent.phone })
            .eq("id", editingStudent.id);

        if (error) {
            console.error("Error updating student:", error);
            alert("Failed to update student.");
            return;
        }

        setStudents((prev) =>
            prev.map((student) => (student.id === editingStudent.id ? editingStudent : student))
        );
        setEditingStudent(null);
    };

    const deleteStudent = async (id: string) => {
        const { error } = await supabase.from("students").delete().eq("id", id);
        if (error) {
            console.error("Error deleting student:", error);
            alert("Failed to delete student.");
            return;
        }
        setStudents((prev) => prev.filter((student) => student.id !== id));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Students</h1>
                <div className="flex flex-col gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Enter student name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Enter phone number"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition duration-200"
                        onClick={addStudent}
                    >
                        Add
                    </button>
                </div>

                {students.length === 0 ? (
                    <p className="text-gray-600 text-center">No students added yet.</p>
                ) : (
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">Student Name</th>
                                <th className="border border-gray-300 px-4 py-2">Phone</th>
                                <th className="border border-gray-300 px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="text-center">
                                    <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{student.phone}</td>
                                    <td className="border border-gray-300 px-4 py-2 flex justify-center gap-2">
                                        <button
                                            className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-200"
                                            onClick={() => setEditingStudent(student)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200"
                                            onClick={() => deleteStudent(student.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {editingStudent && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">Edit Student</h2>
                        <input
                            type="text"
                            value={editingStudent.name}
                            onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                        />
                        <input
                            type="text"
                            value={editingStudent.phone}
                            onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                        />
                        <button
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition duration-200 mr-2"
                            onClick={updateStudent}
                        >
                            Save
                        </button>
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold transition duration-200"
                            onClick={() => setEditingStudent(null)}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
