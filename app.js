import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_EHCJ2_5vKVqjgyt7SLKJ4TvGpRbcsWo",
    authDomain: "bracket-a22a7.firebaseapp.com",
    projectId: "bracket-a22a7",
    storageBucket: "bracket-a22a7.appspot.com",
    messagingSenderId: "105687320995",
    appId: "1:105687320995:web:68556701cf07f3614b3216"
};

const app = initializeApp(firebaseConfig);

console.log(app);