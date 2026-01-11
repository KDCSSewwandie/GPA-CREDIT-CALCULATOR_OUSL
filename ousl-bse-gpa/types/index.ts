export interface Program {
    id?: string;
    name: string; // "Diploma in Software Engineering", "Bachelor of Software Engineering Honours"
    code: string; // "DSE", "BSE"
    level: number; // 3 (Diploma), 4 (HND), 6 (Degree)
    minCredits: number;
    description?: string;
    active: boolean;
}

export interface Course {
    id?: string;
    code: string;
    name: string;
    credits: number;
    level: number;
    semester?: number; // 1 or 2
    category: "Compulsory" | "Elective" | "Industrial Training" | "Continuing Education" | "Mandatory";
    prerequisites: string[]; // List of Course Codes
    corequisites?: string[]; // List of Course Codes (Concurrent Registration)
    programIds: string[]; // ["DSE", "BSE"] - which programs this course belongs to
    isGpa: boolean; // Whether it counts for GPA
    priorityLevel: number; // 1 = High (Compulsory), 2 = Medium (Elective), etc. for automated suggestions
    active: boolean;
    description?: string;
}

export interface CompletedSubject {
    code: string;
    name: string;
    credits: number;
    level: number;
    category: string;
    status: "Completed";
}

export interface StudentProfile {
    uid: string;
    email: string;
    displayName: string;
    studentId?: string;
    enrolledProgramId: string; // "BSE"
    completedCourses: {
        courseId: string; // Course Code
        grade: string;
        term?: string;
    }[];
    completedSubjects: CompletedSubject[];
    academicProgress?: {
        earnedCredits: number;
        remainingCredits: number;
        categoryProgress: {
            [category: string]: {
                completed: number;
                required: number;
                remaining: number;
            };
        };
        lastUpdated: string;
    };
    eligibilitySnapshot?: {
        checkedAt: string;
        [programId: string]: any; // { eligible: boolean, reasons: string[] }
    };
}
