import { clashMap } from './slots';
import { fullCourseData, timetableDisplayData } from './type';

/**
 * Generates all valid (non-clashing) timetable combinations from selected courses.
 * This is the core algorithm that produces multiple timetable options.
 */
export function generateTT(
    courseData: fullCourseData[],
    discardClashCombinations: boolean = true
): {
    result: timetableDisplayData[][];
    clashes: string | null;
} {
    function simplify(data: fullCourseData[]): timetableDisplayData[][] {
        const coursesSimple: timetableDisplayData[][] = [];
        for (const course of data) {
            const subjectOptions: timetableDisplayData[] = [];
            if (course.courseType === 'th' || course.courseType === 'lab') {
                for (const slot of course.courseSlots) {
                    for (const faculty of slot.slotFaculties) {
                        subjectOptions.push({
                            courseCode: course.courseCode,
                            courseName: course.courseName,
                            slotName: slot.slotName,
                            facultyName: faculty.facultyName,
                            venue: faculty.venue || 'TBD',
                        });
                    }
                }
            } else if (course.courseType === 'both') {
                for (const slot of course.courseSlots) {
                    for (const faculty of slot.slotFaculties) {
                        if (faculty.facultyLabSlot) {
                            // Full theory+lab pairing — encode both in the slot name so
                            // breakClubbed() can split them apart later.
                            const labSlots = faculty.facultyLabSlot.split(', ');
                            for (const labSlot of labSlots) {
                                subjectOptions.push({
                                    courseCode: course.courseCode + '__' + course.courseCodeLab,
                                    courseName: course.courseName + '__' + course.courseNameLab,
                                    slotName: slot.slotName + '__' + labSlot,
                                    facultyName: faculty.facultyName,
                                    venue: (faculty.venue || 'TBD') + '__' + (faculty.venueLab || 'TBD'),
                                });
                            }
                        } else {
                            // No lab slot available (e.g. data from the courses page where
                            // only a theory slot was entered).  Include it as theory-only so
                            // the course still appears in the generated timetable.
                            subjectOptions.push({
                                courseCode: course.courseCode,
                                courseName: course.courseName,
                                slotName: slot.slotName,
                                facultyName: faculty.facultyName,
                                venue: faculty.venue || 'TBD',
                            });
                        }
                    }
                }
            }
            // Only add if there are valid options — an empty array would zero out
            // the entire cartesian product and produce no timetables at all.
            if (subjectOptions.length > 0) {
                coursesSimple.push(subjectOptions);
            }
        }
        return coursesSimple;
    }

    const subjectList = simplify(courseData);
    let combinations: timetableDisplayData[][] = [[]];
    const clashGroups: Map<string, Set<string>> = new Map();
    const seenPairs: Set<string> = new Set();

    for (const subject of subjectList) {
        const temp: timetableDisplayData[][] = [];
        for (const partial of combinations) {
            for (const item of subject) {
                const includedSlots: string[] = [];

                partial.forEach(p => {
                    const slots = p.slotName.split(/\+|__/);
                    slots.forEach(slot => {
                        includedSlots.push(slot);
                        if (clashMap[slot]) includedSlots.push(...clashMap[slot]);
                    });
                });

                const currentSlots = item.slotName.split(/\+|__/);
                const hasClash = currentSlots.some(slot => includedSlots.includes(slot));

                if (!hasClash) {
                    temp.push([...partial, item]);
                } else if (!discardClashCombinations) {
                    temp.push([...partial]);
                } else {
                    partial.forEach(p => {
                        const slotsA = p.slotName.split(/\+|__/);
                        const slotsB = item.slotName.split(/\+|__/);

                        // Expand only one side: expanding both makes two slots that merely
                        // overlap the same lab (e.g. A1 and F1 via L1) look like a clash.
                        const expandedB = new Set<string>();

                        slotsB.forEach(s => {
                            expandedB.add(s);
                            if (clashMap[s]) clashMap[s].forEach(x => expandedB.add(x));
                        });

                        for (const slotA of slotsA) {
                            if (expandedB.has(slotA)) {
                                const msg1 = `${p.facultyName} for (${p.courseName})`;
                                const msg2 = `${item.facultyName} for (${item.courseName})`;

                                const key = [p.facultyName, item.facultyName].sort().join('|');
                                if (seenPairs.has(key)) continue;

                                seenPairs.add(key);

                                if (!clashGroups.has(slotA)) {
                                    clashGroups.set(slotA, new Set());
                                }

                                clashGroups.get(slotA)!.add(msg1);
                                clashGroups.get(slotA)!.add(msg2);
                            }
                        }
                    });
                }
            }
        }
        combinations = temp;
    }

    const final = breakClubbed(combinations);

    let clashMessage: string | null = null;

    if (final.length === 0 && clashGroups.size > 0) {
        clashMessage = `No timetables due to conflicting combinations:`;

        for (const [slot, conflicts] of clashGroups.entries()) {
            const expandedSlots = Array.from(new Set([slot, ...(clashMap[slot] || [])])).join(', ');
            clashMessage += `\n  Slots (${expandedSlots})\n`;
            clashMessage += Array.from(conflicts)
                .map(entry => `    ${entry}`)
                .join('\n');
            clashMessage += '\n';
        }

        clashMessage = clashMessage.trim();
    }

    return {
        result: final,
        clashes: clashMessage,
    };
}

function breakClubbed(combinations: timetableDisplayData[][]): timetableDisplayData[][] {
    return combinations.map(combo =>
        combo.flatMap((item: timetableDisplayData): timetableDisplayData[] => {
            if (item.slotName.includes('__')) {
                const [thSlot, labSlots] = item.slotName.split('__');
                const [thCode, labCode] = item.courseCode.split('__');
                const [thName, labName] = item.courseName.split('__');
                const [thVenue, labVenue] = (item.venue || 'TBD__TBD').split('__');
                return [
                    {
                        courseCode: thCode,
                        courseName: thName,
                        slotName: thSlot,
                        facultyName: item.facultyName,
                        venue: thVenue || 'TBD',
                    },
                    {
                        courseCode: labCode,
                        courseName: labName,
                        slotName: labSlots,
                        facultyName: item.facultyName,
                        venue: labVenue || 'TBD',
                    },
                ];
            }
            return [item];
        })
    );
}

/**
 * Indices of the page buttons to show: a window of up to `size` pages that
 * keeps the current page visible as the user moves past the first few.
 */
export function getPageWindow(current: number, total: number, size: number = 4): number[] {
    const start = Math.max(0, Math.min(current - Math.floor(size / 2), total - size));
    return Array.from({ length: Math.min(size, total) }, (_, i) => start + i);
}

export function getCurrentDateTime() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function parseName(fullName: string | null | undefined): { name: string; regNo: string } {
    if (!fullName) return { name: '', regNo: '' };
    const regNoMatch = fullName.match(/\s+([0-9]{2}[A-Z]{3}[0-9]{4})$/i);
    if (regNoMatch) {
        const regNo = regNoMatch[1];
        const name = fullName.substring(0, fullName.length - regNoMatch[0].length).trim();
        return { name, regNo };
    }
    return { name: fullName, regNo: '' };
}

