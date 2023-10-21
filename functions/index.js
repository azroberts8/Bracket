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

    return event.data.ref.parent.parent.child("users").child(owner).child("tournaments").child(tournamentID).set(data);
});

exports.editTournament = onValueUpdated("/tournaments/{tournID}", (event) => {
    let data = event.data.val();
    let tournamentID = event.params.tournID;
    let members = Object.values(data.members);

    let actions = event.data.ref.parent.parent.child("users").child(members[0]).child("tournaments").child(tournamentID).set(data);
    for(let i = 1; i < members.length; i++) {
        actions = actions.then(() => {
            return event.data.ref.parent.parent.child("users").child(members[i]).child("tournaments").child(tournamentID).set(data);
        });
    }
});

// exports.loseRound = onValueCreated("/lose/{tournID}/{roundNum}", (event) => {
//     let userID = event.data.val();
//     let tournamentID = event.params.tournID;
//     let roundNum = event.params.roundNum;

    
// });