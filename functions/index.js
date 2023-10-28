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

exports.newTournament = onValueCreated("/tournaments/{tournID}", (event) => {
    let data = event.data.val();
    let tournamentID = event.params.tournID;
    let owner = data.owner;

    let bracket = {
        1: {
            1: data.ownerDisplay
        },
        round: 1
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
    let displayName = ("userDisplay" in data) ? data.userDisplay : "null";

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
        if(!Object.values(members).includes(userID) && bracket.round === 1) {
            let memberNum = Object.values(members).length;

            return dbRef.child('brackets').child(tournID).child('1').child(`${ memberNum }`).set(displayName)
                .then(dbRef.child('tournaments').child(tournID).child('members').child(`${ memberNum }`).set(userID));
        } else return dbRef.child('error').set(members);
    });
});

exports.loseRound = onValueCreated("/lose/{actID}", (event) => {
    let data = event.data.val();
    let tournID = ("tournID" in data) ? data.tournID : "null";
    let userID = ("userID" in data) ? data.userID : "null";

    let dbRef = admin.database().ref();

    let tournamentQuery = dbRef.child('tournaments').child(tournID).once('value').then((snapshot) => {
        if(snapshot.exists()) return snapshot.val();
        else return {};
    });
    let bracketQuery = dbRef.child('brackets').child(tournID).once('value').then((snapshot) => {
        if(snapshot.exists()) return snapshot.val();
        else return {};
    });

    return Promise.all([tournamentQuery, bracketQuery]).then((values) => {
        let tournament = values[0];
        let bracket = values[1];

        // determine index of losing user
        let index = Object.values(tournament.members).indexOf(userID) + 1;
        let initialDisplay = bracket['1'][index];
        index = Math.ceil(index / (2 ** bracket.round));

        // verify that we are the user at this index
        let bracketDisplay = bracket[`${bracket.round}`][index];
        if(bracketDisplay === initialDisplay) {
            // this user is probably still in the standing at this round
            // get the index of their opponent
            index = (index % 2 === 0) ? index - 1 : index + 1;

            // translate index to next round index
            let nextIndex = Math.ceil(index / 2);
            return dbRef.child('brackets').child(tournID).child(`${ bracket.round + 1 }`).child(`${ nextIndex }`).set(bracket[`${bracket.round}`][`${index}`]).then(() => {
                let winCount = Object.values(bracket[`${bracket.round}`]).length;
                let winThresh = Math.ceil(Object.values(tournament.members).length / (2 ** bracket.round));

                if(winCount === winThresh) return dbRef.child('brackets').child(tournID).child('round').set(bracket.round + 1);
            });
        } else {
            // probably trying to spoof a loss
            return {};
        }
    })
})