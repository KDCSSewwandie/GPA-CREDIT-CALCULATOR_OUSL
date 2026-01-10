import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCcnl8f1NZmUiUrvZmAhcZaCbXoJ38HWLE",
    authDomain: "credit-gpa-calculator.firebaseapp.com",
    projectId: "credit-gpa-calculator",
    storageBucket: "credit-gpa-calculator.firebasestorage.app",
    messagingSenderId: "969269581344",
    appId: "1:969269581344:web:aa4e0ec54efa5a3e3c8e45",
    measurementId: "G-TDBRS5GNZG"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}
export { analytics };