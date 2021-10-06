import firebase from 'firebase'

const firebaseConfig = {
  apiKey: 'AIzaSyB6HDZ8XRXcGSu_tIHue0_MhIzXCacd7oY',
  authDomain: 'pimex-chat.firebaseapp.com',
  databaseURL: 'https://pimex-chat-default-rtdb.firebaseio.com',
  projectId: 'pimex-chat',
  storageBucket: 'pimex-chat.appspot.com',
  messagingSenderId: '689854161708',
  appId: '1:689854161708:web:670f760db4308dd3b9c289',
  measurementId: 'G-173MTEFTFL'
}

firebase.initializeApp(firebaseConfig)

const firestore = firebase.firestore
const db = firestore()

export default {
  db,
  firestore
}
