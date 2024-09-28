import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Modal, TouchableOpacity, FlatList, Dimensions, Linking,Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import firebaseApp from './firebaseConfig';
import { Ionicons, FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for blue file icons
import * as DocumentPicker from 'expo-document-picker';


const screenWidth = Dimensions.get('window').width;
const storage = getStorage(firebaseApp);

export default function UploadImageScreen({ route }: any) {
  const { orderId } = route.params;
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [pdfFiles, setPdfFiles] = useState<string[]>([]); // State to track PDF URLs
  const [txtFiles, setTxtFiles] = useState<string[]>([]); // State to track TXT URLs
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchMedia();
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
    }
  };

  const pickImage = async () => {
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
  
      await uploadMedia(fileUri);
    }
  };

  const pickDocument = async () => {
    requestPermission();
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain"] // Supports both PDF and TXT files
      });

      const formData = new FormData();
      const assets = docRes.assets
      if(!assets) return

      const file = assets[0]

      const pdfFile = {
        name: file.name.split(".")[1],
        uri:  file.uri,
        type: file.mimeType
      };

      formData.append("pdfFile", pdfFile as any);

      // Call uploadFiles function
      await uploadFiles(pdfFile);

    } catch (error) {
      console.log("error", error);
    }
  };

  const uploadFiles = async (file: {  name: any; uri : any ; type: any }) => {
    try {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      
      // Create a reference with the appropriate file extension
      const fileExtension = file.name.split('.').pop() || 'pdf'; // Default to 'pdf' if extension is missing
      const storageRef = ref(storage, `orders/${orderId}/${Date.now()}.${fileExtension}`);
  
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('File uploaded successfully. URL:', downloadURL);
  
      // Fetch updated media if needed
      fetchMedia();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };


  // const takePhoto = async () => {
  //   requestPermission();
  //   const result = await ImagePicker.launchCameraAsync({
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     const imageUri = result.assets[0].uri;
  //     setSelectedImages([...selectedImages, imageUri]);
  //     await uploadMedia(imageUri);
  //   }
  // };

  const uploadMedia = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      // Determine the file extension based on the MIME type
      let fileExtension = '';
      if (blob.type.startsWith('image/')) {
        fileExtension = '.jpg'; // You can adjust this based on the image type if needed
      } else if (blob.type.startsWith('video/')) {
        fileExtension = '.mp4';
      }
  
      // Create a reference with the appropriate extension
      const storageRef = ref(storage, `orders/${orderId}/${Date.now()}${fileExtension}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Media uploaded successfully. URL:', downloadURL);
  
      fetchMedia();
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };


  
  

  const fetchMedia = async () => {
    try {
      const listRef = ref(storage, `orders/${orderId}/`);
      const res = await listAll(listRef);

      const imageUrls: string[] = [];
      const videoUrls: string[] = [];
      const pdfUrls: string[] = [];
      const txtUrls: string[] = [];

      for (const itemRef of res.items) {
        const name = itemRef.name.toLowerCase();

        const url = await getDownloadURL(itemRef);
        if (name.endsWith('.mp4')) {
          videoUrls.push(url);
        } else if (name.endsWith('.pdf')) {
          pdfUrls.push(url);
        } else if (name.endsWith('.txt')) {
          txtUrls.push(url);
        } else {
          imageUrls.push(url);
        }
      }

      setSelectedImages(imageUrls);
      setSelectedVideos(videoUrls);
      setPdfFiles(pdfUrls);
      setTxtFiles(txtUrls);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const openImageInFullScreen = (index: number) => {
    setActiveIndex(index);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const renderFullScreenImage = ({ item }: { item: string }) => (
    <View style={styles.fullScreenImageContainer}>
      <Image source={{ uri: item }} style={styles.fullScreenImage} />
    </View>
  );

  const renderFullScreenVideo = ({ item }: { item: string }) => (
    <View style={styles.fullScreenImageContainer}>
      <Video
        source={{ uri: item }}
        style={styles.fullScreenImage}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
      />
    </View>
  );

  const downloadFile = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening file URL:', err));
  };

  const renderPdfItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.fileContainer} onPress={() => downloadFile(item)}>
      <Ionicons name="document-text" size={50} color="red" />
      <Text style={styles.fileText}>pdf</Text>
    </TouchableOpacity>
  );

  const renderTxtItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.fileContainer} onPress={() => downloadFile(item)}>
      <FontAwesome name="file-text" size={50} color="blue" />
      <Text style={styles.fileText}>text</Text>
    </TouchableOpacity>
  );

    // New functions for long-press deletion
    const handleImageLongPress = (imageUri: string) => {
      Alert.alert(
        "Delete Image",
        "Are you sure you want to delete this image?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => deleteImage(imageUri),
            style: "destructive",
          },
        ]
      );
    };

    const deleteImage = async (imageUri: string) => {
      try {
        // Find the reference to the image in Firebase storage
        const storageRef = ref(storage, imageUri);
  
        // Delete the image from Firebase storage
        await deleteObject(storageRef);
        console.log('Image deleted from Firebase storage.');
  
        // Update the state to remove the image from the UI
        setSelectedImages((prevImages) => prevImages.filter((img) => img !== imageUri));
  
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    };
    //@ts-ignore
    const handleVideoLongPress = (videoUri) => {
      Alert.alert(
        "Delete Video",
        "Are you sure you want to delete this video?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => deleteVideo(videoUri),
            style: "destructive",
          },
        ]
      );
    };
    
    const deleteVideo = async (videoUri: string | undefined) => {
      try {
        // Find the reference to the video in Firebase storage
        const storageRef = ref(storage, videoUri);
    
        // Delete the video from Firebase storage
        await deleteObject(storageRef);
        console.log('Video deleted from Firebase storage.');
    
        // Update the state to remove the video from the UI
        setSelectedVideos((prevVideos) => prevVideos.filter((vid) => vid !== videoUri));
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    };
    //@ts-ignore
    const handlePdfLongPress = (pdfUri) => {
      Alert.alert(
        "Delete PDF File",
        "Are you sure you want to delete this PDF file?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => deletePdf(pdfUri),
            style: "destructive",
          },
        ]
      );
    };
        //@ts-ignore
    const handleTxtLongPress = (txtUri) => {
      Alert.alert(
        "Delete Text File",
        "Are you sure you want to delete this text file?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => deleteTxt(txtUri),
            style: "destructive",
          },
        ]
      );
    };
        //@ts-ignore
    const deletePdf = async (pdfUri) => {
      try {
        // Find the reference to the PDF in Firebase storage
        const storageRef = ref(storage, pdfUri);
    
        // Delete the PDF from Firebase storage
        await deleteObject(storageRef);
        console.log('PDF file deleted from Firebase storage.');
    
        // Update the state to remove the PDF from the UI
        setPdfFiles((prevFiles) => prevFiles.filter((file) => file !== pdfUri));
      } catch (error) {
        console.error('Error deleting PDF file:', error);
      }
    };
        //@ts-ignore
    const deleteTxt = async (txtUri) => {
      try {
        // Find the reference to the text file in Firebase storage
        const storageRef = ref(storage, txtUri);
    
        // Delete the text file from Firebase storage
        await deleteObject(storageRef);
        console.log('Text file deleted from Firebase storage.');
    
        // Update the state to remove the text file from the UI
        setTxtFiles((prevFiles) => prevFiles.filter((file) => file !== txtUri));
      } catch (error) {
        console.error('Error deleting text file:', error);
      }
    };
    
    



  return (
    <View style={styles.container}>
      <View style={styles.title1}>
          <Text>Upload Media for Order ID: {orderId}</Text>
      </View>


      <View style={styles.buttonContainer}>
        <Button title="Pick from Gallery" onPress={pickImage} />
        <Button title="Document upload" onPress={pickDocument} />
        {/* <Button title="Take a Photo" onPress={takePhoto} /> */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <View style={styles.line} />
          <View style={styles.mediaRow}>
          {selectedImages.map((imageUri, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openImageInFullScreen(index)}
              onLongPress={() => handleImageLongPress(imageUri)} // Long press to delete
            >
              <Image source={{ uri: imageUri }} style={styles.image} />
            </TouchableOpacity>
          ))}
        </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Videos</Text>
          <View style={styles.line} />
          <View style={styles.mediaRow}>
            
          {selectedVideos.map((videoUri, index) => (
            <TouchableOpacity
              key={index}
              onLongPress={() => handleVideoLongPress(videoUri)} // Long press to delete
            >
              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: videoUri }}
                  style={styles.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        </View>

        <View style={styles.section}>
  <Text style={styles.sectionTitle}>PDF Files</Text>
  <View style={styles.line} />
  <View style={styles.mediaRow}>
    {pdfFiles.map((pdfUri, index) => (
      <TouchableOpacity
        key={index}
        onLongPress={() => handlePdfLongPress(pdfUri)} // Long press to delete
      >
        <View style={styles.fileContainer}>
          <Ionicons name="document-text" size={50} color="red" />
          <Text style={styles.fileText}>PDF</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Text Files</Text>
  <View style={styles.line} />
  <View style={styles.mediaRow}>
    {txtFiles.map((txtUri, index) => (
      <TouchableOpacity
        key={index}
        onLongPress={() => handleTxtLongPress(txtUri)} // Long press to delete
      >
        <View style={styles.fileContainer}>
          <FontAwesome name="file-text" size={50} color="blue" />
          <Text style={styles.fileText}>Text</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
</View>
      </ScrollView>

      {/* Modal for full-screen image swiping */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <FlatList
            data={selectedImages}
            renderItem={renderFullScreenImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setActiveIndex(newIndex);
            }}
            initialScrollIndex={activeIndex}
            getItemLayout={(data, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  title1: {
       //flexDirection: "row",
       padding: 0,
       marginBottom:10,
       borderBottomWidth: 1,   // line under post header
       borderBottomColor: "black"
  },
  buttonContainer: {
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  line: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 15,
  },
  videoContainer: {
    width: 150,
    height: 150,
    margin: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  fileText: {
    marginLeft: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  fullScreenImageContainer: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
