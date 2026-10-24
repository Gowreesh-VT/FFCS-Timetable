import chennaiCourses from '@/data/all_data_chennai';
import type { fullCourseData } from '@/lib/type';
import { pairTheoryAndLabSlots } from './slots';

export type ChennaiCourseRecord = (typeof chennaiCourses)[number];

export type ChennaiDomainCatalog = Record<string, Record<string, ChennaiCourseRecord[]>>;

function getDepartmentPrefix(courseCode: string): string {
    const match = courseCode.match(/^[A-Z]+/);
    return match?.[0] || courseCode;
}

export function isTheoryType(type: string): boolean {
    return ['ETH', 'TH', 'PJT', 'SS', 'OC', 'EPJ'].includes(type.toUpperCase().trim());
}

export function isLabType(type: string): boolean {
    return ['ELA', 'LO'].includes(type.toUpperCase().trim());
}

export function buildChennaiCatalog(records: readonly ChennaiCourseRecord[] = chennaiCourses): ChennaiDomainCatalog {
    const catalog: ChennaiDomainCatalog = {};

    records.forEach((record) => {
        const domain = getDepartmentPrefix(record.CODE);
        const subject = `${record.CODE} - ${record.TITLE}`;

        catalog[domain] ||= {};
        catalog[domain][subject] ||= [];
        catalog[domain][subject].push(record);
    });

    return Object.fromEntries(
        Object.entries(catalog)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([domain, subjects]) => [
                domain,
                Object.fromEntries(
                    Object.entries(subjects)
                        .sort(([left], [right]) => left.localeCompare(right))
                        .map(([subject, subjectRecords]) => [subject, subjectRecords])
                ),
            ])
    );
}

export const chennaiCatalog = buildChennaiCatalog();

let creditIndex: Map<string, number> | null = null;

export function getCourseCredits(code: string, slot: string, faculty: string): number {
    if (!creditIndex) {
        creditIndex = new Map();
        chennaiCourses.forEach((r) => {
            r.SLOT.split('+').forEach((s) => {
                const key = `${r.CODE}|${s.trim()}|${r.FACULTY}`;
                creditIndex!.set(key, Number(r.CREDITS));
            });
            // Also index by full slot string
            creditIndex!.set(`${r.CODE}|${r.SLOT}|${r.FACULTY}`, Number(r.CREDITS));
        });
    }

    // Try full match first
    const fullKey = `${code}|${slot}|${faculty}`;
    if (creditIndex.has(fullKey)) return creditIndex.get(fullKey)!;

    const firstSlot = slot.split('+')[0].trim();
    const partialKey = `${code}|${firstSlot}|${faculty}`;
    return creditIndex.get(partialKey) || 0;
}


export const chennaiDepartments = Object.keys(chennaiCatalog);

export function getChennaiDepartmentData(selectedDepartments: string[]): ChennaiDomainCatalog {
    if (selectedDepartments.length === 0) {
        return chennaiCatalog;
    }

    return selectedDepartments.reduce<ChennaiDomainCatalog>((combined, department) => {
        const domainData = chennaiCatalog[department];
        if (!domainData) {
            return combined;
        }

        combined[department] ||= {};
        Object.entries(domainData).forEach(([subject, subjectRecords]) => {
            combined[department][subject] = [...subjectRecords];
        });

        return combined;
    }, {});
}

export function toFullCourseType(courseType: string): 'th' | 'lab' | 'both' {
    if (isLabType(courseType)) return 'lab';
    return 'th';
}

export function getChennaiCourseType(courseCode: string): 'th' | 'lab' | 'both' {
    const matchingRecords = chennaiCourses.filter((course) => course.CODE === courseCode);

    if (matchingRecords.length === 0) {
        return 'th';
    }

    let hasTheory = false;
    let hasLab = false;

    matchingRecords.forEach((record) => {
        if (isLabType(record.TYPE)) {
            hasLab = true;
        } else if (isTheoryType(record.TYPE)) {
            hasTheory = true;
        }
    });

    if (hasTheory && hasLab) return 'both';
    if (hasLab) return 'lab';
    return 'th';
}

export function buildPreferenceCoursesFromChennaiSelection(
    selectedDomains: string[],
    selectedSubjects: string[],
    selectedSlots: string[],
    selectedFaculties: string[],
): fullCourseData[] {
    const courseEntries: fullCourseData[] = [];
    const selectedDepartmentData = getChennaiDepartmentData(selectedDomains);

    selectedDomains.forEach((domain) => {
        const subjectMap = selectedDepartmentData[domain] || {};

        selectedSubjects.forEach((subject) => {
            const subjectRecords = subjectMap[subject] || [];
            const slotFacultyMap = new Map<string, Set<string>>();

            subjectRecords.forEach((record) => {
                if (!selectedSlots.includes(record.SLOT) || !selectedFaculties.includes(record.FACULTY)) {
                    return;
                }

                if (!slotFacultyMap.has(record.SLOT)) {
                    slotFacultyMap.set(record.SLOT, new Set());
                }

                slotFacultyMap.get(record.SLOT)!.add(record.FACULTY);
            });

            if (slotFacultyMap.size === 0) {
                return;
            }

            const [courseCode, ...courseNameParts] = subject.split(' - ');
            const courseName = courseNameParts.join(' - ') || subject;

            let hasTheorySelected = false;
            let hasLabSelected = false;
            let hasAutoPairedLab = false;

            const facultyPairings = new Map<string, Map<string, string>>();
            const faculties = new Set<string>();
            subjectRecords.forEach(r => faculties.add(r.FACULTY));
            faculties.forEach(facultyName => {
                const theorySlots = subjectRecords.filter(r => r.FACULTY === facultyName && isTheoryType(r.TYPE)).map(r => r.SLOT);
                const labSlots = subjectRecords.filter(r => r.FACULTY === facultyName && isLabType(r.TYPE)).map(r => r.SLOT);
                facultyPairings.set(facultyName, pairTheoryAndLabSlots(theorySlots, labSlots));
            });

            const courseSlots = Array.from(slotFacultyMap.entries()).map(([slotName, facultiesSet]) => {
                // Find the actual TYPE for this slot from the records
                const matchingRecord = subjectRecords.find(
                    r => r.SLOT === slotName && selectedFaculties.includes(r.FACULTY)
                );
                const slotIsTheory = matchingRecord ? isTheoryType(matchingRecord.TYPE) : false;
                const slotIsLab = matchingRecord ? isLabType(matchingRecord.TYPE) : false;

                if (slotIsTheory) hasTheorySelected = true;
                if (slotIsLab) hasLabSelected = true;

                const slotFaculties = Array.from(facultiesSet).map((facultyName) => {
                    let facultyLabSlot: string | undefined;
                    let venue: string | undefined;
                    let venueLab: string | undefined;

                    if (slotIsTheory) {
                        const thRecord = subjectRecords.find(
                            r => r.FACULTY === facultyName && r.SLOT === slotName && isTheoryType(r.TYPE)
                        );
                        venue = (thRecord as any)?.VENUE;

                        const labRecords = subjectRecords.filter(
                            r => r.FACULTY === facultyName && isLabType(r.TYPE)
                        );

                        if (labRecords.length > 0) {
                            const matched = facultyPairings.get(facultyName)?.get(slotName);
                            if (matched) {
                                facultyLabSlot = matched;
                                const matchingLabRecord = labRecords.find(r => r.SLOT === matched);
                                venueLab = (matchingLabRecord as any)?.VENUE;
                                hasAutoPairedLab = true;
                            }
                        }
                    } else if (slotIsLab) {
                        const labRecord = subjectRecords.find(
                            r => r.FACULTY === facultyName && r.SLOT === slotName && isLabType(r.TYPE)
                        );
                        venue = (labRecord as any)?.VENUE;
                    }

                    return {
                        facultyName,
                        ...(facultyLabSlot ? { facultyLabSlot } : {}),
                        venue: venue || 'TBD',
                        ...(venueLab ? { venueLab } : {}),
                    };
                });

                return { slotName, slotFaculties };
            });

            // Determine courseType based on what was selected + auto-pair
            let courseType: 'th' | 'lab' | 'both';
            if (hasAutoPairedLab || (hasTheorySelected && hasLabSelected)) {
                courseType = 'both';
            } else if (hasLabSelected && !hasTheorySelected) {
                courseType = 'lab';
            } else {
                courseType = 'th';
            }

            courseEntries.push({
                id: `${courseCode}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                courseType,
                courseCode,
                courseName,
                ...(courseType === 'both' ? { courseCodeLab: courseCode, courseNameLab: courseName } : {}),
                courseSlots,
            });
        });
    });

    return courseEntries;
}

