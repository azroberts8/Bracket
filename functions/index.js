/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//const {onRequest} = require("firebase-functions/v2/https");
//const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const { onValueCreated, onValueUpdated } = require("firebase-functions/v2/database");
const {logger} = require("firebase-functions");

const admin = require("firebase-admin");
const { user } = require("firebase-functions/v1/auth");
admin.initializeApp();

// exports.stagingtournament = onValueCreated("/staging/new-tournament/{tid}", (event) => {
//     let data = event.data.val();
//     let tournamentID = event.params.tid;

//     //return admin.database().ref('/tournaments').push(data);
//     return event.data.ref.parent.parent.parent.child("tournaments").child(tournamentID).set(data);
// });

exports.newTournament = onValueCreated("/tournaments/{tournID}", (event) => {
    let data = event.data.val();
    let tournamentID = event.params.tournID;
    let owner = data.owner;

    let bracket = {
        0: {
            0: data.owner
        },
        round: 0
    }

    return event.data.ref.parent.parent.child("users").child(owner).child("tournaments").child(tournamentID).set(data)
        .then(event.data.ref.parent.parent.child("brackets").child(tournamentID).set(bracket));
});

exports.editTournament = onValueUpdated("/tournaments/{tournID}", (event) => {
    let tournID = event.params.tournID;
    let dbRef = admin.database().ref();

    return dbRef.child('tournaments').child(tournID).once('value').then((snapshot) => {
        const tournament = snapshot.val();

        return Promise.all(Object.values(tournament.members).map((userID) => {
            return dbRef.child('users').child(userID).child('tournaments').child(tournID).set(tournament);
        }));
    });
});

exports.joinEvent = onValueCreated("/join/{actID}", (event) => {
    let data = event.data.val();
    let tournID = ("tournID" in data) ? data.tournID : "null";
    let userID = ("userID" in data) ? data.userID : "null";

    let dbRef = admin.database().ref();

    let bracketPromise = dbRef.child('brackets').child(tournID).once('value').then((snapshot) => {
        if(snapshot.exists()) return snapshot.val();
        else return {};
    });
    let membersPromise = dbRef.child('tournaments').child(tournID).child('members').once('value').then((snapshot) => {
        if(snapshot.exists()) return snapshot.val();
        else return {};
    });

    return Promise.all([bracketPromise, membersPromise]).then((values) => {
        let bracket = values[0];
        let members = values[1];
        if(!Object.values(members).includes(userID) && bracket.round === 0) {
            let memberNum = Object.values(members).length;

            return dbRef.child('brackets').child(tournID).child('0').child(`${ memberNum }`).set(userID)
                .then(dbRef.child('tournaments').child(tournID).child('members').child(`${ memberNum }`).set(userID));
        } else return dbRef.child('error').set(members);
    })
});