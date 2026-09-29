import React from 'react';
import { FaEdit, FaTrash, FaPlay, FaFlagCheckered, FaSyncAlt } from 'react-icons/fa';
import Badge from './Badge';

const formatTime = (s) => {
    if (!s?.startTime) return "—";
    return s.endTime ? `${s.startTime} – ${s.endTime}` : s.startTime;
};

const SessionTable = ({
    sessions = [],
    facultyMap = {},
    userRole,
    emptyState = null,
    onEdit,
    onDelete,
    onStart,
    onComplete,
    onReopen
}) => {
    const isAdmin = userRole === 'admin';

    if (sessions.length === 0 && emptyState) {
        return emptyState;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                    <tr>
                        <th className="!pl-8 py-5">Subject</th>
                        <th className="py-5">Faculty</th>
                        <th className="py-5">Date</th>
                        <th className="py-5">Time</th>
                        <th className="py-5 text-center">Status</th>
                        <th className="py-5 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sessions.map((s) => {
                        const isLive = s?.status === "ACTIVE";

                        return (
                            <tr
                                key={s._id}
                                className={`transition-colors ${
                                    isLive ? "bg-emerald-50/60 hover:bg-emerald-50" : "hover:bg-slate-50"
                                }`}
                            >
                                <td className={`!pl-8 py-4 font-bold text-sm border-l-4 ${
                                    isLive ? "border-emerald-500" : "border-transparent"
                                }`}>
                                    {s?.subject?.name || "N/A"}
                                </td>
                                <td className="py-4 text-sm">{facultyMap[s.faculty] || s.faculty || "—"}</td>
                                <td className="py-4 text-sm whitespace-nowrap">{s?.date || "—"}</td>
                                <td className="py-4 text-sm text-slate-500 whitespace-nowrap">{formatTime(s)}</td>
                                <td className="py-4 text-center"><Badge status={s?.status} /></td>
                                <td className="py-4 text-center">
                                    <div className="flex justify-center items-center gap-4 text-slate-400">
                                        {s?.status === "SCHEDULED" && <button onClick={() => onStart(s)} title="Start" className="text-emerald-600"><FaPlay size={14}/></button>}
                                        {s?.status === "ACTIVE" && <button onClick={() => onComplete(s)} title="End" className="text-rose-600"><FaFlagCheckered size={14}/></button>}
                                        {s?.status === "ENDED" && <button onClick={() => onReopen(s)} title="Reopen" className="text-amber-600"><FaSyncAlt size={14}/></button>}
                                        {isAdmin && (
                                            <>
                                                <button onClick={() => onEdit(s)} title="Edit" className="hover:text-indigo-600"><FaEdit size={14}/></button>
                                                <button onClick={() => onDelete(s)} title="Delete" className="hover:text-rose-600"><FaTrash size={14}/></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SessionTable;