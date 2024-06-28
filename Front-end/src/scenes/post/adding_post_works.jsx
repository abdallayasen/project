import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Box, IconButton, Card, CardHeader, CardContent, CardActions, Collapse, Avatar, Typography, TextField, Button } from '@mui/material';
import { red } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { tokens } from '../../theme';
import { useTheme } from '@mui/material';
import AddPost from '../../components/AddPost';

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
    const colors = tokens(theme.palette.mode);
    const [expanded, setExpanded] = React.useState(false);
    const [posts, setPosts] = React.useState([]);
    const [newComment, setNewComment] = React.useState("");

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleReplyClick = () => {
        console.log('Reply button clicked');
    };

    const handleCreatePostClick = () => {
        console.log('Create Post button clicked');
    };

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleAddComment = (postId) => {
        if (newComment.trim() !== "") {
            const updatedPosts = posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: [
                            ...post.comments,
                            { id: Date.now(), text: newComment, user: { name: "User Name" } }
                        ]
                    };
                }
                return post;
            });
            setPosts(updatedPosts);
            setNewComment("");
        }
    };

    const addNewPost = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" spacing={2}>
            <Box mb={2}>
                <AddPost addPost={addNewPost} />
            </Box>
            {posts.map((post) => (
                <Card key={post.id} sx={{ maxWidth: 800, width: '100%', boxShadow: 5, padding: 2, mb: 2 }}>
                    <CardHeader
                        avatar={<Avatar sx={{ bgcolor: red[500] }}>{post.user?.name?.[0] || 'U'}</Avatar>}
                        action={<IconButton aria-label="settings"><MoreVertIcon /></IconButton>}
                        title={post.user?.name || "Unknown User"}
                        subheader={new Date(post.id).toLocaleDateString()}
                    />
                    <CardContent>
                        <Typography variant="body1" color={colors.grey[100]}>
                            {post.content}
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                        <IconButton aria-label="reply" onClick={handleReplyClick}><ThumbUpIcon /></IconButton>
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
                            <Typography variant="h5" sx={{ mt: 2 }}>Comments:</Typography>
                            {post.comments.map((comment) => (
                                <Box key={comment.id} sx={{ mb: 1 }}>
                                    <Typography variant="body2" color={colors.grey[100]}>
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
        </Box>
    );
}
