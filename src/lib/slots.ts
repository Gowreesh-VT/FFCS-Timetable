import { slot } from '@/lib/type';
import { getSlotViewPayload } from '@/lib/slot-view';

const slotMap: Record<string, slot[]> = {
    A1: [
        { rowStart: 4, rowEnd: 5, colStart: 2, colEnd: 7, slotName: 'A1' },
        { rowStart: 10, rowEnd: 11, colStart: 8, colEnd: 13, slotName: 'A1' },
    ],
    TA1: [{ rowStart: 16, rowEnd: 17, colStart: 14, colEnd: 19, slotName: 'TA1' }],
    TAA1: [{ rowStart: 7, rowEnd: 8, colStart: 26, colEnd: 31, slotName: 'TAA1' }],
    B1: [
        { rowStart: 7, rowEnd: 8, colStart: 2, colEnd: 7, slotName: 'B1' },
        { rowStart: 13, rowEnd: 14, colStart: 8, colEnd: 13, slotName: 'B1' },
    ],
    TB1: [{ rowStart: 4, rowEnd: 5, colStart: 20, colEnd: 25, slotName: 'TB1' }],
    C1: [
        { rowStart: 10, rowEnd: 11, colStart: 2, colEnd: 7, slotName: 'C1' },
        { rowStart: 16, rowEnd: 17, colStart: 8, colEnd: 13, slotName: 'C1' },
    ],
    TC1: [{ rowStart: 7, rowEnd: 8, colStart: 20, colEnd: 25, slotName: 'TC1' }],
    TCC1: [{ rowStart: 13, rowEnd: 14, colStart: 26, colEnd: 31, slotName: 'TCC1' }],
    D1: [
        { rowStart: 13, rowEnd: 14, colStart: 2, colEnd: 7, slotName: 'D1' },
        { rowStart: 4, rowEnd: 5, colStart: 14, colEnd: 19, slotName: 'D1' },
    ],
    TD1: [{ rowStart: 10, rowEnd: 11, colStart: 20, colEnd: 25, slotName: 'TD1' }],
    TBB1: [{ rowStart: 10, rowEnd: 11, colStart: 26, colEnd: 31, slotName: 'TBB1' }],
    TDD1: [{ rowStart: 16, rowEnd: 17, colStart: 26, colEnd: 31, slotName: 'TDD1' }],
    E1: [
        { rowStart: 16, rowEnd: 17, colStart: 2, colEnd: 7, slotName: 'E1' },
        { rowStart: 7, rowEnd: 8, colStart: 14, colEnd: 19, slotName: 'E1' },
    ],
    TE1: [{ rowStart: 13, rowEnd: 14, colStart: 20, colEnd: 25, slotName: 'TE1' }],
    F1: [
        { rowStart: 4, rowEnd: 5, colStart: 8, colEnd: 13, slotName: 'F1' },
        { rowStart: 10, rowEnd: 11, colStart: 14, colEnd: 19, slotName: 'F1' },
    ],
    TF1: [{ rowStart: 16, rowEnd: 17, colStart: 20, colEnd: 25, slotName: 'TF1' }],
    G1: [
        { rowStart: 7, rowEnd: 8, colStart: 8, colEnd: 13, slotName: 'G1' },
        { rowStart: 13, rowEnd: 14, colStart: 14, colEnd: 19, slotName: 'G1' },
    ],
    TG1: [{ rowStart: 4, rowEnd: 5, colStart: 26, colEnd: 31, slotName: 'TG1' }],

    A2: [
        { rowStart: 4, rowEnd: 5, colStart: 38, colEnd: 43, slotName: 'A2' },
        { rowStart: 10, rowEnd: 11, colStart: 44, colEnd: 49, slotName: 'A2' },
    ],
    TA2: [{ rowStart: 16, rowEnd: 17, colStart: 50, colEnd: 55, slotName: 'TA2' }],
    TAA2: [{ rowStart: 7, rowEnd: 8, colStart: 62, colEnd: 67, slotName: 'TAA2' }],
    B2: [
        { rowStart: 7, rowEnd: 8, colStart: 38, colEnd: 43, slotName: 'B2' },
        { rowStart: 13, rowEnd: 14, colStart: 44, colEnd: 49, slotName: 'B2' },
    ],
    TB2: [{ rowStart: 4, rowEnd: 5, colStart: 56, colEnd: 61, slotName: 'TB2' }],
    TBB2: [{ rowStart: 10, rowEnd: 11, colStart: 62, colEnd: 67, slotName: 'TBB2' }],
    C2: [
        { rowStart: 10, rowEnd: 11, colStart: 38, colEnd: 43, slotName: 'C2' },
        { rowStart: 16, rowEnd: 17, colStart: 44, colEnd: 49, slotName: 'C2' },
    ],
    TC2: [{ rowStart: 7, rowEnd: 8, colStart: 56, colEnd: 61, slotName: 'TC2' }],
    TCC2: [{ rowStart: 13, rowEnd: 14, colStart: 62, colEnd: 67, slotName: 'TCC2' }],
    D2: [
        { rowStart: 13, rowEnd: 14, colStart: 38, colEnd: 43, slotName: 'D2' },
        { rowStart: 4, rowEnd: 5, colStart: 50, colEnd: 55, slotName: 'D2' },
    ],
    TD2: [{ rowStart: 10, rowEnd: 11, colStart: 56, colEnd: 61, slotName: 'TD2' }],
    TDD2: [{ rowStart: 16, rowEnd: 17, colStart: 62, colEnd: 67, slotName: 'TDD2' }],
    E2: [
        { rowStart: 16, rowEnd: 17, colStart: 38, colEnd: 43, slotName: 'E2' },
        { rowStart: 7, rowEnd: 8, colStart: 50, colEnd: 55, slotName: 'E2' },
    ],
    TE2: [{ rowStart: 13, rowEnd: 14, colStart: 56, colEnd: 61, slotName: 'TE2' }],
    F2: [
        { rowStart: 4, rowEnd: 5, colStart: 44, colEnd: 49, slotName: 'F2' },
        { rowStart: 10, rowEnd: 11, colStart: 50, colEnd: 55, slotName: 'F2' },
    ],
    TF2: [{ rowStart: 16, rowEnd: 17, colStart: 56, colEnd: 61, slotName: 'TF2' }],
    G2: [
        { rowStart: 7, rowEnd: 8, colStart: 44, colEnd: 49, slotName: 'G2' },
        { rowStart: 13, rowEnd: 14, colStart: 50, colEnd: 55, slotName: 'G2' },
    ],
    TG2: [{ rowStart: 4, rowEnd: 5, colStart: 62, colEnd: 67, slotName: 'TG2' }],

    L1: [{ rowStart: 5, rowEnd: 6, colStart: 2, colEnd: 12, slotName: 'L1+L2' }],
    L3: [{ rowStart: 5, rowEnd: 6, colStart: 13, colEnd: 23, slotName: 'L3+L4' }],
    L5: [{ rowStart: 5, rowEnd: 6, colStart: 24, colEnd: 34, slotName: 'L5+L6' }],
    L7: [{ rowStart: 8, rowEnd: 9, colStart: 2, colEnd: 12, slotName: 'L7+L8' }],
    L9: [{ rowStart: 8, rowEnd: 9, colStart: 13, colEnd: 23, slotName: 'L9+L10' }],
    L11: [{ rowStart: 8, rowEnd: 9, colStart: 24, colEnd: 34, slotName: 'L11+L12' }],
    L13: [{ rowStart: 11, rowEnd: 12, colStart: 2, colEnd: 12, slotName: 'L13+L14' }],
    L15: [{ rowStart: 11, rowEnd: 12, colStart: 13, colEnd: 23, slotName: 'L15+L16' }],
    L17: [{ rowStart: 11, rowEnd: 12, colStart: 24, colEnd: 34, slotName: 'L17+L18' }],
    L19: [{ rowStart: 14, rowEnd: 15, colStart: 2, colEnd: 12, slotName: 'L19+L20' }],
    L21: [{ rowStart: 14, rowEnd: 15, colStart: 13, colEnd: 23, slotName: 'L21+L22' }],
    L23: [{ rowStart: 14, rowEnd: 15, colStart: 24, colEnd: 34, slotName: 'L23+L24' }],
    L25: [{ rowStart: 17, rowEnd: 18, colStart: 2, colEnd: 12, slotName: 'L25+L26' }],
    L27: [{ rowStart: 17, rowEnd: 18, colStart: 13, colEnd: 23, slotName: 'L27+L28' }],
    L29: [{ rowStart: 17, rowEnd: 18, colStart: 24, colEnd: 34, slotName: 'L29+L30' }],

    L31: [{ rowStart: 5, rowEnd: 6, colStart: 38, colEnd: 48, slotName: 'L31+L32' }],
    L33: [{ rowStart: 5, rowEnd: 6, colStart: 49, colEnd: 59, slotName: 'L33+L34' }],
    L35: [{ rowStart: 5, rowEnd: 6, colStart: 60, colEnd: 70, slotName: 'L35+L36' }],
    L37: [{ rowStart: 8, rowEnd: 9, colStart: 38, colEnd: 48, slotName: 'L37+L38' }],
    L39: [{ rowStart: 8, rowEnd: 9, colStart: 49, colEnd: 59, slotName: 'L39+L40' }],
    L41: [{ rowStart: 8, rowEnd: 9, colStart: 60, colEnd: 70, slotName: 'L41+L42' }],
    L43: [{ rowStart: 11, rowEnd: 12, colStart: 38, colEnd: 48, slotName: 'L43+L44' }],
    L45: [{ rowStart: 11, rowEnd: 12, colStart: 49, colEnd: 59, slotName: 'L45+L46' }],
    L47: [{ rowStart: 11, rowEnd: 12, colStart: 60, colEnd: 70, slotName: 'L47+L48' }],
    L49: [{ rowStart: 14, rowEnd: 15, colStart: 38, colEnd: 48, slotName: 'L49+L50' }],
    L51: [{ rowStart: 14, rowEnd: 15, colStart: 49, colEnd: 59, slotName: 'L51+L52' }],
    L53: [{ rowStart: 14, rowEnd: 15, colStart: 60, colEnd: 70, slotName: 'L53+L54' }],
    L55: [{ rowStart: 17, rowEnd: 18, colStart: 38, colEnd: 48, slotName: 'L55+L56' }],
    L57: [{ rowStart: 17, rowEnd: 18, colStart: 49, colEnd: 59, slotName: 'L57+L58' }],
    L59: [{ rowStart: 17, rowEnd: 18, colStart: 60, colEnd: 70, slotName: 'L59+L60' }],
};

export const clashMap: Record<string, string[]> = getSlotViewPayload().conflicts;

export function cleanSlot(slotStr: string): string {
    let s = slotStr.trim();
    if (!s || s === '-') return s;

    if (s.includes('__')) {
        return s.split('__').map(cleanSlot).join('__');
    }

    const parts = s.split('+').map(p => p.trim());
    if (parts.length === 0) return s;

    const cleanedParts = parts.map((part) => {
        // TCC slot corruption
        if (part.startsWith('TCC5')) {
            const num = part.charAt(4); // '1' or '2'
            if (num === '1' || num === '2') {
                return `TCC${num}`;
            }
        }
        // TDD slot corruption
        if (part.startsWith('TD5D')) {
            const num = part.charAt(4); // '0' -> 1, '1' -> 2
            if (num === '0') return 'TDD1';
            if (num === '1') return 'TDD2';
        }
        // TAA slot corruption
        if (part.startsWith('TA5A')) {
            const num = part.charAt(4); // '0' -> 1, '1' -> 2
            if (num === '0') return 'TAA1';
            if (num === '1') return 'TAA2';
        }

        // Lab slot corruptions
        if (part.startsWith('L') || part.includes('L')) {
            const match = part.match(/L(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > 60) {
                    const firstTwo = parseInt(String(num).substring(0, 2), 10);
                    if (firstTwo <= 60) {
                        return `L${firstTwo}`;
                    }
                } else if (num > 0 && num <= 60) {
                    return `L${num}`;
                }
            }
        }
        
        return part;
    });

    if (cleanedParts.every(p => p.startsWith('L') || p.includes('L') || p === '-')) {
        const labParts = cleanedParts.filter(p => p.startsWith('L'));
        if (labParts.length === 4) {
            const matchA = labParts[0].match(/L(\d+)/);
            const matchB = labParts[2].match(/L(\d+)/);
            if (matchA && matchB) {
                const a = parseInt(matchA[1], 10);
                const b = parseInt(matchB[1], 10);
                if (a % 2 === 1 && b % 2 === 1) {
                    return `L${a}+L${a+1}+L${b}+L${b+1}`;
                }
            }
        } else if (labParts.length === 2) {
            const matchA = labParts[0].match(/L(\d+)/);
            if (matchA) {
                const a = parseInt(matchA[1], 10);
                if (a % 2 === 1) {
                    return `L${a}+L${a+1}`;
                }
            }
        }
    }

    return cleanedParts.join('+');
}

export function getSlot(slot: string, withName: boolean = true): slot[] {
    const cleaned = cleanSlot(slot);
    const slotNames = cleaned.split('+').map(s => s.trim());
    let slots: slot[] = [];
    for (const name of slotNames) {
        slots = slots.concat(slotMap[name] || []);
    }
    if (withName) return slots;
    return slots.map(s => ({ ...s, slotName: '' }));
}

export function getAllSlots(): string[] {
    return Object.values(slotMap).map(slots => slots[0].slotName);
}

export function getCollisions(s: slot): slot[] {
    return (clashMap[s.slotName] || []).flatMap(name => slotMap[name] || []);
}

/**
 * Helper to determine if a slot name represents a morning slot.
 */
export function isMorningSlot(slot: string): boolean {
    const cleaned = cleanSlot(slot);
    const parts = cleaned.split('+').map(s => s.trim().toUpperCase());
    for (const part of parts) {
        if (part.startsWith('L')) {
            const numMatch = part.match(/\d+/);
            if (numMatch) {
                const num = parseInt(numMatch[0], 10);
                if (num < 31) return true;
            }
        } else {
            if (part.includes('1')) return true;
        }
    }
    return false;
}

/**
 * Helper to determine if a slot name represents an evening slot.
 */
export function isEveningSlot(slot: string): boolean {
    const cleaned = cleanSlot(slot);
    const parts = cleaned.split('+').map(s => s.trim().toUpperCase());
    for (const part of parts) {
        if (part.startsWith('L')) {
            const numMatch = part.match(/\d+/);
            if (numMatch) {
                const num = parseInt(numMatch[0], 10);
                if (num >= 31) return true;
            }
        } else {
            if (part.includes('2')) return true;
        }
    }
    return false;
}

/**
 * Checks if a lab slot name belongs to the extra mural hours (Block 3 in morning: L5, L11, L17, L23, L29).
 */
export function isExtraMuralLabSlot(slot: string): boolean {
    const cleaned = cleanSlot(slot);
    const parts = cleaned.split('+').map(s => s.trim().toUpperCase());
    for (const part of parts) {
        if (part.startsWith('L')) {
            const numMatch = part.match(/\d+/);
            if (numMatch) {
                const num = parseInt(numMatch[0], 10);
                if ([5, 11, 17, 23, 29].includes(num)) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Pairs a list of theory slots with a list of lab slots for a faculty.
 * Ensures 1-to-1 mapping where possible and prioritizes session-based and extra-mural pairing.
 * Returns a Map of theorySlot -> labSlot.
 */
export function pairTheoryAndLabSlots(theorySlots: string[], labSlots: string[]): Map<string, string> {
    const pairings = new Map<string, string>();
    if (theorySlots.length === 0 || labSlots.length === 0) return pairings;
    const usedLabs = new Set<string>();

    // Pass 1: Try to find perfect session/extra-mural matches
    for (const theorySlot of theorySlots) {
        const isTheoryMorning = isMorningSlot(theorySlot);
        const isTheoryEvening = isEveningSlot(theorySlot);

        let matchedLab: string | undefined;
        if (isTheoryMorning) {
            // First priority: Look for an unused evening lab slot
            matchedLab = labSlots.find(slot => !usedLabs.has(slot) && isEveningSlot(slot));
            
            // Second priority: Look for an unused extra-mural morning lab slot
            if (!matchedLab) {
                matchedLab = labSlots.find(slot => !usedLabs.has(slot) && isMorningSlot(slot) && isExtraMuralLabSlot(slot));
            }
        } else if (isTheoryEvening) {
            // First priority: Look for an unused standard morning lab slot (non-extra-mural morning lab)
            matchedLab = labSlots.find(slot => !usedLabs.has(slot) && isMorningSlot(slot) && !isExtraMuralLabSlot(slot));
            
            // Second priority: Look for any unused morning lab slot
            if (!matchedLab) {
                matchedLab = labSlots.find(slot => !usedLabs.has(slot) && isMorningSlot(slot));
            }
        }

        if (matchedLab) {
            pairings.set(theorySlot, matchedLab);
            usedLabs.add(matchedLab);
        }
    }

    // Pass 2: For any remaining unpaired theory slots, match them with any remaining unused lab slots
    for (const theorySlot of theorySlots) {
        if (!pairings.has(theorySlot)) {
            const unmatchedLab = labSlots.find(slot => !usedLabs.has(slot));
            if (unmatchedLab) {
                pairings.set(theorySlot, unmatchedLab);
                usedLabs.add(unmatchedLab);
            }
        }
    }

    return pairings;
}

/**
 * Finds the corresponding lab slot for a given theory slot based on morning/evening session pairing.
 * - Morning theory -> Evening lab (or extra-mural)
 * - Evening theory -> Morning lab
 */
export function findMatchingLabSlot(theorySlot: string, labSlots: string[]): string | undefined {
    if (labSlots.length === 0) return undefined;
    const pairings = pairTheoryAndLabSlots([theorySlot], labSlots);
    return pairings.get(theorySlot) || labSlots[0];
}



