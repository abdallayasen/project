import React, { useState } from 'react';
import { Box, Button, TextField, Typography, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function PostForm() {
  const [post, setPost] = useState("");
  const [image, setImage] = useState(null);

  const handlePostChange = (event) => {
    setPost(event.target.value);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = () => {
    // Handle the post submission logic
    console.log("Post:", post);
    if (image) {
      console.log("Image:", image.name);
    }
  };

  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > :not(style)': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h5" component="div">
        Create a Post
      </Typography>
      <TextField
        id="outlined-multiline-static"
        label="What's on your mind?"
        multiline
        rows={4}
        variant="outlined"
        value={post}
        onChange={handlePostChange}
      />
      <Button
        variant="contained"
        component="label"
      >
        Upload Image
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleImageChange}
        />
      </Button>
      <Box>
        {image && (
          <Typography variant="body2" color="textSecondary">
            {image.name}
          </Typography>
        )}
      </Box>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Share
      </Button>
    </Box>
  );
}

export default PostForm;
