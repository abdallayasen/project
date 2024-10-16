import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';
import PostAddIcon from '@mui/icons-material/PostAdd';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const ExpandMore = styled((props) => {
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
  const [expanded, setExpanded] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const [newComment, setNewComment] = React.useState("");

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleReplyClick = () => {
    console.log('Reply button clicked');
    // Implement further actions like opening a reply form here
  };

  const handleCreatePostClick = () => {
    console.log('Create Post button clicked');
    // Implement further actions like opening a post creation form here
  };

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      const comment = {
        id: Date.now(),
        text: newComment,
        user: { name: "User Name" } // Replace with actual user info
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  return (
    <Card sx={{ maxWidth: 345, mt: 4 }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: red[500] }}>R</Avatar>}
        action={<IconButton aria-label="settings"><MoreVertIcon /></IconButton>}
        title="Shrimp and Chorizo Paella"
        subheader="September 14, 2016"
      />
      <CardMedia
        component="img"
        height="194"
        image="../../assets/erd.jpg"
        alt="Paella dish"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          This impressive paella is a perfect party dish and a fun meal to cook
          together with your guests. Add 1 cup of frozen peas along with the mussels,
          if you like.
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites"><FavoriteIcon /></IconButton>
        <IconButton aria-label="share"><ShareIcon /></IconButton>
        <IconButton aria-label="reply" onClick={handleReplyClick}><ReplyIcon /></IconButton>
        <IconButton aria-label="create post" onClick={handleCreatePostClick}><PostAddIcon /></IconButton>
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
          <Typography paragraph>Method:</Typography>
          <Typography paragraph>
            Heat 1/2 cup of the broth in a pot until simmering, add saffron and set
            aside for 10 minutes.
          </Typography>
          <Typography paragraph>
            Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over
            medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring
            occasionally until lightly browned, 6 to 8 minutes. Transfer shrimp to a
            large plate and set aside, leaving chicken and chorizo in the pan. Add
            pimentón, bay leaves, garlic, tomatoes, onion, salt and pepper, and cook,
            stirring often until thickened and fragrant, about 10 minutes. Add
            saffron broth and remaining 4 1/2 cups chicken broth; bring to a boil.
          </Typography>
          <Typography paragraph>
            Add rice and stir very gently to distribute. Top with artichokes and
            peppers, and cook without stirring, until most of the liquid is absorbed,
            15 to 18 minutes. Reduce heat to medium-low, add reserved shrimp and
            mussels, tucking them down into the rice, and cook again without
            stirring, until mussels have opened and rice is just tender, 5 to 7
            minutes more. (Discard any mussels that don&apos;t open.)
          </Typography>
          <Typography>
            Set aside off of the heat to let rest for 10 minutes, and then serve.
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Comments:</Typography>
          {comments.map((comment) => (
            <Box key={comment.id} sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{comment.user.name}</strong>: {comment.text}
              </Typography>
            </Box>
          ))}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment..."
            value={newComment}
            onChange={handleCommentChange}
            sx={{ mt: 1 }}
          />
          <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ mt: 1 }}>
            Post Comment
          </Button>
        </CardContent>
      </Collapse>
    </Card>
  );
}
 ////////////////this has post comment work 