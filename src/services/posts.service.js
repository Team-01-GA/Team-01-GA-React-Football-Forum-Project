import { ref, push, get, set, update, query, equalTo, orderByChild, orderByKey } from 'firebase/database';
import { db } from '../config/firebase-config.js';


export const getAllPosts = async (search = '') => {
    const snapshot = await get(ref(db, 'posts'));

    if (!snapshot.exists()) {
        return [];
    }

    // const posts = Object.values(snapshot.val());

    // Normalize to array
    const posts = Object.entries(snapshot.val()).map(([id, data]) => ({
        ...data,
        id,
        likedBy: Object.keys(data.likedBy || {}),
    }));

    if (search) {
        return posts.filter(post => post.title.toLowerCase().includes(search.toLowerCase()));
    }

    return posts;
}

export const addPost = async (author, title, content, category, tags) => {

    const post = { author, title, content, category, tags, createdOn: new Date().toString(), likes: 0, comments: {} };

    const result = await push(ref(db, 'posts'), post)
    const id = result.key

    // await update(ref(db, `posts/${id}`), { id })
    await update(ref(db), {
        [`posts/${id}/id`]: id,
        [`users/${author}/posts/${id}`]: true,
    });
}

export const likePost = async (handle, postId) => {
    try {
        const postSnapshot = await get(ref(db, `posts/${postId}`));
        const currentLikes = postSnapshot.val().likes || 0;

        const updatedPost = {
            [`posts/${postId}/likedBy/${handle}`]: true,
            [`users/${handle}/likedPosts/${postId}`]: true,
            [`posts/${postId}/likes`]: currentLikes + 1,
        }

        await update(ref(db), updatedPost);
    } catch (error) {
        console.error('Failed to like post:', error);
        throw error;
    }
}

export const unlikePost = async (handle, postId) => {
    try {
        const postSnapshot = await get(ref(db, `posts/${postId}`));
        const currentLikes = postSnapshot.val().likes || 1;
        const safeLikes = Math.max(currentLikes - 1, 0);

        const updatedPost = {
            [`posts/${postId}/likedBy/${handle}`]: null,
            [`users/${handle}/likedPosts/${postId}`]: null,
            [`posts/${postId}/likes`]: safeLikes,
        }

        return update(ref(db), updatedPost);
    } catch (error) {
        console.error('Failed to unlike post:', error);
        throw error;
    }
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

        const postSnapshot = await get(ref(db, `posts/${postId}`));
        const currentCount = postSnapshot.val().commentCount || 0;

        const commentRef = await push(ref(db, `posts/${postId}/comments`), comment);
        const commentId = commentRef.key;

        await update(ref(db), {
            [`users/${author}/comments/${commentId}`]: true,
            [`posts/${postId}/commentCount`]: currentCount + 1,
        });
    } catch (error) {
        console.error('Failed to add comment: ', error);
        throw error;
    }
};

export const deleteComment = async (postId, author, commentId) => {
    try {
        const postSnapshot = await get(ref(db, `posts/${postId}`));
        const currentCount = postSnapshot.val().commentCount || 1;

        const safeCommentCount = Math.max(currentCount - 1, 0);

        await update(ref(db), {
            [`posts/${postId}/comments/${commentId}`]: null,
            [`users/${author}/comments/${commentId}`]: null,
            [`posts/${postId}/commentCount`]: safeCommentCount,
        });
    } catch (error) {
        console.log('Failed to delete comment:', error);
        throw error;
    }
}


export const deletePost = async (postId, author) => {
    try {
        const postSnapshot = await get(ref(db, `posts/${postId}`));
        if (!postSnapshot.exists()) {
            throw new Error('Post not found');
        }

        const post = postSnapshot.val();
        const updates = {};

        updates[`posts/${postId}`] = null;

        updates[`users/${author}/posts/${postId}`] = null;

        const comments = post.comments || {};
        for (const [commentId, comment] of Object.entries(comments)) {
            updates[`users/${comment.author}/comments/${commentId}`] = null;
        }

        const likedBy = post.likedBy || {};
        for (const handle of Object.keys(likedBy)) {
            updates[`users/${handle}/likedPosts/${postId}`] = null;
        }

        await update(ref(db), updates);
    } catch (error) {
        console.error('Failed to delete post:', error);
        throw error;
    }
};

export const editPost = async (postId, newTitle, newContent, newTags, editor, isAdmin) => {
    try {
        const updates = {
            [`posts/${postId}/title`]: newTitle,
            [`posts/${postId}/content`]: newContent,
            [`posts/${postId}/tags`]: newTags,
            [`posts/${postId}/editedBy`]: {
                handle: editor,
                isAdmin: isAdmin,
            },
        };

        await update(ref(db), updates);
    } catch (error) {
        console.error('Failed to edit post:', error);
        throw error;
    }
};

export const editComment = async (postId, commentId, newContent, editor, isAdmin) => {
    const updates = {
        [`posts/${postId}/comments/${commentId}/content`]: newContent,
        [`posts/${postId}/comments/${commentId}/editedBy`]: {
            handle: editor,
            isAdmin: isAdmin,
        },
    };

    return update(ref(db), updates);
};