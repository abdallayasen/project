import React, { useState, useContext } from "react";
import { Avatar, Box, Fab, Modal, Stack, Tooltip, Typography, styled, TextField, Button, ButtonGroup } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { ref, set } from 'firebase/database';
import { db } from '../firebase'; // Adjust the path to your firebase.js
import { UserContext } from '../context/UserContext'; // Import UserContext

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

const AddPost = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [open, setOpen] = useState(false);
    const [postContent, setPostContent] = useState("");
    const { user } = useContext(UserContext); // Get user from context

    const handlePostClick = () => {
        if (postContent.trim() !== "" && user) {
            const newPost = {
                id: Date.now(),
                content: postContent,
                username: user.name, // Use user name instead of ID
                date: new Date().toISOString(), // Add the current date
            };

            const postsRef = ref(db, 'posts/' + newPost.id);
            set(postsRef, newPost)
                .then(() => {
                    setPostContent("");
                    setOpen(false);
                })
                .catch((error) => {
                    console.error("Error adding post: ", error);
                });
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
                <Box width={400} height={280} bgcolor="white" p={3} borderRadius={5}>
                    <Typography variant="h6" color="gray" textAlign="center" fontWeight="bold">Create Post</Typography>
                    <UserBox>
                        <Avatar src="/assets/user.png" sx={{ width: 30, height: 30 }} />
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
                        placeholder="Type Your Notes here"
                        variant="standard"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                    />

                    <Stack direction="row" gap={1} mt={2} mb={3}>
                        {/* Add icons or functionality for images/videos here if needed */}
                    </Stack>
                    <ButtonGroup variant="contained" aria-label="Basic button group" fullWidth>
                        <Button color="info" onClick={handlePostClick}>Post</Button>
                        <Button sx={{ width: "100px" }} color="error" onClick={() => setOpen(false)}>Cancel</Button>
                    </ButtonGroup>
                </Box>
            </StyledModal>
        </>
    );
};

export default AddPost;
