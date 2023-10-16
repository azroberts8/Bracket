import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, getRedirectResult, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

//import { Auth, getRedirectResult } from "./modules/auth.js";

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

export class Auth {
    constructor(app) {
        this.auth = getAuth(app);
        this.provider = new GoogleAuthProvider();

        onAuthStateChanged(this.auth, this.stateChangeAction)
    }

    login() {
        signInWithRedirect(this.auth, this.provider);
    }

    logout() {

    }

    stateChangeAction(user) {
        if(user) {
            // user is signed in
            const uid = user.uid;
            console.log(uid);
        } else {
            // user is signed out
        }
    }
}

class App {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.database = getDatabase(this.app);
        this.auth = new Auth(this.app);
    }

    login() {
        this.auth.login();
    }

    logout() {
        this.auth.logout();
    }
}

window.app = new App();

getRedirectResult(app.auth.auth)
    .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        // ...
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        //const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
    });