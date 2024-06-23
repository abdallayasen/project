import { Avatar, Box, Fab, Modal, Stack, Tooltip, Typography, styled } from "@mui/material";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import React, { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import TextField from '@mui/material/TextField';
import { EmojiEmotions, PersonAdd } from "@mui/icons-material";
import ImageIcon from '@mui/icons-material/Image';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';

const StyledModal = styled(Modal)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

const UserBox = styled(Box)({ ///////////USER BOX , good practice
    display: "flex",
    alignItems: "center",
    gap: "10px",
});

const AddPost = ({ addPost }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [open, setOpen] = useState(false);
    const [postContent, setPostContent] = useState("");

    const handlePostClick = () => {
        if (postContent.trim() !== "") {
            const newPost = {
                id: Date.now(),
                title: "New Post",
                content: postContent,
                comments: [],
                images: []  // Add any image URLs if needed
            };
            addPost(newPost);
            setPostContent("");
            setOpen(false);
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
                        <Typography fontWeight="bold" variant="body1" color={colors.primary[500]}>Current User</Typography>
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
                        <ImageIcon color="warning" />
                        <VideoCameraBackIcon color="success" />
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
