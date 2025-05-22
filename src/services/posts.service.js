import {
    ref,
    push,
    get,
    set,
    update,
    query,
    equalTo,
    orderByChild,
    orderByKey,
} from 'firebase/database';
import { db, storage } from '../config/firebase-config.js';
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';

export const getAllPosts = async (search = '') => {
    try {
        const snapshot = await get(ref(db, 'posts'));

        if (!snapshot.exists()) {
            return [];
        }

        // Normalize to array
        const posts = Object.entries(snapshot.val()).map(([id, data]) => ({
            ...data,
            id,
            likedBy: Object.keys(data.likedBy || {}),
        }));

        if (search) {
            return posts.filter((post) =>
                post.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        return posts;
    } catch (error) {
        console.error('Error in getAllPosts:', error);
        throw error;
    }

};

export const addPost = async (author, title, content, category, tags) => {
    try {
        const post = {
            author,
            title,
            content,
            category,
            tags,
            createdOn: new Date().toString(),
            likes: 0,
            comments: {},
        };

        const result = await push(ref(db, 'posts'), post);
        const id = result.key;

        await update(ref(db), {
            [`posts/${id}/id`]: id,
            [`users/${author}/posts/${id}`]: true,
        });

        return id;
    } catch (error) {
        console.error('Error in addPost:', error);
        throw error;
    }

};

export const likePost = async (handle, postId) => {
    try {
        const postSnapshot = await get(ref(db, `posts/${postId}`));
        const currentLikes = postSnapshot.val().likes || 0;

        const updatedPost = {
            [`posts/${postId}/likedBy/${handle}`]: true,
            [`users/${handle}/likedPosts/${postId}`]: true,
            [`posts/${postId}/likes`]: currentLikes + 1,
        };

        await update(ref(db), updatedPost);
    } catch (error) {
        console.error('Failed to like post:', error);
        throw error;
    }
};

export const unlikePost = async (handle, postId) => {
    try {
        const postSnapshot = await get(ref(db, `posts/${postId}`));
        const currentLikes = postSnapshot.val().likes || 1;
        const safeLikes = Math.max(currentLikes - 1, 0);

        const updatedPost = {
            [`posts/${postId}/likedBy/${handle}`]: null,
            [`users/${handle}/likedPosts/${postId}`]: null,
            [`posts/${postId}/likes`]: safeLikes,
        };

        return update(ref(db), updatedPost);
    } catch (error) {
        console.error('Failed to unlike post:', error);
        throw error;
    }
};

export const getPostById = async (id) => {
    try {
        const snapshot = await get(ref(db, `posts/${id}`));

        if (!snapshot.exists()) {
            throw new Error('Post not found');
        }

        return {
            ...snapshot.val(),
            likedBy: Object.keys(snapshot.val().likedBy || {}),
        };
    } catch (error) {
        console.error('Error in getPostById:', error);
        throw error;
    }

};

export const addComment = async (postId, author, content) => {
    try {
        const comment = {
            author,
            content,
            createdOn: new Date().toString(),
        };

        const postSnapshot = await get(ref(db, `posts/${postId}`));
        const currentCount = postSnapshot.val().commentCount || 0;

        const commentRef = await push(
            ref(db, `posts/${postId}/comments`),
            comment
        );
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
};

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

export const editPost = async (
    postId,
    newTitle,
    newContent,
    hasImg,
    newTags,
    editor,
    isAdmin
) => {
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

        if (!hasImg) {
            updates[`posts/${postId}/postImg`] = null
        }

        await update(ref(db), updates);
    } catch (error) {
        console.error('Failed to edit post:', error);
        throw error;
    }
};

export const editComment = async (
    postId,
    commentId,
    newContent,
    editor,
    isAdmin
) => {
    try {
        const updates = {
            [`posts/${postId}/comments/${commentId}/content`]: newContent,
            [`posts/${postId}/comments/${commentId}/editedBy`]: {
                handle: editor,
                isAdmin: isAdmin,
            },
        };

        return update(ref(db), updates);
    } catch (error) {
        console.error('Error in editComment:', error);
        throw error;
    }
};

export const getAllComments = async (handle = null) => {
    try {
        const result = await getAllPosts();

        const comments = result.flatMap((post) => {
            if (!post.comments) return [];

            return Object.entries(post.comments)
                .filter(([commentId, comment]) =>
                    handle ? comment.author === handle : true
                )
                .map(([commentId, comment]) => ({
                    ...comment,
                    commentId,
                    postId: post.id,
                    postTitle: post.title,
                }));
        });

        return comments.length ? comments : [];
    } catch (error) {
        console.error('Error in getAllComments:', error);
        throw error;
    }
}

export const likeComment = async (postId, commentId, handle) => {
    try {
        const commentRef = ref(db, `posts/${postId}/comments/${commentId}`);
        const snapshot = await get(commentRef);
        const currentLikes = snapshot.val().likes || 0;

        await update(ref(db), {
            [`posts/${postId}/comments/${commentId}/likes`]: currentLikes + 1,
            [`posts/${postId}/comments/${commentId}/likedBy/${handle}`]: true,
        });
    } catch (error) {
        console.error('Error in likeComment:', error);
        throw error;
    }
};

export const unlikeComment = async (postId, commentId, handle) => {
    try {
        const commentRef = ref(db, `posts/${postId}/comments/${commentId}`);
        const snapshot = await get(commentRef);
        const currentLikes = snapshot.val().likes || 1;
        const safeLikes = Math.max(currentLikes - 1, 0);

        await update(ref(db), {
            [`posts/${postId}/comments/${commentId}/likes`]: safeLikes,
            [`posts/${postId}/comments/${commentId}/likedBy/${handle}`]: null,
        });
    } catch (error) {
        console.error('Error in unlikeComment:', error);
        throw error;
    }
};

export const uploadPostImage = async (postId, file) => {
    try {
        const imgLocRef = storageRef(storage, `posts/${postId}/post.jpg`);
        await uploadBytes(imgLocRef, file);

        const url = await getDownloadURL(imgLocRef);

        await set(ref(db, `posts/${postId}/postImg`), url);

        return url;
    } catch (error) {
        console.error('Error in uploadPostImage:', error);
        throw error;
    }
};

export const getPostImageUrl = async (postId) => {
    try {
        const snapshot = await get(ref(db, `posts/${postId}/postImg`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error in getPostImageUrl:', error);
        throw error;
    }
};
