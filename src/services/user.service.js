import { get, set, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { db } from '../config/firebase-config.js';
import { updateEmail } from 'firebase/auth';
import { auth } from '../config/firebase-config.js';

export const getUserByHandle = (handle) => {
    return get(ref(db, `users/${handle}`));
};

export const createUserHandle = (handle, uid, email) => {
    return set(ref(db, `users/${handle}`), {
        handle,
        uid,
        email,
        createdOn: new Date(),
        likedTweets: {},
    });
};

export const updateUserEmail = (handle, newEmail) => {
    const user = auth.currentUser;

    if (!user) {
        return Promise.reject(new Error("No authenticated user."));
    }

    return updateEmail(user, newEmail)
        .then(() => {
            return update(ref(db, `users/${handle}`), {
                email: newEmail,
            });
        });
};

export const getUserData = (uid) => {
    return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};
