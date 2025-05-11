import { ref, push, get, set, update, query, equalTo, orderByChild, orderByKey } from 'firebase/database';
import { db } from '../config/firebase-config.js';


export const getAllPosts = async (search = '') => {
    const snapshot = await get(ref(db, 'posts'));

    if (!snapshot.exists()) {
        return [];
    }

    const posts = Object.values(snapshot.val());

    if (search) {
        return posts.filter(post => post.title.toLowerCase().includes(search.toLowerCase()));
    }

    return posts;
}

export const addPost = async (author, title, content, category) => {

    const post = { author, title, content, category, createdOn: new Date().toString(), likes: 0, comments: {} };

    const result = await push(ref(db, 'posts'), post)
    const id = result.key

    // await update(ref(db, `posts/${id}`), { id })
    await update(ref(db), {
        [`posts/${id}/id`]: id,
        [`users/${author}/posts/${id}`]: true,
    });
}

export const likePost = async (handle, postId) => {
    const updatedPost = {
        [`posts/${postId}/likedBy/${handle}`]: true,
        [`users/${handle}/likedPosts/${postId}`]: true,
    }

    return update(ref(db), updatedPost);
}

export const unlikePost = async (handle, postId) => {
    const updatedPost = {
        [`posts/${postId}/likedBy/${handle}`]: null,
        [`users/${handle}/likedPosts/${postId}`]: null,
    }

    return update(ref(db), updatedPost);
}

export const getPostById = async (id) => {
    const snapshot = await get(ref(db, `posts/${id}`));

    if (!snapshot.exists()) {
        throw new Error('Post not found');
    }

    return {
        ...snapshot.val(),
        likedBy: Object.keys(snapshot.val().likedBy || {}),
    }
}

export const addComment = async (postId, author, content) => {
    try {
        const comment = {
            author,
            content,
            createdOn: new Date().toString(),
        };

        const commentRef = await push(ref(db, `posts/${postId}/comments`), comment);
        const commentId = commentRef.key;

        await update(ref(db), {
            [`users/${author}/comments/${commentId}`]: true,
        });
    } catch (error) {
        console.error('Failed to add comment: ', error);
        throw error;
    }
};