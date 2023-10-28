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
            
            const path = document.location.pathname.split("/").slice(1);
            if(path[0] === "t") {
                window.app.loadTournament(path[1]);
            } else window.app.loadDashboard();
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

    loadTournament(tournID) {
        const tournRef = ref(this.database, `tournaments/${tournID}/`);
        onValue(tournRef, (snapshot) => {
            if(!snapshot.exists()) {
                window.app.loadDashboard();
            } else {
                window.app.tournData = snapshot.val();
            }
            this.renderTournament(tournID);
        })
    }

    createEvent() {
        const eventName = document.getElementById("eventNameInput").value;
        const eventData = {
            name: eventName,
            owner: window.app.user.uid,
            ownerDisplay: window.app.user.displayName,
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
            userID: window.app.user.uid,
            userDisplay: window.app.user.displayName
        }

        const actionID = push(child(ref(this.database), 'join')).key;
        const updates = {};
        updates[`/join/${actionID}`] = joinObject;
        update(ref(this.database), updates);
    }

    updateTournament() {
        const updates = {};
        if(document.getElementById("typeInput").value != this.tournData.type) updates[`/tournaments/${ document.location.pathname.split("/")[2] }/type`] = document.getElementById("typeInput").value;
        if(document.getElementById("dateInput").value != this.tournData.date) updates[`/tournaments/${ document.location.pathname.split("/")[2] }/date`] = document.getElementById("dateInput").value;
        if(document.getElementById("locationInput").value != this.tournData.location) updates[`/tournaments/${ document.location.pathname.split("/")[2] }/location`] = document.getElementById("locationInput").value;

        update(ref(this.database), updates);
    }

    postLoss() {
        const loseObject = {
            userID: window.app.user.uid,
            tournID: document.location.pathname.split("/")[2]
        }

        const actionID = push(child(ref(this.database), 'lose')).key;
        const updates = {};
        updates[`/lose/${actionID}`] = loseObject;
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

    renderTournament(tournID) {
        document.querySelector("main").innerHTML = `
        <div class="tournament">
            ${ (this.user.uid === this.tournData.owner) ? `
            <div class="window tournamentEditor">
                <h2>${ this.tournData.name }</h2>
                <span class="sport"><input type="text" id="typeInput" placeholder="Game/Sport" value="${ ("type" in this.tournData) ? this.tournData.type : "" }"></span>
                <span class="date"><input type="date" id="dateInput" placeholder="Date" value="${ ("date" in this.tournData) ? this.tournData.date : "" }"></span>
                <span class="location"><input type="text" id="locationInput" placeholder="Location" value="${ ("location" in this.tournData) ? this.tournData.location : "" }"></span>
                <p class="participants">${ Object.values(this.tournData.members).length } participants</p>
                <p class="eventID">Event ID: ${ tournID }</p>
                <div class="buttonRack">
                    <button onclick="window.app.updateTournament()">Save Changes</button>
                    <button onclick="window.app.postLoss()">Post Loss</button>
                </div>
            </div>
            ` : `
            <div class="window tournamentInfo">
                <h2>${ this.tournData.name }</h2>
                <p class="sport">${ ("type" in this.tournData) ? this.tournData.type : "-" }</p>
                <p class="date">${ ("date" in this.tournData) ? new Date(this.tournData.date).toDateString() : "-" }</p>
                <p class="location">${ ("location" in this.tournData) ? this.tournData.location : "-" }</p>
                <p class="participants">${ Object.values(this.tournData.members).length } participants</p>
                <p class="eventID">Event ID: ${ tournID }</p>
                <div class="buttonRack">
                    <button onclick="window.app.postLoss()">Post Loss</button>
                </div>
            </div>` }
            <div class="bracket">

                <ul class="round round1">
                    <li class="spacer">&nbsp;</li>

                    <li class="match top winner">@azroberts</li>
                    <li class="spacer matchSpacer">&nbsp;</li>
                    <li class="match bottom">@urmom</li>

                    <li class="spacer">&nbsp;</li>

                    <li class="match top">@noobmaster69</li>
                    <li class="spacer matchSpacer">&nbsp;</li>
                    <li class="match bottom winner">@andynovo</li>

                    <li class="spacer">&nbsp;</li>

                    <li class="match top winner">@alia</li>
                    <li class="spacer matchSpacer">&nbsp;</li>
                    <li class="match bottom">@trevor</li>

                    <li class="spacer">&nbsp;</li>

                    <li class="match top">@bimbi</li>
                    <li class="spacer matchSpacer">&nbsp;</li>
                    <li class="match bottom winner">@chisos</li>

                    <li class="spacer">&nbsp;</li>
                </ul>

                <ul class="round round2">
                    <li class="spacer">&nbsp;</li>

                    <li class="match top winner">@azroberts</li>
                    <li class="spacer matchSpacer">&nbsp;</li>
                    <li class="match bottom">@andynovo</li>

                    <li class="spacer">&nbsp;</li>

                    <li class="match top">@alia</li>
                    <li class="spacer matchSpacer">&nbsp;</li>
                    <li class="match bottom winner">@chisos</li>

                    <li class="spacer">&nbsp;</li>
                </ul>

                <ul class="round round3">
                    <li class="spacer">&nbsp;</li>

                    <li class="match top winner">@azroberts</li>
                    <li class="spacer matchSpacer">&nbsp;</li>
                    <li class="match bottom">@chisos</li>

                    <li class="spacer">&nbsp;</li>
                </ul>
            </div>
        </div>
        `
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