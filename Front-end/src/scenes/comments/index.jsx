import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Card, CardHeader, CardMedia, CardContent, CardActions,
  Collapse, Avatar, Typography, TextField, Button, IconButton, Dialog,
  DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { styled } from '@mui/material/styles';
import { useTheme } from "@mui/material";
import AddPost from '../../components/AddPost';
import { db } from '../../firebase';
import { ref, set, remove, onValue, get } from 'firebase/database';
import { tokens } from "../../theme";
import { UserContext } from '../../context/UserContext';

const ExpandMore = styled((props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function RecipeReviewCard({ orderPrivateNumber }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode) || {};
  const { user } = useContext(UserContext);
  const [expanded, setExpanded] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});

  const randomColor = () => {
    const colors = ['#e57373', '#81c784', '#ffb74d', '#64b5f6', '#ba68c8', '#ffa726'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Fetch posts that match the relevant `orderPrivateNumber`
  useEffect(() => {
    const postsRef = ref(db, 'posts');
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filteredPosts = Object.entries(data)
          .filter(([id, post]) => post.orderPrivateNumber === orderPrivateNumber) // Filter by `orderPrivateNumber`
          .map(([id, post]) => ({
            id,
            ...post,
            user: post.user || { name: "Unknown User" },
            avatarColor: randomColor(),
          }));
        setPosts(filteredPosts);
      }
    });
  }, [orderPrivateNumber]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  // Add a comment to a post
  const handleAddComment = async (postId) => {
    if (newComment.trim() !== "") {
      try {
        const postRef = ref(db, `posts/${postId}`);
        const snapshot = await get(postRef);
        if (!snapshot.exists()) {
          console.error("Post not found");
          return;
        }

        const post = snapshot.val();
        const updatedPost = {
          ...post,
          comments: [
            ...(post.comments || []),
            {
              id: Date.now(),
              text: newComment,
              user: {
                name: user.name,
                avatar: user.avatar || "/path/to/default/avatar.png",
              },
            },
          ],
        };

        await set(postRef, updatedPost);
        setNewComment("");
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    }
  };

  // Add a new post
  const handleAddPost = async (newPost) => {
    if (!user) {
      alert("User data is missing. Please ensure you are logged in.");
      return;
    }
    const newPostRef = ref(db, 'posts').push();
    const postWithUserData = {
      ...newPost,
      user: {
        name: user.name,
      },
      date: new Date().toISOString(),
      orderPrivateNumber, // Include the relevant `orderPrivateNumber`
    };

    await set(newPostRef, postWithUserData);
    setPosts([{ id: newPostRef.key, ...postWithUserData }, ...posts]);
  };

  // Delete a post
  const handleDeletePost = async () => {
    if (postToDelete) {
      const postRef = ref(db, `posts/${postToDelete.id}`);
      await remove(postRef);
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      setOpenConfirm(false);
    }
  };

  // Edit a post
  const handleEditPost = async () => {
    if (postToEdit) {
      const postRef = ref(db, `posts/${postToEdit.id}`);
      await set(postRef, postToEdit);
      setPosts(posts.map(post => (post.id === postToEdit.id ? postToEdit : post)));
      setOpenEdit(false);
    }
  };

  // Toggle like
  const toggleLike = (postId) => {
    setLikedPosts((prevLikedPosts) => {
      const newLikedPosts = { ...prevLikedPosts };
      if (newLikedPosts[postId]) {
        delete newLikedPosts[postId];
      } else {
        newLikedPosts[postId] = true;
      }
      return newLikedPosts;
    });
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" spacing={2}>
      <Box mb={2} mt={3}>
        {/* AddPost component allows users to add posts */}
        <AddPost orderPrivateNumber={orderPrivateNumber} addPost={handleAddPost} />
      </Box>
      {posts.map((post) => (
        <Card key={post.id} sx={{ maxWidth: 800, width: '100%', boxShadow: 5, padding: 2, mb: 2 }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: post.avatarColor }}>{post.user?.name?.[0] || 'U'}</Avatar>}
            action={
              <IconButton
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setPostToDelete(post);
                  setPostToEdit(post);
                  setOpenConfirm(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
            title={post.user?.name || "Unknown User"}
            subheader={new Date(post.date).toLocaleDateString()}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: 2 }}>
            {post.image && (
              <CardMedia
                component="img"
                image={post.image}
                alt="Post Image"
                sx={{ cursor: 'pointer', width: '100%', height: 250, objectFit: 'cover', margin: '10px 0' }}
              />
            )}
            {post.video && (
              <CardMedia
                component="video"
                controls
                src={post.video}
                alt="Post Video"
                sx={{ cursor: 'pointer', width: '100%', height: 250, objectFit: 'cover', margin: '10px 0' }}
              />
            )}
          </Box>
          <CardContent>
            <Typography variant="body1" color={colors.grey?.[100]}>
              {post.content}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <IconButton
              aria-label="like"
              onClick={() => toggleLike(post.id)}
              sx={{ color: likedPosts[post.id] ? 'skyblue' : 'inherit' }}
            >
              <ThumbUpIcon />
            </IconButton>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Comments:</Typography>

              {post.comments?.map((comment) => (
                <Box key={comment.id} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <Avatar src={comment.user?.avatar || "/path/to/default/avatar.png"} sx={{ width: 20, height: 20, mr: 1 }} />
                  <Typography variant="body2" color={colors.grey?.[100]}>
                    <strong>{comment.user?.name || "Anonymous"}</strong>: {comment.text}
                  </Typography>
                </Box>
              ))}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a comment..."
                value={newComment}
                onChange={handleCommentChange}
                sx={{ mt: 2 }}
              />
              <Button variant="contained"
                color="success"
                onClick={() => handleAddComment(post.id)}
                sx={{ mt: 1 }}
              >
                Add Comment
              </Button>
            </CardContent>
          </Collapse>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this post?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeletePost} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            label="Content"
            fullWidth
            variant="outlined"
            value={postToEdit?.content || ""}
            onChange={(e) => setPostToEdit({ ...postToEdit, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditPost} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
