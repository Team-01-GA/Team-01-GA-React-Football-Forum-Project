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
    try {
        const usersRef = ref(db, 'users');
        const userQuery = query(usersRef, orderByChild('email'), equalTo(email));
        return get(userQuery);
    } catch (error) {
        console.error('Error in getUserByEmail:', error);
        throw error;
    }
};

export const getUserByHandle = async (handle) => {
    try {
        return get(ref(db, `users/${handle}`));
    } catch (error) {
        console.error('Error in getUserByHandle:', error);
        throw error;
    }

};

export const createUserObject = async (
    firstName,
    lastName,
    handle,
    uid,
    email
) => {
    try {
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
    } catch (error) {
        console.error('Error in createUserObject:', error);
        throw error;
    }
};

export const updateUserEmail = async (handle, newEmail) => {
    try {
        const user = auth.currentUser;

        if (!user) {
            return Promise.reject(new Error('No authenticated user.'));
        }

        return updateEmail(user, newEmail).then(() => {
            return update(ref(db, `users/${handle}`), {
                email: newEmail,
            });
        });
    } catch (error) {
        console.error('Error in updateUserEmail:', error);
        throw error;
    }
};

export const updateUserNamePref = async (handle, boolean) => {
    try {
        await update(ref(db, `users/${handle}`), { prefersFullName: boolean });
    } catch (error) {
        console.error('Error in updateUserNamePref:', error);
        throw error;
    }
};

export const getUserData = async (uid) => {
    try {
        return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
    } catch (error) {
        console.error('Error in getUserData:', error);
        throw error;
    }
};

export const toggleUserBlock = async (handle, boolean) => {
    try {
        await update(ref(db, `users/${handle}`), { isBlocked: boolean });
    }
    catch (error) {
        console.error('Error in toggleUserBlock', error);
        throw error;
    }
};

export const uploadProfileImage = async (handle, file) => {
    try {
        const imgLocRef = storageRef(storage, `users/${handle}/profile.jpg`);
        await uploadBytes(imgLocRef, file);

        const url = await getDownloadURL(imgLocRef);

        await set(ref(db, `users/${handle}/profileImg`), url);

        return url;
    } catch (error) {
        console.error('Error in uploadProfileImage:', error);
        throw error;
    }
};

export const getProfileImageUrl = async (handle) => {
    try {
        const snapshot = await get(ref(db, `users/${handle}/profileImg`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error in getProfileImageUrl:', error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const snapshot = await get(ref(db, 'users'));

        if (snapshot.exists()) {
            return Object.entries(snapshot.val());
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        throw error;
    }
};