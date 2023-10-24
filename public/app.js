import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, set, push, child, update, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
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
            window.app.loadDashboard();
        } else {
            // user is logged out
            window.app.user = null;
            window.app.renderLogin();
        }
    }

    loadDashboard() {
        const userID = this.user.uid;
        const dashRef = ref(this.database, `users/${userID}/`);
        onValue(dashRef, (snapshot) => {
            if(!snapshot.exists()) {
                // data for user does not yet exist (could be first sign in)
                window.app.dashData = {
                    displayName: window.app.user.displayName,
                    email: window.app.user.email,
                    tournaments: {}
                }
                set(dashRef, window.app.dashData);
            } else {
                window.app.dashData = snapshot.val();
            }
            this.renderDashboard();
        });
    }

    createEvent() {
        const eventName = document.getElementById("eventNameInput").value;
        const eventData = {
            name: eventName,
            owner: window.app.user.uid,
            members: {
                0: window.app.user.uid
            }
        };
        const tournID = push(child(ref(this.database), 'tournaments')).key;

        const updates = {};
        updates[`/tournaments/${tournID}`] = eventData;

        update(ref(this.database), updates);

        window.location.href = `/t/${ tournID }`;
    }

    joinEvent() {
        const joinObject = {
            tournID: document.getElementById("eventIDInput").value,
            userID: window.app.user.uid
        }

        const actionID = push(child(ref(this.database), 'join')).key;
        const updates = {};
        updates[`/join/${actionID}`] = joinObject;
        update(ref(this.database), updates);
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
                    <img class="profileImage" src="${ this.user.photoURL }" referrerpolicy="no-referrer">
                    <div class="profileInfo">
                        <h1 class="profileName">${ this.user.displayName }</h1>
                        <p class="profileTagline">${ this.user.email }</p>
                    </div>
                </div>
                <div class="window selectTournament">
                    <div class="eventActionItem">
                        <h2>CREATE EVENT</h2>
                        <input type="text" placeholder="Event Name" id="eventNameInput">
                        <button onClick="window.app.createEvent();">Create Event</button>
                    </div>
                    <div class="eventActionItem">
                        <h2>JOIN EVENT</h2>
                        <input type="text" placeholder="Event Code" id="eventIDInput">
                        <button onClick="window.app.joinEvent()">Join Event</button>
                    </div>
                </div>
                <div class="tournamentSpread">
                    ${ (!("tournaments" in window.app.dashData)) ? "" : Object.entries(window.app.dashData.tournaments).reduce((out, val) => {
                        return out.concat(`
                            <div class="window event">
                                <h2>${ val[1].name }</h2>
                                <p class="sport">${ ("type" in val[1]) ? val[1].type : "-" }</p>
                                <p class="date">${ ("date" in val[1]) ? val[1].date : "-" }</p>
                                <p class="location">${ ("location" in val[1]) ? val[1].location : "-" }</p>
                                <p class="participants">${ Object.entries(val[1].members).length } participants</p>
                                <a href="/t/${ val[0] }">View Event</a>
                            </div>
                        `);
                    }, "") }
                </div>
            </div>
        </div>`;
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