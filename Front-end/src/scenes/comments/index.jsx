// src/scenes/comments/index.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Box, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, Avatar, Typography, TextField, Button, IconButton } from '@mui/material';
import { red } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import { ref, onValue, push } from 'firebase/database';
import { db } from '../../firebase';
import { UserContext } from '../../context/UserContext'; // Import UserContext

const ExpandMore = ({ expand, ...other }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return <IconButton {...other} sx={{
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }} />;
};

const Comments = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [expanded, setExpanded] = useState(null);
  const [orders, setOrders] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const { user } = useContext(UserContext); // Get the logged-in user

  useEffect(() => {
    const fetchData = () => {
      const ordersRef = ref(db, 'orders/');
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        const ordersList = data ? Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        })) : [];
        // Filter orders based on createdBy field
        const userOrders = ordersList.filter(order => order.createdBy === user.uid);
        setOrders(userOrders);
      });
    };

    fetchData();
  }, [user.uid]);

  const handleExpandClick = (postId) => {
    setExpanded(expanded === postId ? null : postId);
  };

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleAddComment = (orderId, postId) => {
    if (newComment.trim() !== "") {
      const commentsRef = ref(db, `orders/${orderId}/posts/${postId}/comments`);
      push(commentsRef, {
        text: newComment,
        user: { name: "User Name", avatar: "/path/to/avatar.png" }
      }).then(() => {
        setNewComment("");
      });
    }
  };

  const handlePostChange = (event) => {
    setNewPostContent(event.target.value);
  };

  const handleAddPost = (orderId) => {
    if (newPostContent.trim() !== "") {
      const postsRef = ref(db, `orders/${orderId}/posts`);
      push(postsRef, {
        content: newPostContent,
        user: { name: "User Name", avatar: "/path/to/avatar.png" },
        comments: []
      }).then(() => {
        setNewPostContent("");
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" spacing={2}>
      {orders.map((order) => (
        <Box key={order.id} sx={{ width: '100%', maxWidth: 800, mb: 4 }}>
          <Typography variant="h4" gutterBottom>{order.orderType} (Order ID: {order.id})</Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a new post..."
            value={newPostContent}
            onChange={handlePostChange}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="success" onClick={() => handleAddPost(order.id)}>
            Add Post
          </Button>
          {order.posts && Object.keys(order.posts).map(postId => {
            const post = order.posts[postId];
            return (
              <Card key={postId} sx={{ maxWidth: 800, width: '100%', boxShadow: 5, padding: 2, mb: 2 }}>
                <CardHeader
                  avatar={<Avatar src={post.user?.avatar} sx={{ bgcolor: red[500] }}>{post.user?.name?.[0] || 'U'}</Avatar>}
                  action={<IconButton aria-label="settings"><MoreVertIcon /></IconButton>}
                  title={post.user?.name || "Unknown User"}
                  subheader={new Date(postId).toLocaleDateString()}
                />
                <CardContent>
                  <Typography variant="body1" color={colors.grey[100]}>
                    {post.content}
                  </Typography>
                </CardContent>
                <CardActions disableSpacing>
                  <IconButton aria-label="like" onClick={() => alert("Liked!")}>
                    <ThumbUpIcon />
                  </IconButton>
                  <ExpandMore
                    expand={expanded === postId}
                    onClick={() => handleExpandClick(postId)}
                    aria-expanded={expanded === postId}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </CardActions>
                <Collapse in={expanded === postId} timeout="auto" unmountOnExit>
                  <CardContent>
                    <Typography variant="h5" sx={{ mb: 2 }}>Comments:</Typography>
                    {post.comments && Object.keys(post.comments).map(commentId => {
                      const comment = post.comments[commentId];
                      return (
                        <Box key={commentId} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Avatar src={comment.user?.avatar} sx={{ width: 20, height: 20, mr: 1 }} />
                          <Typography variant="body2" color={colors.grey[100]}>
                            <strong>{comment.user?.name || "Anonymous"}</strong>: {comment.text}
                          </Typography>
                        </Box>
                      );
                    })}
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
                      onClick={() => handleAddComment(order.id, postId)}
                      sx={{ mt: 2 }}>
                      Post Comment
                    </Button>
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default Comments;
