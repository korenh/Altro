import config from '../../config.json'
import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";
import "firebase/messaging";

const firebaseConfig = config.FIREBASE_SCHEME

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export { storage, firebase as default };
