export type Grade = "A" | "B" | "C" | "D" | "F";

export type StudentResult = {
    subjectCode: string;
    grade: Grade;
    credits: number;
    gpaEligible: boolean;
};

const GRADE_POINTS: Record<Grade, number> = {
    "A": 4.00,
    "B": 3.00,
    "C": 2.00,
    "D": 1.00,
    "F": 0.00
};

export function calculateGPA(results: StudentResult[]): string {
    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach(result => {
        if (result.gpaEligible) {
            const points = GRADE_POINTS[result.grade] || 0;
            totalPoints += points * result.credits;
            totalCredits += result.credits;
        }
    });

    if (totalCredits === 0) return "0.00";
    return (totalPoints / totalCredits).toFixed(2);
}
