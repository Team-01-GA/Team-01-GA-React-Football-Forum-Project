import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from "firebase/storage";

const API_KEY = import.meta.env.VITE_API_KEY;

const firebaseConfig = {
    apiKey: API_KEY,

    authDomain: 'react-football-forum-app.firebaseapp.com',

    projectId: 'react-football-forum-app',

    storageBucket: 'react-football-forum-app.firebasestorage.app',

    messagingSenderId: '405239229349',

    appId: '1:405239229349:web:4cbcd6a35473d19271d64c',

    databaseURL:
        'https://react-football-forum-app-default-rtdb.europe-west1.firebasedatabase.app/',
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getDatabase(app);

export const storage = getStorage(app);
