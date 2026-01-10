import { BSE_SUBJECTS } from "./bseSubjects";
import { StudentResult } from "./gpa";

export function checkEligibility(results: StudentResult[]) {
    // Calculate earned credits (assuming D or better is a pass for credit accumulation)
    const passedResults = results.filter(r => ["A", "B", "C", "D"].includes(r.grade));

    const earnedCredits = passedResults.reduce((acc, r) => acc + r.credits, 0);
    const REQUIRED_CREDITS = 125;

    // Check for missing compulsory subjects
    // A subject is missing if it's Compulsory and not found in passedResults
    const missingCompulsory = BSE_SUBJECTS.filter(s =>
        s.category === "Compulsory" &&
        !passedResults.some(r => r.subjectCode === s.code)
    );

    // Check for prerequisites blocking
    // For each subject in BSE_SUBJECTS, check if its prerequisites are met
    // This is for "next semester" planning, but for "eligibility" to graduate, we just check if everything is done.
    // However, the prompt asked for "Credit deficiency detection" and "Subject prerequisite checking".

    // Let's identify subjects the student CANNOT take yet due to missing prerequisites
    const blockedSubjects = BSE_SUBJECTS.filter(s => {
        if (!s.prerequisites || s.prerequisites.length === 0) return false;
        // Check if all prerequisites are passed
        const prereqsMet = s.prerequisites.every(pCode =>
            passedResults.some(r => r.subjectCode === pCode)
        );
        return !prereqsMet;
    }).map(s => s.code);

    return {
        earnedCredits,
        requiredCredits: REQUIRED_CREDITS,
        deficiency: REQUIRED_CREDITS - earnedCredits,
        isEligibleForGraduation: earnedCredits >= REQUIRED_CREDITS && missingCompulsory.length === 0,
        missingCompulsory: missingCompulsory.map(s => s.code),
        blockedSubjects
    };
}
