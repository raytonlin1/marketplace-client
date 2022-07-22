// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXIIGYxS1e6h2yTc8NG_Ys1q8D9xJI_ys",
  authDomain: "marketplace-a3ce8.firebaseapp.com",
  projectId: "marketplace-a3ce8",
  storageBucket: "marketplace-a3ce8.appspot.com",
  messagingSenderId: "1034302828801",
  appId: "1:1034302828801:web:7990c872452e947349ab00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();