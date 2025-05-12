import { get, set, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { db } from '../config/firebase-config.js';
import { updateEmail } from 'firebase/auth';
import { auth } from '../config/firebase-config.js';

export const getUserByEmail = (email) => {
    const usersRef = ref(db, 'users');

    const userQuery = query(usersRef, orderByChild('email'), equalTo(email));

    return get(userQuery);
};

export const getUserByHandle = (handle) => {
    return get(ref(db, `users/${handle}`));
};

export const createUserObject = (firstName, lastName, handle, uid, email) => {
    return set(ref(db, `users/${handle}`), {
        uid,
        handle,
        firstName,
        lastName,
        email,
        isAdmin: false,
        isBlocked: false,
        createdOn: new Date(),
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
