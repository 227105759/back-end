const admin = require("firebase-admin");

const serviceAccount = require("./auth-development-50511-firebase-adminsdk-fc7o8-b2017454da.json");



if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket:"auth-development-50511.appspot.com",
  });
}

const db = admin.firestore();
//const auth = admin.auth();
const firebaseStorage = admin.storage();

module.exports = {db, firebaseStorage};