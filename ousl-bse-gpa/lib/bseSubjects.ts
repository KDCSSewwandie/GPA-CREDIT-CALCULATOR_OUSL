export type Subject = {
    code: string;
    name: string;
    credits: number;
    level: number;
    category: "Compulsory" | "Elective" | "Mandatory";
    isGpa: boolean;
    active: boolean;
    prerequisites?: string[];
};

export const BSE_SUBJECTS: Subject[] = [
    // LEVEL 3
    { code: "EEI3346", name: "Programming Fundamentals", credits: 3, level: 3, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI3262", name: "Object Oriented Programming", credits: 3, level: 3, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI3346"] },
    { code: "EEI3376", name: "Engineering Mathematics I", credits: 3, level: 3, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI3377", name: "Engineering Mathematics II", credits: 3, level: 3, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI3378", name: "Engineering Physics", credits: 3, level: 3, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI3379", name: "Engineering Chemistry", credits: 3, level: 3, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI3380", name: "Engineering Drawing", credits: 3, level: 3, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI3381", name: "Communication Skills", credits: 2, level: 3, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI3382", name: "Computer Applications", credits: 2, level: 3, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI3383", name: "Ethics & Society", credits: 2, level: 3, category: "Compulsory", isGpa: true, active: true },

    // LEVEL 4
    { code: "EEI4268", name: "Web Application Development", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI3346"] }, // Assuming prereq based on context, guidebook usually specifies
    { code: "EEI4267", name: "Media & Communication Technologies", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI4266", name: "Database Systems", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI4265", name: "Data Structures & Algorithms", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI3262"] },
    { code: "EEI4264", name: "Operating Systems", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI4263", name: "Computer Networks", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI4262", name: "Software Engineering", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI4261", name: "Engineering Mathematics III", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI3376", "EEI3377"] },
    { code: "EEI4260", name: "Electronics Fundamentals", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI3378"] },
    { code: "EEI4259", name: "Statistics for Engineers", credits: 3, level: 4, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI3376"] },

    // LEVEL 5
    { code: "EEI5270", name: "Information Security", credits: 3, level: 5, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI4263"] },
    { code: "EEI5269", name: "Artificial Intelligence", credits: 3, level: 5, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI4265"] },
    { code: "EEI5268", name: "Machine Learning", credits: 3, level: 5, category: "Elective", isGpa: true, active: true, prerequisites: ["EEI4259", "EEI5269"] },
    { code: "EEI5267", name: "Human Computer Interaction", credits: 3, level: 5, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI5266", name: "Cloud Computing", credits: 3, level: 5, category: "Elective", isGpa: true, active: true, prerequisites: ["EEI4263"] },
    { code: "EEI5265", name: "Mobile Application Development", credits: 3, level: 5, category: "Elective", isGpa: true, active: true, prerequisites: ["EEI3262"] },
    { code: "EEI5264", name: "Distributed Systems", credits: 3, level: 5, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI4264", "EEI4263"] },
    { code: "EEI5263", name: "Advanced Databases", credits: 3, level: 5, category: "Elective", isGpa: true, active: true, prerequisites: ["EEI4266"] },
    { code: "EEI5262", name: "Embedded Systems", credits: 3, level: 5, category: "Elective", isGpa: true, active: true, prerequisites: ["EEI4260"] },
    { code: "EEI5261", name: "Research Methods", credits: 3, level: 5, category: "Compulsory", isGpa: true, active: true },

    // LEVEL 6
    { code: "EEI6200", name: "Industrial Training", credits: 6, level: 6, category: "Mandatory", isGpa: false, active: true },
    { code: "EEI6270", name: "Final Year Project", credits: 6, level: 6, category: "Mandatory", isGpa: false, active: true },
    { code: "EEI6268", name: "Software Architecture", credits: 3, level: 6, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI4262"] },
    { code: "EEI6267", name: "IT Project Management", credits: 3, level: 6, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI6266", name: "Entrepreneurship", credits: 3, level: 6, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI6265", name: "Professional Practice", credits: 2, level: 6, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI6264", name: "Advanced Web Technologies", credits: 3, level: 6, category: "Elective", isGpa: true, active: true, prerequisites: ["EEI4268"] },
    { code: "EEI6263", name: "Cyber Law & Ethics", credits: 3, level: 6, category: "Compulsory", isGpa: true, active: true },
    { code: "EEI6262", name: "Quality Assurance", credits: 3, level: 6, category: "Compulsory", isGpa: true, active: true, prerequisites: ["EEI4262"] },
    { code: "EEI6261", name: "Emerging Technologies", credits: 3, level: 6, category: "Elective", isGpa: true, active: true },
];
