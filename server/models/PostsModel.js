const admin = require('firebase-admin');
const db = admin.database();
const postsRef = db.ref('posts');

// Get all posts
const getPosts = async () => {
    try {
        const snapshot = await postsRef.once('value');
        const posts = snapshot.val();
        return posts ? Object.entries(posts).map(([id, post]) => ({ id, ...post })) : [];
    } catch (error) {
        throw new Error('Error fetching posts: ' + error.message);
    }
};

// Add a new post
const addPost = async (newPost) => {
    try {
        const postId = postsRef.push().key;
        await postsRef.child(postId).set(newPost);
    } catch (error) {
        throw new Error('Error adding post: ' + error.message);
    }
};

// Update a post
const updatePost = async (postId, updatedPost) => {
    try {
        await postsRef.child(postId).update(updatedPost);
    } catch (error) {
        throw new Error('Error updating post: ' + error.message);
    }
};

// Delete a post
const deletePost = async (postId) => {
    try {
        await postsRef.child(postId).remove();
    } catch (error) {
        throw new Error('Error deleting post: ' + error.message);
    }
};

module.exports = {
    getPosts,
    addPost,
    updatePost,
    deletePost
};
