/*
   Colle ici les valeurs données par Firebase
   (Paramètres du projet → Vos applications → Web).
   Voir FIREBASE_SETUP.md pour le détail des étapes.
*/

const firebaseConfig = {
  apiKey: "AIzaSyCjuyYAO8Yx6t-bgv4UHpmGNRK3U0jwuwQ",
  authDomain: "alizeti-app.firebaseapp.com",
  projectId: "alizeti-app",
  storageBucket: "alizeti-app.firebasestorage.app",
  messagingSenderId: "631070771568",
  appId: "1:631070771568:web:e22c81bcb32e360005a7b5"
};



firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/*
   Domaine interne utilisé pour transformer un nom
   d'utilisateur en e-mail Firebase (invisible pour
   la personne qui utilise l'app — voir FIREBASE_SETUP.md).
*/
const USERNAME_DOMAIN = "@alizeti.local";

function usernameToEmail(username) {

  return (
    username.trim().toLowerCase() +
    USERNAME_DOMAIN
  );

}
