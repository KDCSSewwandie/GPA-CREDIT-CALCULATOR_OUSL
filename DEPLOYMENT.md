# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Git installed

---

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `credit-gpa-calculator`
4. Enable Google Analytics (optional)
5. Create project

### 1.2 Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Save

### 1.3 Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in **Production Mode**
4. Choose location (closest to your users)
5. Click "Enable"

### 1.4 Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (`</>`)
4. Register app name: `GPA Calculator`
5. Copy the configuration object

---

## Step 2: Local Setup

### 2.1 Clone Repository
```bash
git clone <your-repo-url>
cd GPA_Calculator_version_2
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Configure Environment Variables
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2.4 Test Locally
```bash
npm run dev
```

Visit `http://localhost:5173` to test the application.

---

## Step 3: Deploy Firestore Security Rules

### 3.1 Login to Firebase CLI
```bash
firebase login
```

### 3.2 Initialize Firebase
```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Hosting
- ❌ Functions (not needed yet)

Configuration:
- Use existing project: Select your project
- Firestore rules file: `firestore.rules`
- Firestore indexes file: `firestore.indexes.json`
- Public directory: `dist`
- Single-page app: **Yes**
- Set up automatic builds: **No**

### 3.3 Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

---

## Step 4: Create Firestore Indexes

### 4.1 Create `firestore.indexes.json`
```json
{
  "indexes": [
    {
      "collectionGroup": "corrections",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "studentUid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "corrections",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "grades",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "studentUid", "order": "ASCENDING" },
        { "fieldPath": "semester", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 4.2 Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

---

## Step 5: Build for Production

### 5.1 Build the Application
```bash
npm run build
```

This creates optimized files in the `dist` directory.

### 5.2 Test Production Build Locally
```bash
npm run preview
```

---

## Step 6: Deploy to Firebase Hosting

### 6.1 Deploy
```bash
firebase deploy --only hosting
```

### 6.2 Get Your URL
After deployment, you'll get a URL like:
```
https://credit-gpa-calculator.web.app
```

---

## Step 7: Post-Deployment Setup

### 7.1 Create Admin Account
1. Visit your deployed site
2. Go to Admin Signup
3. Create the first admin account
4. Verify email

### 7.2 Add Sample Courses
1. Login as admin
2. Go to Admin Dashboard
3. Add courses using the interface

### 7.3 Test Student Flow
1. Create a student account
2. Verify all features work
3. Test GPA calculation
4. Test correction requests

---

## Step 8: Monitoring & Maintenance

### 8.1 Enable Firebase Analytics
```bash
firebase deploy --only hosting
```

### 8.2 Monitor Usage
- Go to Firebase Console
- Check **Analytics** for user activity
- Check **Firestore** for database usage
- Check **Authentication** for user stats

### 8.3 Set Up Alerts
1. Go to **Project Settings**
2. Click **Integrations**
3. Set up email alerts for:
   - High database usage
   - Authentication errors
   - Hosting errors

---

## Continuous Deployment (Optional)

### Option 1: GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Option 2: Vercel (Alternative)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

---

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Fails
```bash
# Check Firebase CLI version
firebase --version

# Update if needed
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

### Security Rules Not Working
1. Check rules in Firebase Console
2. Verify deployment: `firebase deploy --only firestore:rules`
3. Test rules in Firebase Console > Firestore > Rules > Simulator

### Environment Variables Not Loading
1. Ensure `.env` file exists
2. Restart dev server
3. Check variable names start with `VITE_`
4. Rebuild: `npm run build`

---

## Security Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Firestore security rules deployed
- [ ] API keys not exposed in code
- [ ] HTTPS enabled (automatic with Firebase Hosting)
- [ ] Email verification enabled
- [ ] Admin accounts created securely
- [ ] Test all authentication flows
- [ ] Test all CRUD operations
- [ ] Monitor Firebase usage limits

---

## Performance Optimization

### 1. Enable Caching
In `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 2. Enable Compression
Firebase Hosting automatically compresses files.

### 3. Monitor Performance
- Use Firebase Performance Monitoring
- Check Lighthouse scores
- Monitor Core Web Vitals

---

## Backup Strategy

### Automated Backups
```bash
# Install firestore-backup
npm install -g firestore-backup

# Create backup script
firestore-backup --accountCredentials path/to/credentials.json --backupPath ./backups
```

### Schedule Backups
Use Cloud Scheduler or cron jobs to run daily backups.

---

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

## Cost Estimation

### Firebase Free Tier (Spark Plan)
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 20,000 deletes/day
- ✅ 1 GB storage
- ✅ 10 GB/month transfer

**Suitable for:** Up to ~500 active students

### Paid Plan (Blaze - Pay as you go)
Required when exceeding free tier limits.

**Estimated costs for 1000 students:**
- Firestore: ~$5-10/month
- Hosting: Free (10 GB/month included)
- Authentication: Free

---

## Next Steps After Deployment

1. ✅ Monitor user feedback
2. ✅ Add more features
3. ✅ Implement Cloud Functions
4. ✅ Add email notifications
5. ✅ Create mobile app (optional)
6. ✅ Add analytics dashboard
7. ✅ Implement data export
8. ✅ Add bulk operations

Good luck with your deployment! 🚀
