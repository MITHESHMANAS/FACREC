import React from 'react';
import { FaEdit, FaTrash, FaPlay, FaFlagCheckered, FaSyncAlt } from 'react-icons/fa';
import Badge from './Badge';

const SessionTable = ({ 
    sessions = [], 
    facultyMap = {}, 
    onEdit, onDelete, onStart, onComplete, onReopen 
}) => {
    
    const safeSessions = Array.isArray(sessions) ? sessions : [];

    if (safeSessions.length === 0) {
        return <div className="p-16 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">No sessions found.</div>;
    }

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            {/* Force pl-8 to keep 'Subject' text away from the left edge */}
                            <th className="!pl-8 pr-6 py-5 text-left">Subject</th>
                            <th className="px-6 py-5 text-left">Faculty</th>
                            <th className="px-6 py-5 text-left">Date</th>
                            <th className="px-6 py-5 text-center">Expected</th>
                            <th className="px-6 py-5 text-center">Present</th>
                            <th className="px-6 py-5 text-center">Absent</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <th className="px-6 py-5 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {safeSessions.map((s) => (
                            <tr key={s?._id || Math.random()} className="hover:bg-slate-50/50 transition-colors">
                                <td className="!pl-8 pr-6 py-4 font-bold text-slate-900 text-sm whitespace-nowrap">
                                    {s?.subject?.name || "N/A"}
                                </td>
                                <td className="px-6 py-4 text-slate-700 text-sm">{facultyMap[s.faculty] || s.faculty || "—"}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{s?.date || "—"}</td>
                                <td className="px-6 py-4 text-center text-slate-700 text-sm">{s?.expectedStudents ?? "—"}</td>
                                <td className="px-6 py-4 text-center text-emerald-600 font-medium text-sm">{s?.presentStudents ?? "—"}</td>
                                <td className="px-6 py-4 text-center text-red-600 font-medium text-sm">{s?.absentStudents ?? "—"}</td>
                                <td className="px-6 py-4 text-center">
                                    <Badge status={s?.status} />
                                </td>
                                <td className="px-6 py-4">
                                    {/* Simplified Actions: grouped without heavy borders or icons */}
                                    <div className="flex justify-center items-center gap-4 text-slate-400">
                                        {s?.status === "SCHEDULED" && (
                                            <button onClick={() => onStart(s)} title="Start" className="hover:text-emerald-600 transition"><FaPlay size={14}/></button>
                                        )}
                                        {s?.status === "ACTIVE" && (
                                            <button onClick={() => onComplete(s)} title="End" className="hover:text-rose-600 transition"><FaFlagCheckered size={14}/></button>
                                        )}
                                        {s?.status === "ENDED" && (
                                            <button onClick={() => onReopen(s)} title="Reopen" className="hover:text-amber-600 transition"><FaSyncAlt size={14}/></button>
                                        )}
                                        <button onClick={() => onEdit(s)} title="Edit" className="hover:text-indigo-600 transition"><FaEdit size={14}/></button>
                                        <button onClick={() => onDelete(s)} title="Delete" className="hover:text-rose-600 transition"><FaTrash size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SessionTable;