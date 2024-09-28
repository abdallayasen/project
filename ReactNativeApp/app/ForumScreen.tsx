// ForumScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {getDatabase, ref, push, set, onValue, query, orderByChild, equalTo, remove,update } from 'firebase/database';
import firebaseApp from './firebaseConfig';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';


// Example static user logo
 // @ts-ignore
const UserLogo = ({ size }) => (
  <Ionicons name="person-circle" size={size} color="gray" />
);


const storage = getStorage(firebaseApp);

const requestPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access media library is required!');
  }
};


 // @ts-ignore
export default function ForumScreen({ route }) {
  const { userName, orderPrivateNumber } = route.params;
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  // Fetch posts related to orderPrivateNumber
  useEffect(() => {
    const database = getDatabase();
    const postsRef = ref(database, 'posts');
    const postsQuery = query(postsRef, orderByChild('orderPrivateNumber'), equalTo(orderPrivateNumber));

    const unsubscribe = onValue(postsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
         // @ts-ignore
        setPosts(postsList);
      } else {
        setPosts([]); // Handle empty posts
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [orderPrivateNumber]);

  const handleAddPost = () => {
    if (newPost.trim() === '') return; // Prevent adding empty posts

    const database = getDatabase();
    const postsRef = ref(database, 'posts');
    const newPostRef = push(postsRef);

    set(newPostRef, {
      content: newPost,
      date: new Date().toISOString(),
      orderPrivateNumber: orderPrivateNumber, // Use orderPrivateNumber from params
      user: {
        name: userName,
        avatar: '/assets/user.png', // Static avatar or change as needed
      },
    }).then(() => {
      console.log("Post added successfully!"); // Log success message
      setNewPost(''); // Clear the input field after successful submission
    }).catch((error) => {
      console.error("Error adding post:", error);
    });
  };
 // @ts-ignore
  const handleAddComment = (postId) => {


    if (newComment.trim() === '') return;

    const database = getDatabase();
    const postRef = ref(database, `posts/${postId}/comments`);
    const newCommentRef = push(postRef);

    set(newCommentRef, {
      content: newComment,
      date: new Date().toISOString(),
      user: {
        name: userName,
        avatar: '/assets/user.png',
      },
    }).then(() => {
      console.log("Comment added successfully!");
      setNewComment('');
    }).catch((error) => {
      console.error("Error adding comment:", error);
    });
  };

 // @ts-ignore
  const handleDeletePost = (postId) => {

    console.log
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const database = getDatabase();
              await remove(ref(database, `posts/${postId}`));
              console.log("Post deleted successfully!");
              // Optionally, refresh posts or update state here
            } catch (error) {
              console.error("Error deleting post:", error);
            }
          }
        }
      ]
    );
  };

   // @ts-ignore
  const pickImage2 = async (postId) => {
    requestPermission();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images and videos
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      const fileUri = result.assets[0].uri;
      const fileType = result.assets[0].type;
  
      if (fileType === 'image') {
        setSelectedImages([...selectedImages, fileUri]);
      } else if (fileType === 'video') {
        setSelectedVideos([...selectedVideos, fileUri]);
      }
  
      await uploadMedia(fileUri, postId);
    }
  };

  
  const uploadMedia = async (uri: string, postId: any) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      // Determine the file extension based on the MIME type
      let fileExtension = '';
      if (blob.type.startsWith('image/')) {
        fileExtension = '.jpg';
      } else if (blob.type.startsWith('video/')) {
        fileExtension = '.mp4';
      }
  
      // Create a reference with the appropriate extension
      const fileName = `${Date.now()}${fileExtension}`;
      const fileRef = storageRef(storage, `posts/images/${fileName}`);
  
      // Upload the file to Firebase Storage
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      console.log('Media uploaded successfully. URL:', downloadURL);
  
      // Update the post in the database with the image URL
      const database = getDatabase();
      const postRef = ref(database, `posts/${postId}`);
  
      // Update only the image field of the post
      await update(postRef, { image: downloadURL });
      console.log('Image URL added to post successfully.');
      
    } catch (error) {
      console.error('Error uploading media or updating post:', error);
    }
  };


  







  
//@ts-ignore
  const handleDeleteComment = (postId, commentId) => {
    console.log("Chhereee!" , postId,commentId);

    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const database = getDatabase();
              await remove(ref(database, `posts/${postId}/comments/${commentId}`));
              console.log("Comment deleted successfully!");
            } catch (error) {
              console.error("Error deleting comment:", error);
            }
          }
        }
      ]
    );
  };




 // @ts-ignore
  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeaderLeft}>
        <UserLogo size={40} />
        <View style={styles.postHeaderText}>
          <Text style={styles.postUser}>{item.user.name}</Text>
          {/* <Text style={styles.postDate}>{new Date(item.date).toLocaleDateString()}</Text> */}
          <Text style={styles.postDate}>{new Date(item.date).toLocaleString()}</Text>

        </View>
        <View style={styles.postHeaderRight} >
        <TouchableOpacity 
          onPress={() => pickImage2(item.id)} 
          style={styles.menuIcon2}
        >
          <Ionicons name="attach" size={24} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handleDeletePost(item.id)} 
          style={styles.menuIcon2}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>


        </View>

        

        
      </View>

      <Text style={styles.postContent}>{item.content}</Text>


      {/* Display the image if it exists */}
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage} 
          resizeMode="cover" 
        />
      )}



      <TouchableOpacity onPress={() => setSelectedPostId(selectedPostId === item.id ? null : item.id)} style={styles.showCommentsButton}>
        <Text style={styles.showCommentsText}>
          {selectedPostId === item.id ? 'Hide comments' : 'Show comments'}
        </Text>
      </TouchableOpacity>

      {/* Show comments section */}
      {selectedPostId === item.id && (
        <View style={styles.commentsContainer}>
          <FlatList
            data={Object.entries(item.comments || {})} // Use entries to get [key, value] pairs
            keyExtractor={([key, _]) => key} // Use the key from the entries
            renderItem={renderComment}
            contentContainerStyle={styles.commentsList}
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              style={styles.commentInput}
            />
            <TouchableOpacity onPress={() => handleAddComment(item.id)} style={styles.addButtonforcomment}>
            


              <Ionicons name="send" size={24} color="blue" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
      // @ts-ignore
      const renderComment = ({ item: [commentId, comment] }) => {
        const formattedDate = new Date(comment.date).toLocaleString(); // Formats date and time

        return (
          <View style={styles.comment}>
            <UserLogo size={24} />
            <View style={styles.commentTextContainer}>
              <Text style={styles.commentUser}>{comment.user.name}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <Text style={styles.commentDate}>{formattedDate}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleDeleteComment(selectedPostId, commentId)} // Pass commentId
              style={styles.commentMenuIcon}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="black" />
            </TouchableOpacity>
          </View>
        );
      };

  

  return (
    <SafeAreaView style={styles.container}>
       {/* <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#D8D9DB" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ fontWeight: "500" }}>Post</Text>
        </TouchableOpacity>
      </View>  */}

      <View style={styles.inputContainer}>
        <Image source={require("../assets/Personmine.png")} style={styles.avatar} />
        <TextInput
          autoFocus={true}  // Correct property name
          value={newPost}
          onChangeText={setNewPost}
          multiline={true}
          numberOfLines={4}
          style={styles.textInput}

          placeholder={`Want to Share something? ${userName}`}
        />
      </View>

      <View style={styles.buttonsContainer}>
        {/* <TouchableOpacity style={styles.photo}>
          <Ionicons name="camera" size={32} color="green" />
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.photo}>
          <Ionicons name="cloud-upload" size={32} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddPost} style={styles.addButtonforpost}>
          <Ionicons name="send" size={30} color="blue" />
          <Text style={styles.addButtonforpost}></Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.postsList}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        //flexDirection: "row",
       // justifyContent: "space-between",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,   // line under post header
        borderBottomColor: "#D8D9DB"
    },

    inputContainer: {
      margin: 5,
      flexDirection: "row",
      paddingRight: 15,
      borderBottomWidth: 1,   // line under post header
      borderBottomColor: "#D8D9DB"
     
    },
    
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 14,
      marginTop: 14,
      marginLeft: 25
    
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 1,
    },
    photo: {
      alignItems: "flex-end",
      marginHorizontal:  10
    },
    addButtonforpost: {
      alignItems: "flex-end",
      marginHorizontal:  10
    },

    
    postsList: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    postCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3, // For Android shadow
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      
    },
    postHeaderText: {
      marginLeft: 5,
      marginRight: 70, // Adds space between the text and the icons

    },
    postUser: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    postDate: {
      fontSize: 12,
      color: '#888',
    },
    postContent: {
      padding: 5,
      fontSize: 16,
      lineHeight: 15,
      borderBottomWidth: 0.8, // line under post content
      borderBottomColor: 'black',
      

    },

    showCommentsButton: {
      marginTop: 8,
      alignItems: 'center',
    },
    showCommentsText: {
      color: '#007bff',
      marginBottom: 1,

      marginTop: -5,
    },
    comment: {
      flexDirection: 'row',
      marginBottom: 4,
      alignItems: 'flex-start',
      marginTop: 4,
      padding: 5,
      backgroundColor: '#F2F2F2',
      borderRadius: 9,
    },
    commentTextContainer: {
      flex: 1,
      marginLeft: 6,
      
      
    },
    commentUser: {
      fontWeight: 'bold',
    },
    commentContent: {
      fontSize: 13,

    },
    commentsList: {
      paddingHorizontal: 16,
    },
    commentInputContainer: { // line above add a commnet contianer borderTopwidth: 1
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
      borderTopWidth: 1,
      borderTopColor: '#ddd',
      

    },
    commentInput: {
      flex: 1,
      padding: 7,
      borderRadius: 10,
      backgroundColor: '#f1f1f1',
      marginRight: 8,
    },
    addButtonforcomment: {
      padding: 4,
    },
     commentsContainer: { // line above comments

    borderTopWidth: 0.8,
    borderTopColor: 'black',
    
    
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4, // Add space above the date

  },

  menuIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },

  commentMenuIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  postImage: {
    width: '100%',
    height: 200, // Adjust the height as needed
    marginVertical: 10,
    borderRadius: 8, // Optional: to add rounded corners
  },

  textInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginVertical: 10,

    height: 50,   // Set fixed height, e.g., 100 pixels
    flex: 1,
    alignSelf: 'center', // Center the input if you want it centered
  },

  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon2: {
    marginLeft: 10, // Space between the icons
   
  },
  






});

