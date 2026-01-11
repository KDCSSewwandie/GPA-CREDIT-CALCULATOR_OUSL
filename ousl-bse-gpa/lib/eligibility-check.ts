import { Course, Program, StudentProfile } from "@/types";

export type EligibilityResult = {
    programId: string;
    programName: string;
    isEligible: boolean;
    missingRequirements: string[];
    progress: number; // 0-100
    hasCompulsory: boolean;
    creditsEarned: number;
    creditsRequired: number;
};

export const checkEligibility = (
    studentProfile: StudentProfile,
    allCourses: Course[],
    programs: Program[]
): EligibilityResult[] => {
    const results: EligibilityResult[] = [];

    // Map completed courses for easy lookup from the central data structure
    const completedCourseCodes = new Set(
        studentProfile.completedSubjects.map((s) => s.code)
    );

    const totalEarnedCredits = allCourses
        .filter(c => completedCourseCodes.has(c.code))
        .reduce((sum, c) => sum + c.credits, 0);

    const level3Credits = allCourses
        .filter(c => c.level === 3 && completedCourseCodes.has(c.code))
        .reduce((sum, c) => sum + c.credits, 0);

    const hasEfIL = completedCourseCodes.has("FDE3023");
    const hasLTE34SI = completedCourseCodes.has("LTE34SI");

    programs.forEach((prog) => {
        const missingReqs: string[] = [];

        // 1. Credit Check: Use the total earned credits from the profile's academicProgress
        // or recalculate from completedSubjects for higher precision
        const earnedCredits = studentProfile.completedSubjects.reduce((sum, s) => sum + s.credits, 0);
        const creditCondition = earnedCredits >= prog.minCredits;

        if (!creditCondition) {
            missingReqs.push(`Credit Gap: Need ${prog.minCredits - earnedCredits} more credits`);
        }

        // 2. Program-Specific Logic
        let statusEligible = creditCondition;

        if (prog.id === "diploma") {
            // Check for Diploma-specific compulsory subjects
            const compulsoryCodes = allCourses
                .filter(c => (c.programIds?.includes("diploma") || c.programIds?.includes("DSE")) && c.category === "Compulsory")
                .map(c => c.code);

            compulsoryCodes.forEach(code => {
                if (!completedCourseCodes.has(code)) {
                    statusEligible = false;
                    missingReqs.push(`Missing Compulsory: ${code}`);
                }
            });
        }
        else if (prog.id === "hnd") {
            // HND Logic: EarnedCredits >= 90 AND Level 3 completed AND Level 4 progress
            const dip = programs.find(p => p.id === "diploma");
            if (dip && level3Credits < dip.minCredits) {
                statusEligible = false;
                missingReqs.push(`Level Pending: Must complete Level 3 (${dip.minCredits} credits)`);
            }

            // Check HND compulsory subjects
            const hndCompulsoryCodes = allCourses
                .filter(c => (c.programIds?.includes("hnd") || c.programIds?.includes("HND")) && c.category === "Compulsory")
                .map(c => c.code);

            hndCompulsoryCodes.forEach(code => {
                if (!completedCourseCodes.has(code)) {
                    statusEligible = false;
                    missingReqs.push(`Missing Compulsory: ${code}`);
                }
            });
        }
        else if (prog.id === "degree") {
            // Degree Logic: Credits >= 125 AND EfIL AND LTE34SI
            if (totalEarnedCredits < 125) {
                statusEligible = false;
                // Reason already added in creditCondition check
            }
            if (!hasEfIL) {
                statusEligible = false;
                missingReqs.push("Missing Mandatory: EfIL (FDE3023)");
            }
            if (!hasLTE34SI) {
                statusEligible = false;
                missingReqs.push("Missing Mandatory: EAP (LTE34SI)");
            }
        }

        results.push({
            programId: prog.id!,
            programName: prog.name,
            isEligible: statusEligible,
            missingRequirements: missingReqs,
            progress: Math.min(100, Math.round((earnedCredits / prog.minCredits) * 100)),
            hasCompulsory: !missingReqs.some(r => r.includes("Compulsory")),
            creditsEarned: earnedCredits,
            creditsRequired: prog.minCredits
        });
    });

    return results;
};
