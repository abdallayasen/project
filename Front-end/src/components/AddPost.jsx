import React, { useState, useContext } from "react";
import { Avatar, Box, Fab, Modal, Stack, Tooltip, Typography, styled, TextField, Button, ButtonGroup, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { ref, set, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { UserContext } from '../context/UserContext';
import { v4 as uuidv4 } from 'uuid';  // Add UUID for unique filenames

const StyledModal = styled(Modal)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

const UserBox = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: "10px",
});

const AddPost = ({ orderPrivateNumber }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [open, setOpen] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [fileData, setFileData] = useState({ image: null, video: null });
    const { user } = useContext(UserContext);

    // Handle uploading image with a unique filename
    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const uniqueName = `${uuidv4()}_${file.name}`; // Create unique filename
            const storagePath = `posts/images/${uniqueName}`;
            const imageRef = storageRef(storage, storagePath);
            await uploadBytes(imageRef, file);
            const imageUrl = await getDownloadURL(imageRef);

            setImagePreview(imageUrl);
            setFileData({ ...fileData, image: imageUrl });
        }
    };

    // Handle uploading video with a unique filename
    const handleVideoChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const uniqueName = `${uuidv4()}_${file.name}`; // Create unique filename
            const storagePath = `posts/videos/${uniqueName}`;
            const videoRef = storageRef(storage, storagePath);
            await uploadBytes(videoRef, file);
            const videoUrl = await getDownloadURL(videoRef);

            setVideoPreview(videoUrl);
            setFileData({ ...fileData, video: videoUrl });
        }
    };

    const handlePostClick = async () => {
        if (!postContent.trim() && !fileData.image && !fileData.video) {
            console.error("Post content is empty");
            return;
        }

        if (!user) {
            console.error("User is not defined");
            return;
        }

        if (!orderPrivateNumber) {
            console.error("OrderPrivateNumber is not defined");
            return;
        }

        try {
            const newPost = {
                content: postContent,
                user: {
                    name: user.name,
                    avatar: user.avatar || "https://via.placeholder.com/150",
                },
                date: new Date().toISOString(),
                image: fileData.image || null,
                video: fileData.video || null,
                orderPrivateNumber,
            };

            const postsRef = push(ref(db, 'posts')); // Generate new post ID
            await set(postsRef, newPost);

            setPostContent("");
            setImagePreview(null);
            setVideoPreview(null);
            setFileData({ image: null, video: null });
            setOpen(false);
        } catch (error) {
            console.error("Error adding post: ", error);
        }
    };

    return (
        <>
            <Tooltip title="Add Post" onClick={() => setOpen(true)}
                sx={{
                    position: "center",
                    bottom: 20,
                    left: { xs: "calc(50% - 25px)", md: 30 },
                }}>
                <Fab color="secondary" aria-label="add">
                    <AddIcon />
                </Fab>
            </Tooltip>

            <StyledModal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box 
                    width={400} 
                    height={500} 
                    bgcolor="white" 
                    p={3} 
                    borderRadius={5} 
                    sx={{ overflowY: 'auto' }} // Ensure scrolling if content exceeds height
                >
                    <Typography variant="h6" color="gray" textAlign="center" fontWeight="bold">Create Post</Typography>
                    <UserBox>
                        <Avatar src={user?.avatar || "/assets/user.png"} sx={{ width: 30, height: 30 }} />
                        <Typography fontWeight="bold" variant="body1" color={colors.primary[500]}>
                            {user?.name}
                        </Typography>
                    </UserBox>
                    <TextField
                        sx={{
                            width: '100%',
                            '& .MuiInputBase-root': {
                                color: '#111',
                            },
                        }}
                        id="standard-multiline-static"
                        multiline
                        rows={4}
                        placeholder="Type your post here"
                        variant="standard"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                    />

                    <Stack direction="row" gap={1} mt={2} mb={3}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="icon-button-file"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="icon-button-file">
                            <IconButton color="primary" aria-label="upload picture" component="span">
                                <ImageIcon sx={{ color: 'orange' }} />
                            </IconButton>
                        </label>

                        <input
                            accept="video/*"
                            style={{ display: 'none' }}
                            id="icon-button-video"
                            type="file"
                            onChange={handleVideoChange}
                        />
                        <label htmlFor="icon-button-video">
                            <IconButton color="primary" aria-label="upload video" component="span">
                                <VideoCameraBackIcon sx={{ color: 'green' }} />
                            </IconButton>
                        </label>
                    </Stack>

                    {imagePreview && (
                        <Box mt={2} sx={{ maxHeight: '200px', overflow: 'hidden', borderRadius: '5px' }}>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '200px',
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>
                    )}
                    {videoPreview && (
                        <Box mt={2} sx={{ maxHeight: '200px', overflow: 'hidden', borderRadius: '5px' }}>
                            <video
                                controls
                                src={videoPreview}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '200px',
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>
                    )}

                    <ButtonGroup variant="contained" aria-label="Basic button group" fullWidth sx={{ mt: 3 }}>
                        <Button color="info" onClick={handlePostClick}>Post</Button>
                        <Button sx={{ width: "100px" }} color="error" onClick={() => setOpen(false)}>Cancel</Button>
                    </ButtonGroup>
                </Box>
            </StyledModal>
        </>
    );
};

export default AddPost;
