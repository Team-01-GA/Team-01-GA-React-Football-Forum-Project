import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: 'AIzaSyA-RRsqP8VEPvYbmyHkH46e1p7gmca01EM',

    authDomain: 'react-football-forum-app.firebaseapp.com',

    projectId: 'react-football-forum-app',

    storageBucket: 'react-football-forum-app.firebasestorage.app',

    messagingSenderId: '405239229349',

    appId: '1:405239229349:web:4cbcd6a35473d19271d64c',
};

export const app = initializeApp(firebaseConfig);
