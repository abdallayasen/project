import React, { useState } from 'react';
import { Paper, Typography, Avatar, IconButton, Box, TextField, Button } from '@mui/material';
import { red } from '@mui/material/colors';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Post = ({ image, text, userName, postDate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { userName: 'Current User', text: newComment }]);
      setNewComment('');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 2, marginBottom: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: red[500] }}>{userName[0]}</Avatar>
          <Box sx={{ marginLeft: 2 }}>
            <Typography variant="h6">{userName}</Typography>
            <Typography variant="body2" color="textSecondary">{postDate}</Typography>
          </Box>
        </Box>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>
      {image && <img src={image} alt="Post content" style={{ width: '100%', borderRadius: 8, marginTop: 10 }} />}
      <Typography variant="body2" sx={{ marginTop: 2 }}>{text}</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <IconButton>
          <ThumbUpIcon />
        </IconButton>
        <IconButton>
          <CommentIcon />
        </IconButton>
        <IconButton>
          <ShareIcon />
        </IconButton>
      </Box>
      <Box sx={{ marginTop: 2 }}>
        {comments.map((comment, index) => (
          <Paper key={index} elevation={1} sx={{ padding: 1, marginBottom: 1, borderRadius: 1 }}>
            <Typography variant="body2"><b>{comment.userName}:</b> {comment.text}</Typography>
          </Paper>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
        <TextField
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          fullWidth
          variant="outlined"
          size="small"
        />
        <Button onClick={handleAddComment} sx={{ marginLeft: 1 }} variant="contained" color="primary">
          Post
        </Button>
      </Box>
    </Paper>
  );
};

export default function PostList() {
  return (
    <Box sx={{ padding: 2 }}>
      <Post
        image="../../assets/user.png"
        text="This is a sample post. It can contain text and images."
        userName="John Doe"
        postDate="June 20, 2024"
      />
      {/* Add more Post components here */}
    </Box>
  );
}
