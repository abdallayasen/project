import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Card, CardHeader, CardMedia, CardContent, CardActions,
  Collapse, Avatar, Typography, TextField, Button, IconButton, Dialog,
  DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { styled } from '@mui/material/styles';
import { useTheme } from "@mui/material";
import AddPost from '../../components/AddPost';
import { db } from '../../firebase';
import { ref, set, remove, onValue } from 'firebase/database';
import { tokens } from "../../theme";
import { UserContext } from '../../context/UserContext'; // Ensure UserContext is correctly imported

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

export default function RecipeReviewCard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode) || {};
  const { user } = useContext(UserContext); // Get user data from context
  const [expanded, setExpanded] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.entries(data).map(([id, post]) => ({
          id,
          ...post,
          user: post.user || { name: "Unknown User", avatar: "/path/to/default/avatar.png" } // Use provided user data or default
        }));
        setPosts(postsList);
      }
    });
  }, []);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleAddComment = async (postId) => {
    if (newComment.trim() !== "") {
      const postRef = ref(db, `posts/${postId}`);
      const postSnapshot = await onValue(postRef);
      const post = postSnapshot.val();

      const updatedPost = {
        ...post,
        comments: [
          ...(post.comments || []),
          { id: Date.now(), text: newComment, user: { name: user.name, avatar: user.avatar } }
        ]
      };

      await set(postRef, updatedPost);
      setNewComment("");
    }
  };

  const handleAddPost = async (newPost) => {
    if (!user) {
      alert("User data is missing. Please ensure you are logged in.");
      return;
    }
    const newPostRef = ref(db, 'posts').push();
    const postWithUserData = {
      ...newPost,
      user: {
        name: user.name, // Use the user's name from the sidebar context
        avatar: user.avatar || "/path/to/default/avatar.png",
      },
      date: new Date().toISOString(),
    };

    await set(newPostRef, postWithUserData);
    setPosts([{ id: newPostRef.key, ...postWithUserData }, ...posts]);
  };

  const handleDeletePost = async () => {
    if (postToDelete) {
      const postRef = ref(db, `posts/${postToDelete.id}`);
      await remove(postRef);
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      setOpenConfirm(false);
    }
  };

  const handleEditPost = async () => {
    if (postToEdit) {
      const postRef = ref(db, `posts/${postToEdit.id}`);
      await set(postRef, postToEdit);
      setPosts(posts.map(post => (post.id === postToEdit.id ? postToEdit : post)));
      setOpenEdit(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" spacing={2}>
      <Box mb={2}>
        <AddPost addPost={handleAddPost} />
      </Box>
      {posts.map((post) => (
        <Card key={post.id} sx={{ maxWidth: 800, width: '100%', boxShadow: 5, padding: 2, mb: 2 }}>
          <CardHeader
            avatar={<Avatar src={post.user?.avatar || "/path/to/default/avatar.png"} sx={{ bgcolor: colors.red?.[500] }}>{post.user?.name?.[0] || 'U'}</Avatar>}
            action={
              <IconButton
                aria-label="settings"
                onClick={(e) => {
                  e.stopPropagation();
                  setPostToDelete(post);
                  setPostToEdit(post);
                  setOpenConfirm(true);
                }}
              >
                <MoreVertIcon />
              </IconButton>
            }
            title={post.user?.name || "Unknown User"}
            subheader={new Date(post.date).toLocaleDateString()}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: 2 }}>
            {post.images?.map((image, index) => (
              <a key={index} href={image} target="_blank" rel="noopener noreferrer">
                <CardMedia
                  component="img"
                  image={image}
                  alt={`Image ${index + 1}`}
                  sx={{ cursor: 'pointer', width: '100%', height: 250, objectFit: 'cover', margin: '10px 0' }}
                />
              </a>
            ))}
          </Box>
          <CardContent>
            <Typography variant="body1" color={colors.grey?.[100]}>
              {post.content}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <IconButton aria-label="reply" onClick={() => handleAddComment(post.id)}><ThumbUpIcon /></IconButton>
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
                sx={{ mt: 2 }}>
                Post Comment
              </Button>
            </CardContent>
          </Collapse>
        </Card>
      ))}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete Post"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeletePost} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="content"
            label="Edit Content"
            type="text"
            fullWidth
            value={postToEdit?.content || ''}
            onChange={(e) => setPostToEdit({ ...postToEdit, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditPost} color="secondary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
