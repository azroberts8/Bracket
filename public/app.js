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

export class App {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.database = getDatabase(this.app);
        this.auth = getAuth(this.app);
        this.provider = new GoogleAuthProvider();

        onAuthStateChanged(this.auth, this.stateChangeAction)
    }

    login() {
        signInWithRedirect(this.auth, this.provider);
    }

    stateChangeAction(user) {
        if(user) {
            // user is signed in
            window.app.user = user;
            console.log(user);
            window.app.renderDashboard();
        } else {
            // user is logged out
            window.app.user = null;
            window.app.renderLogin();
        }
    }

    renderLogin() {
        document.querySelector("main").innerHTML = `
        <div class="window login">
            <h1>Login</h1>
            <p>You must be signed in to use bracket. Please login using your google account by clicking the button below.</p>
            <button onclick="window.app.login()">Login</button>
            <br><br><br><br>
        </div>`;
    }

    renderDashboard() {
        document.querySelector("main").innerHTML = `
        <div class="dashboard">
            <div class="main">
                <div class="window profile">
                    <div class="profileImage" style="background-image: url('${ this.user.photoURL }');"></div>
                    <div class="profileInfo">
                        <h1 class="profileName">${ this.user.displayName }</h1>
                        <p class="profileTagline">${ this.user.email }</p>
                    </div>
                </div>
                <div class="window selectTournament">
                    <div class="eventActionItem">
                        <h2>CREATE EVENT</h2>
                        <input type="text" placeholder="Event Name">
                        <button>Create Event</button>
                    </div>
                    <div class="eventActionItem">
                        <h2>JOIN EVENT</h2>
                        <input type="text" placeholder="Event Code">
                        <button>Join Event</button>
                    </div>
                </div>
                <div class="tournamentSpread">
                    <div class="window event">
                        <h2>Ultimate Rock Paper Scissors</h2>
                        <p class="sport">Rock Paper Scissors</p>
                        <p class="date">Oct 20, 2023</p>
                        <p class="location">University of Delaware Bob Carpenter Center</p>
                        <p class="participants">5,632 participants</p>
                    </div>
                    <div class="window event">
                        <h2>Weekend Mario Kart Tournament</h2>
                        <p class="sport">Mario Kart 8</p>
                        <p class="date">Oct 21 - Oct 22, 2023</p>
                        <p class="location">Sparc Lab</p>
                        <p class="participants">21 participants</p>
                    </div>
                    <div class="window event">
                        <h2>Goal Smasher 2023</h2>
                        <p class="sport">Rocket League</p>
                        <p class="date">Nov 4 - Nov 5, 2023</p>
                        <p class="location">UDel E-Sports Arena</p>
                        <p class="participants">83 participants</p>
                    </div>
                    <div class="window event">
                        <h2>Blue Hens Soccer Match</h2>
                        <p class="sport">Soccer</p>
                        <p class="date">Mar 3, 2024</p>
                        <p class="location">UDel Green</p>
                        <p class="participants">102 participants</p>
                    </div>
                    <div class="window event">
                        <h2>Blue Hens Soccer Match 2</h2>
                        <p class="sport">Soccer</p>
                        <p class="date">Mar 10, 2024</p>
                        <p class="location">UDel Green</p>
                        <p class="participants">102 participants</p>
                    </div>
                </div>
            </div>
        </div>`
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