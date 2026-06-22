'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import SmallFooter from "@/components/SmallFooter";
import { getSlotViewPayload } from "@/lib/slot-view";

type SharedSlot = {
    slot: string;
    courseCode: string;
    courseName: string;
    facultyName: string;
};

const THEORY_FILLED_COLOR = '#BFF0C8';
const THEORY_EMPTY_COLOR = '#E1F9E9';
const LAB_FILLED_COLOR = '#FFE78A';
const LAB_EMPTY_COLOR = '#FFF2BF';

type SlotCategory = 'theory' | 'lab';

type HighlightedCell = {
    rect: { top: number; left: number; width: number; height: number };
    label: string;
    courseCode: string;
    backgroundColor: string;
};

function getSlotTokens(slotName: string) {
    return slotName
        .split('+')
        .map(token => token.trim())
        .filter(Boolean);
}

function isSameSharedSlot(a: SharedSlot | null, b: SharedSlot | null) {
    if (!a || !b) return false;
    return (
        a.courseCode === b.courseCode &&
        a.courseName === b.courseName &&
        a.slot === b.slot &&
        a.facultyName === b.facultyName
    );
}

export default function SharePage() {
    const { shareId } = useParams();
    const router = useRouter();
    const [timetable, setTimetable] = useState<SharedSlot[]>([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSlot, setSelectedSlot] = useState<SharedSlot | null>(null);
    const [highlightedCells, setHighlightedCells] = useState<HighlightedCell[]>([]);
    const [selectedSlotCategory, setSelectedSlotCategory] = useState<SlotCategory | null>(null);

    const { scheduleRows, leftTimes, rightTimes } = useMemo(() => getSlotViewPayload(), []);

    useEffect(() => {
        if (!shareId) return;

        axios.get(`/api/shared-timetable/${shareId}`)
            .then(res => {
                if (res.data.success) {
                    setTitle(res.data.timetable.title);
                    setTimetable(res.data.timetable.slots);
                    setError('');
                    return;
                }

                setError('This shared timetable link is invalid or no longer available.');
            })
            .catch((requestError) => {
                const message =
                    axios.isAxiosError(requestError) && requestError.response?.status === 404
                        ? 'This shared timetable link is invalid or no longer available.'
                        : 'Failed to load the shared timetable.';
                setError(message);
            })
            .finally(() => setLoading(false));
    }, [shareId]);



    const theoryGrid: (SharedSlot | null)[][] = Array.from({ length: 5 }, () => Array(13).fill(null));
    const labGrid: (SharedSlot | null)[][] = Array.from({ length: 5 }, () => Array(13).fill(null));

    timetable.forEach(s => {
        const parts = s.slot.split(/\+|__/);
        parts.forEach((p: string) => {
            const clean = p.trim();
            scheduleRows.forEach((row, dayIdx) => {
                row.theoryLeft.forEach((cell, colIdx) => { if (cell.key === clean) theoryGrid[dayIdx][colIdx] = s; });
                row.theoryRight.forEach((cell, colIdx) => { if (cell.key === clean) theoryGrid[dayIdx][colIdx + 7] = s; });
                row.labLeft.forEach((cell, colIdx) => { if (cell.key === clean) labGrid[dayIdx][colIdx] = s; });
                row.labRight.forEach((cell, colIdx) => { if (cell.key === clean) labGrid[dayIdx][colIdx + 7] = s; });
            });
        });
    });

    const clearSelectedSlot = useCallback(() => {
        setSelectedSlot(null);
        setHighlightedCells([]);
        setSelectedSlotCategory(null);
    }, []);

    const openSelectedSlot = useCallback((slot: SharedSlot, category: SlotCategory) => {
        const slotTokens = getSlotTokens(slot.slot);
        const highlights: HighlightedCell[] = slotTokens.flatMap((token) => {
            const nodeList = document.querySelectorAll<HTMLElement>(`[data-slot-label="${token}"][data-slot-category="${category}"]`);
            return Array.from(nodeList).map((node) => {
                const rect = node.getBoundingClientRect();
                return {
                    rect: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                    },
                    label: token,
                    courseCode: slot.courseCode,
                    backgroundColor: node.dataset.bgcolor || '#ffffff',
                };
            });
        });

        setSelectedSlot(slot);
        setHighlightedCells(highlights);
        setSelectedSlotCategory(category);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#A0C4FF] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[16px] font-bold text-gray-700">Loading timetable...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F5E6D3] font-sans flex items-center justify-center px-6">
                <div className="w-full max-w-180 rounded-4xl bg-[#FFFBF0] p-10 text-center shadow-sm">
                    <h1 className="text-[32px] font-bold text-black">Shared Timetable</h1>
                    <p className="mt-4 text-[18px] text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5E6D3] font-sans flex flex-col items-center pt-4 md:pt-8 pb-0">
            <div className="w-[95%] max-w-350 bg-[#FFFBF0] rounded-3xl md:rounded-4xl p-5 md:p-8 my-4 md:my-8 pb-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 md:pb-6 ml-0 md:ml-2 border-b border-gray-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                        <h1 className="text-[22px] md:text-[26px] font-bold text-black leading-tight">{title || 'Shared Timetable'}</h1>
                        <div className="bg-green-50 border border-green-300 rounded-full px-2.5 py-1 flex items-center gap-1.5 w-fit shadow-sm">
                            <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-green-800 font-bold text-[11px] tracking-wide uppercase">View Only</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 self-start sm:self-auto">
                        <div className="cursor-pointer flex items-center gap-2 md:gap-3" onClick={() => router.push('/')}>
                            <Image src="/mic-logo.png" alt="MIC Logo" width={80} height={40} className="object-contain w-12 sm:w-14 md:w-20 h-6 sm:h-7 md:h-10" priority />
                            <span className="font-extrabold text-[20px] sm:text-[24px] md:text-[32px] tracking-wider text-black select-none leading-none">FFCS</span>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-[#aecbfa] hover:bg-[#9cbfee] text-black font-bold text-xs md:text-sm rounded-xl shadow-[0_4px_12px_rgba(174,203,250,0.3)] hover:shadow-[0_6px_16px_rgba(174,203,250,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            Create Yours
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[inset_-12px_0_12px_-12px_rgba(0,0,0,0.1),0_8px_30px_rgb(0,0,0,0.02)] overflow-x-auto border border-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <table className="w-full border-collapse bg-white overflow-hidden text-center rounded-2xl">
                        <thead>
                            <tr className="border-b-2 border-white">
                                <th className="p-2 text-center text-xs font-bold text-black border-r-2 border-white bg-white w-[5vw] min-w-17.5">Theory Hours</th>
                                {[...leftTimes, { theory: '', lab: '' }, ...rightTimes].map((t, i) => (
                                    <th key={i} className={`p-1 pt-2 pb-2 text-center text-[10px] leading-tight font-bold text-black border-r-2 border-white bg-white ${i === 6 ? 'w-7.5 px-0' : 'min-w-15'}`}>
                                        {t.theory ? t.theory.split('-').map((part, idx, arr) => (
                                            <span key={idx} className="block whitespace-nowrap">{part}{idx < arr.length - 1 ? '-' : ''}</span>
                                        )) : null}
                                    </th>
                                ))}
                            </tr>
                            <tr className="border-b-2 border-white">
                                <th className="p-2 text-center text-xs font-bold text-black border-r-2 border-white bg-white w-[5vw] min-w-17.5">Lab Hours</th>
                                {[...leftTimes, { theory: '', lab: '' }, ...rightTimes].map((t, i) => (
                                    <th key={i} className={`p-1 pt-2 pb-2 text-center text-[10px] leading-tight font-bold text-black border-r-2 border-white bg-white ${i === 6 ? 'w-7.5 px-0' : 'min-w-15'}`}>
                                        {t.lab ? t.lab.split('-').map((part, idx, arr) => (
                                            <span key={idx} className="block whitespace-nowrap">{part}{idx < arr.length - 1 ? '-' : ''}</span>
                                        )) : null}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {scheduleRows.map((row, rowIdx) => (
                                <tr key={row.day} className="group border-b-2 border-white">
                                    <td className="p-0 text-[11px] font-bold text-black text-center align-middle w-[5vw] min-w-17.5 border-r-2 border-white bg-white">{row.day}</td>
                                    {Array.from({ length: 13 }).map((_, colIdx) => {
                                        if (colIdx === 6) {
                                            const lunchLetters = ['L', 'U', 'N', 'C', 'H'];
                                            return (
                                                <td key="lunch-spacer" className="w-7.5 border-r-2 border-white align-middle bg-[#f8f9fa]">
                                                    <div className="flex flex-col items-center justify-center h-full py-1">
                                                        <span className="text-[11px] font-black text-black opacity-80">
                                                            {lunchLetters[rowIdx]}
                                                        </span>
                                                    </div>
                                                </td>
                                            )
                                        }
                                        
                                        const theoryCell = theoryGrid[rowIdx][colIdx];
                                        const labCell = labGrid[rowIdx][colIdx];
                                        const theoryBackgroundColor = theoryCell ? THEORY_FILLED_COLOR : THEORY_EMPTY_COLOR;
                                        const labBackgroundColor = labCell ? LAB_FILLED_COLOR : LAB_EMPTY_COLOR;

                                        let theoryLabel = '';
                                        let labLabel = '';
                                        if (colIdx < 6) {
                                            theoryLabel = row.theoryLeft[colIdx].label;
                                            labLabel = row.labLeft[colIdx].label;
                                        } else {
                                            theoryLabel = row.theoryRight[colIdx - 7].label;
                                            labLabel = row.labRight[colIdx - 7].label;
                                        }

                                        return (
                                            <td key={colIdx} className="align-top border-r-2 border-white p-0 bg-white">
                                                <div className="flex flex-col h-full w-full">
                                                    {/* Theory Slot */}
                                                    <div
                                                        data-slot-label={theoryLabel}
                                                        data-slot-category="theory"
                                                        data-bgcolor={theoryBackgroundColor}
                                                        className={`flex-1 flex flex-col items-center justify-center min-h-10 py-1 transition-all cursor-pointer ${theoryCell ? 'z-10 hover:shadow-sm' : ''} ${isSameSharedSlot(selectedSlot, theoryCell) ? 'brightness-110' : ''}`}
                                                        style={{ backgroundColor: theoryBackgroundColor }}
                                                        onClick={() => theoryCell && openSelectedSlot(theoryCell, 'theory')}
                                                    >
                                                        {theoryCell ? (
                                                            <>
                                                                <span className="text-[10px] font-bold text-black leading-tight">{theoryLabel}</span>
                                                                <span className="text-[8px] font-bold text-black opacity-80 uppercase mt-0.5 truncate px-1 max-w-16.25 leading-tight">{theoryCell.courseCode}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-[#4ea075]">{theoryLabel}</span>
                                                        )}
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="h-0.5 w-full bg-white shrink-0" />

                                                    {/* Lab Slot */}
                                                    <div
                                                        data-slot-label={labLabel}
                                                        data-slot-category="lab"
                                                        data-bgcolor={labBackgroundColor}
                                                        className={`flex-1 flex flex-col items-center justify-center min-h-10 py-1 transition-all cursor-pointer ${labCell ? 'z-10 hover:shadow-sm' : ''} ${isSameSharedSlot(selectedSlot, labCell) ? 'brightness-110' : ''}`}
                                                        style={{ backgroundColor: labBackgroundColor }}
                                                        onClick={() => labCell && openSelectedSlot(labCell, 'lab')}
                                                    >
                                                        {labCell ? (
                                                            <>
                                                                <span className="text-[10px] font-bold text-black leading-tight">{labLabel}</span>
                                                                <span className="text-[8px] font-bold text-black opacity-80 uppercase mt-0.5 truncate px-1 max-w-16.25 leading-tight">{labCell.courseCode}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-[#d4a044]">{labLabel}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popover */}
            {selectedSlot && (
                <div className="slot-detail-backdrop fixed inset-0 z-500 flex items-center justify-center px-4" onClick={clearSelectedSlot}>
                    {highlightedCells.map((highlightedCell) => (
                        <div
                            key={`${highlightedCell.label}-${highlightedCell.rect.top}-${highlightedCell.rect.left}`}
                            className="pointer-events-none fixed z-505 flex flex-col items-center justify-center brightness-110 shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
                            style={{
                                top: highlightedCell.rect.top,
                                left: highlightedCell.rect.left,
                                width: highlightedCell.rect.width,
                                height: highlightedCell.rect.height,
                                backgroundColor: highlightedCell.backgroundColor,
                            }}
                        >
                            <span className="text-[10px] font-bold leading-tight text-black">{highlightedCell.label}</span>
                            <span className="max-w-16.25 truncate px-1 text-[8px] font-bold uppercase leading-tight text-black opacity-80">
                                {highlightedCell.courseCode}
                            </span>
                        </div>
                    ))}
                    <div
                        className="relative z-510 flex shrink-0 flex-col animate-[scaleIn_0.2s_ease] overflow-hidden rounded-xl border-[1.5px] px-5 pt-5 pb-4"
                        style={{
                            width: '335px',
                            height: '312px',
                            maxWidth: '92vw',
                            backgroundColor: selectedSlotCategory === 'theory' ? '#CFF3D5' : '#FFF0A6',
                            borderColor: selectedSlotCategory === 'theory' ? '#6AA874' : '#D6B13D',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={clearSelectedSlot}
                            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-black/80 transition-colors hover:bg-black/5 hover:text-black"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>

                        <div className="pr-8">
                            <h2 className={`text-center font-black leading-[1.1] text-black ${((selectedSlot.courseCode?.length || 0) + (selectedSlot.courseName?.length || 0)) > 40 ? 'text-[17px]' : 'text-[22px]'}`}>
                                {selectedSlot.courseCode} - {selectedSlot.courseName}
                            </h2>
                            <p className="mt-2 text-center text-[18px] font-black text-black">
                                Slot: {selectedSlot.slot}
                            </p>
                        </div>

                        <div className="mt-4 flex flex-1 flex-col justify-evenly">
                            <p className="text-[16px] leading-[1.35] text-black">
                                <span className="font-black">Faculty Name:</span>{' '}
                                <span className={`font-semibold text-black/75 ${(selectedSlot.facultyName?.length || 0) > 25 ? 'text-[13px] leading-tight block' : ''}`}>{selectedSlot.facultyName || 'TBD'}</span>
                            </p>
                            <p className="text-[16px] leading-[1.35] text-black">
                                <span className="font-black">Course Name:</span>{' '}
                                <span className={`font-semibold text-black/75 ${(selectedSlot.courseName?.length || 0) > 35 ? 'text-[13px] leading-tight block' : ''}`}>{selectedSlot.courseName || 'TBD'}</span>
                            </p>
                            <p className="text-[16px] leading-[1.35] text-black">
                                <span className="font-black">Course Code:</span>{' '}
                                <span className="font-semibold text-black/75">{selectedSlot.courseCode || 'TBD'}</span>
                            </p>
                            <p className="text-[16px] leading-[1.35] text-black">
                                <span className="font-black">Timing:</span>{' '}
                                <span className="font-semibold text-black/75">{selectedSlot.slot || 'TBD'}</span>
                            </p>
                            <p className="text-[16px] leading-[1.35] text-black">
                                <span className="font-black">Classroom:</span>{' '}
                                <span className="font-semibold text-black/75">TBD</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <SmallFooter />
        </div>
    );
}
