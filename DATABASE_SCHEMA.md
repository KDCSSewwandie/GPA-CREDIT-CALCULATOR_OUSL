# Firestore Database Schema

## Collections Overview

### 1. **users**
Stores user account information for both students and admins.

**Document ID:** User's Firebase Auth UID

**Fields:**
```typescript
{
  email: string;              // User's email address
  role: 'student' | 'admin';  // User role
  name: string;               // Full name
  studentId?: string;         // Student ID (for students only)
  staffId?: string;           // Staff ID (for admins only)
  createdAt: string;          // ISO timestamp
  completedSubjects?: Array<{  // Student's completed courses
    courseId: string;
    gradeLetter: string;
    credits: number;
  }>;
}
```

**Indexes:**
- `role` (ascending)
- `email` (ascending)

---

### 2. **courses**
Stores course catalog information.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  code: string;              // Course code (e.g., "EEY4189")
  name: string;              // Course name
  credits: number;           // Credit hours
  semester: string;          // Recommended semester (1-8)
  prerequisites: string[];   // Array of prerequisite course codes
  description?: string;      // Course description
  programId?: string;        // Reference to program
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}
```

**Indexes:**
- `code` (ascending)
- `semester` (ascending)
- `programId` (ascending)

---

### 3. **corrections**
Stores student correction requests for grade discrepancies.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  studentUid: string;        // Reference to user document
  courseId: string;          // Course code
  issueType: string;         // 'grade' | 'missing' | 'other'
  description: string;       // Detailed description
  status: string;            // 'pending' | 'approved' | 'rejected'
  createdAt: Timestamp;      // Firestore timestamp
  reviewedAt?: Timestamp;    // When admin reviewed
  reviewedBy?: string;       // Admin UID who reviewed
  adminNotes?: string;       // Admin's notes
}
```

**Indexes:**
- `studentUid` (ascending), `createdAt` (descending)
- `status` (ascending), `createdAt` (descending)

---

### 4. **programs**
Stores study program information.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  name: string;              // Program name (e.g., "Computer Science")
  code: string;              // Program code
  totalCredits: number;      // Required credits to graduate
  duration: number;          // Duration in semesters
  description: string;       // Program description
  requiredCourses: string[]; // Array of required course codes
  electiveCourses: string[]; // Array of elective course codes
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}
```

**Indexes:**
- `code` (ascending)

---

### 5. **enrollments**
Stores student course enrollments.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  studentUid: string;        // Reference to user document
  courseId: string;          // Reference to course document
  semester: string;          // Enrollment semester
  academicYear: string;      // Academic year (e.g., "2024/2025")
  status: string;            // 'enrolled' | 'completed' | 'dropped'
  enrolledAt: Timestamp;     // Firestore timestamp
  completedAt?: Timestamp;   // When course was completed
}
```

**Indexes:**
- `studentUid` (ascending), `semester` (ascending)
- `courseId` (ascending), `semester` (ascending)
- `status` (ascending)

---

### 6. **grades**
Stores official student grades.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  studentUid: string;        // Reference to user document
  courseId: string;          // Course code
  courseName: string;        // Course name (denormalized)
  credits: number;           // Course credits
  gradeLetter: string;       // Letter grade (A+, A, B+, etc.)
  gradePoint: number;        // Grade point value (0-4.0)
  semester: string;          // Semester taken
  academicYear: string;      // Academic year
  issuedAt: Timestamp;       // When grade was issued
  issuedBy: string;          // Admin UID who issued
  verified: boolean;         // Whether grade is verified
}
```

**Indexes:**
- `studentUid` (ascending), `semester` (descending)
- `courseId` (ascending)
- `verified` (ascending)

---

### 7. **notifications**
Stores user notifications.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  userId: string;            // User who receives notification
  type: string;              // 'info' | 'success' | 'warning' | 'error'
  title: string;             // Notification title
  message: string;           // Notification message
  read: boolean;             // Whether notification is read
  actionUrl?: string;        // Optional URL to navigate to
  createdAt: Timestamp;      // Firestore timestamp
  readAt?: Timestamp;        // When notification was read
}
```

**Indexes:**
- `userId` (ascending), `read` (ascending), `createdAt` (descending)

---

## Data Relationships

```
users (1) ──────────── (many) enrollments
users (1) ──────────── (many) grades
users (1) ──────────── (many) corrections
users (1) ──────────── (many) notifications

programs (1) ────────── (many) courses
courses (1) ─────────── (many) enrollments
courses (1) ─────────── (many) grades

courses (many) ──────── (many) courses (prerequisites)
```

---

## Sample Data

### Sample User (Student)
```json
{
  "email": "student@ousl.lk",
  "role": "student",
  "name": "John Doe",
  "studentId": "S12345",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "completedSubjects": [
    {
      "courseId": "CS101",
      "gradeLetter": "A",
      "credits": 3
    }
  ]
}
```

### Sample Course
```json
{
  "code": "EEY4189",
  "name": "Software Design in Group",
  "credits": 3,
  "semester": "8",
  "prerequisites": ["CS301", "SE301"],
  "description": "Advanced software engineering practices",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Sample Correction Request
```json
{
  "studentUid": "abc123xyz",
  "courseId": "CS201",
  "issueType": "grade",
  "description": "My grade shows B+ but should be A",
  "status": "pending",
  "createdAt": "2024-03-15T14:30:00.000Z"
}
```

---

## Migration Notes

### From Current State
The current implementation stores `completedSubjects` as an array within the user document. For better scalability, consider:

1. **Option A (Current):** Keep as embedded array (simpler, good for small datasets)
2. **Option B (Recommended):** Move to separate `grades` collection (better for large datasets)

### Recommended Migration Path
1. Keep current structure for MVP
2. Add `grades` collection for official records
3. Use `completedSubjects` for student's manual GPA calculations
4. Use `grades` for official university records

---

## Firestore Composite Indexes Required

Add these in Firebase Console under Firestore > Indexes:

```
Collection: corrections
Fields: studentUid (Ascending), createdAt (Descending)

Collection: corrections  
Fields: status (Ascending), createdAt (Descending)

Collection: enrollments
Fields: studentUid (Ascending), semester (Ascending)

Collection: grades
Fields: studentUid (Ascending), semester (Descending)

Collection: notifications
Fields: userId (Ascending), read (Ascending), createdAt (Descending)
```

---

## Security Considerations

1. **User Data:** Students can only access their own data
2. **Admin Access:** Admins can read all data but specific write permissions
3. **Corrections:** Cannot be deleted to maintain audit trail
4. **Grades:** Only admins can create/update, students read-only
5. **Role Changes:** Users cannot change their own role

---

## Backup Strategy

1. **Daily Backups:** Use Firebase scheduled exports
2. **Retention:** Keep 30 days of backups
3. **Critical Collections:** users, grades, enrollments
4. **Export Format:** JSON for easy restoration

---

## Performance Optimization

1. **Denormalization:** Store course names in grades for faster queries
2. **Caching:** Cache course catalog on client
3. **Pagination:** Use Firestore pagination for large lists
4. **Indexes:** Create composite indexes for common queries
5. **Batch Operations:** Use batch writes for bulk updates
