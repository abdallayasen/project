const express = require('express');
const router = express.Router();
const { getPosts, addPost, updatePost, deletePost } = require('../models/PostsModel');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await getPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new post
router.post('/', async (req, res) => {
    try {
        const newPost = req.body;
        await addPost(newPost);
        res.status(201).json({ message: 'Post added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a post
router.put('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const updatedPost = req.body;
        await updatePost(postId, updatedPost);
        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        await deletePost(postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
