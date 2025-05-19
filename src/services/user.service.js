import {
    get,
    set,
    ref,
    query,
    equalTo,
    orderByChild,
    update,
} from 'firebase/database';
import { db, auth, storage } from '../config/firebase-config.js';
import { updateEmail } from 'firebase/auth';
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';

export const getUserByEmail = async (email) => {
    const usersRef = ref(db, 'users');

    const userQuery = query(usersRef, orderByChild('email'), equalTo(email));

    return get(userQuery);
};

export const getUserByHandle = async (handle) => {
    return get(ref(db, `users/${handle}`));
};

export const createUserObject = async (
    firstName,
    lastName,
    handle,
    uid,
    email
) => {
    return set(ref(db, `users/${handle}`), {
        uid,
        handle,
        firstName,
        lastName,
        email,
        isAdmin: false,
        isBlocked: false,
        prefersFullName: false,
        createdOn: Date.now(),
    });
};

export const updateUserEmail = async (handle, newEmail) => {
    const user = auth.currentUser;

    if (!user) {
        return Promise.reject(new Error('No authenticated user.'));
    }

    return updateEmail(user, newEmail).then(() => {
        return update(ref(db, `users/${handle}`), {
            email: newEmail,
        });
    });
};

export const updateUserNamePref = async (handle, boolean) => {
    await update(ref(db, `users/${handle}`), { prefersFullName: boolean });
}

export const getUserData = async (uid) => {
    return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};

export const toggleUserBlock = async (handle, boolean) => {
    await update(ref(db, `users/${handle}`), { isBlocked: boolean });
};

export const uploadProfileImage = async (handle, file) => {

    const imgLocRef = storageRef(storage, `users/${handle}/profile.jpg`);
    await uploadBytes(imgLocRef, file);

    const url = await getDownloadURL(imgLocRef);

    await set(ref(db, `users/${handle}/profileImg`), url);

    return url;
};

export const getProfileImageUrl = async (handle) => {

    const snapshot = await get(ref(db, `users/${handle}/profileImg`));
    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        return null;
    }
};

export const getAllUsers = async () => {

    const snapshot = await get(ref(db, 'users'));

    if (snapshot.exists()) {
        return Object.entries(snapshot.val());
    } else {
        return [];
    }
}