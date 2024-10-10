//wokring order and uploads

// MainPage.tsx
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import UploadImageScreen from './UploadImageScreen';
import ForumScreen from './ForumScreen';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, query, orderByChild, equalTo,update } from "firebase/database";
import { Alert } from 'react-native';
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router"; // Import useRouter
import { Image } from 'react-native';




// Mock data for orders
const orderData = [
  { id: '1', name: 'Order 1' },
  { id: '2', name: 'Order 2' },
];

// Home Screen component
function HomeScreen() {
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const database = getDatabase();

    if (user) {
      const usersRef = query(ref(database, 'users'), orderByChild('email'), equalTo(user.email));
      onValue(usersRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          setUserName(userData.name); // 'name' is the field in our database
        });
      });
    }
  }, []);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      
      <Text style={styles.buttonText2}>Welcome, {userName}</Text>
      {/* <Image
          source={require('../assets/manlogo1.png')} // Adjust the path as needed
          style={styles.logo}
          resizeMode="contain" // This will ensure the entire image is visible
        /> */}
              <Image
          source={require('../assets/Haifa_logo.png')} // Adjust the path as needed
          style={styles.logo}
          resizeMode="contain" // This will ensure the entire image is visible
        />
    </View>
  );
}

// Settings Component
// @ts-ignore
function Settings({ userName }) {
  const auth = getAuth();
  const router = useRouter(); // Initialize useRouter

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            signOut(auth)
              .then(() => {
                Alert.alert("Goodbye!", "You have successfully logged out.");
                console.log("User has loggedOut successfully.");
                router.push('/'); // Navigate to the index page
              })
              .catch((error) => console.error("Error logging out: ", error));
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.buttonText2}>GoodBye, {userName}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={45} color="black" />
        <Text style={styles.buttonText2}>LogOut</Text>
      </TouchableOpacity>
    </View>
  );
}





// Order Screen component
// @ts-ignore
// Order Screen component
// @ts-ignore
function OrderScreen({ navigation, userName }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState('All'); // State for filter selection
  const [postCounts, setPostCounts] = useState<{ [key: string]: number }>({});


  useEffect(() => {
    const database = getDatabase();
    const ordersRef = query(
      ref(database, 'orders'),
      orderByChild('employeeFieldName'),
      equalTo(userName) // Filter orders based on employeeFieldName
    );

    // Fetch orders from Firebase
    onValue(ordersRef, (snapshot) => {
      // @ts-ignore
      const ordersList = [];
      snapshot.forEach((childSnapshot) => {
        const orderData = childSnapshot.val();
        ordersList.push({
          id: childSnapshot.key, // Use Firebase key as order ID
          ...orderData, // Spread the order data
        });
      });
      // @ts-ignore
      setOrders(ordersList); // Update the orders state with fetched data
      // @ts-ignore
      filterOrders(ordersList); // Filter the orders based on the selected filter
            // @ts-ignore
      fetchPostCounts(ordersList);  // Call here to fetch post counts

    });
  }, [userName]); // Ensure effect runs whenever userName changes

  const fetchPostCounts = (ordersList: any[]) => {
    const database = getDatabase();
    const counts: { [key: string]: number } = {};
  
    ordersList.forEach((order) => {
      const postsRef = query(ref(database, 'posts'), orderByChild('orderPrivateNumber'), equalTo(order.orderPrivateNumber));
      onValue(postsRef, (snapshot) => {
        const postCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        counts[order.orderPrivateNumber] = postCount;
        setPostCounts({ ...counts });
      });
    });
  };
  

  useEffect(() => {
    filterOrders(orders); // Filter orders when filter changes
  }, [filter, orders]);

  // Function to filter orders based on selected filter
  // @ts-ignore
  const filterOrders = (ordersList) => {
    if (filter === 'All') {
      setFilteredOrders(ordersList);
    } else {
      // @ts-ignore
      const filtered = ordersList.filter(order => order.fieldStatus === filter);
      setFilteredOrders(filtered);
    }
  };

  // Function to toggle order status
  // @ts-ignore
  // const toggleStatus = (orderId, currentStatus) => {
  //   const database = getDatabase();
  //   const orderRef = ref(database, `orders/${orderId}`);

  //   const newStatus = currentStatus === "Success" ? "notstarted" : "Success";
  //   update(orderRef, { fieldStatus: newStatus }) // Update the fieldStatus in Firebase
  //     .then(() => {
  //       console.log("Order status updated!");
  //     })
  //     .catch((error) => {
  //       console.error("Error updating status: ", error);
  //     });
  // };

//   const toggleStatus = (orderId, currentStatus) => {
//     const database = getDatabase();
//     const orderRef = ref(database, `orders/${orderId}`);

//     // Determine the new status based on the current status
//     let updatedStatus; // Renamed to avoid redeclaration conflict
    
//     if (currentStatus === "Not started") {
//         updatedStatus = "Processing";
//     } else if (currentStatus === "Processing") {
//         updatedStatus = "Success";
//     } else if (currentStatus === "Update") {
//       /*add alert here*/ 
//         updatedStatus = "Success";
//     } else if (currentStatus === "Success") {
//       updatedStatus = "Not started";
//     } 
//     else {
//         updatedStatus = "Not started";
//     }


//     // Update the status in Firebase
//     update(orderRef, { fieldStatus: updatedStatus })
//       .then(() => {
//         console.log("Order status updated to", updatedStatus);
//       })
//       .catch((error) => {
//         console.error("Error updating status: ", error);
//       });
// };


const toggleStatus = (orderId, currentStatus) => {
  const database = getDatabase();
  const orderRef = ref(database, `orders/${orderId}`);

  let updatedStatus;

  // Determine the new status based on the current status
  if (currentStatus === "Assigned") {
    showAlert(
      "Confirm Status Change",
      "Are you sure you want to mark this as 'Processing'?",
      () => {
        updatedStatus = "Processing";
        updateStatusInDatabase(orderRef, updatedStatus);
      }
    );
  } 
  else if (currentStatus === "Processing") {
    showAlert(
      "Confirm Status Change",
      "Are you sure you want to mark this as 'Success'?",
      () => {
        updatedStatus = "Success";
        updateStatusInDatabase(orderRef, updatedStatus);
      }
    );
  } 
  else if (currentStatus === "Revision") {
    // Show confirmation alert before updating to "Success"
    showAlert(
      "Confirm Status Change",
      "Are you sure you want to mark this as 'Success'?",
      () => {
        updatedStatus = "Success";
        updateStatusInDatabase(orderRef, updatedStatus);
      }
    );
  } 
  else if (currentStatus === "Success") {
    // Show confirmation alert before updating to "Not started"
    showAlert(
      "Confirm Status Change",
      "Are you sure you want to mark this as 'Hold'?",
      () => {
        updatedStatus = "Hold";
        updateStatusInDatabase(orderRef, updatedStatus);
      }
    );
  } 
  else {
    updatedStatus = "Assigned";
    updateStatusInDatabase(orderRef, updatedStatus);
  }
};

// Helper function to update status in Firebase
//@ts-ignore
const updateStatusInDatabase = (orderRef, updatedStatus) => {
  Alert.alert("Updating...", "Please wait while we update the status.", [], { cancelable: false });

  
  update(orderRef, { fieldStatus: updatedStatus })
    .then(() => {

       // Hide the "sending" alert and show a success message
       Alert.alert("Success", "Order status has been updated successfully.");
      console.log("Order status updated to", updatedStatus);
    })
    .catch((error) => {
      console.error("Error updating status: ", error);
    });
};

// Reusable function to show an alert
//@ts-ignore
const showAlert = (title, message, onConfirm) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: "Cancel",
        onPress: () => console.log("User canceled"),
        style: "cancel"
      },
      {
        text: "Yes",
        onPress: onConfirm
      }
    ]
  );
};


  // @ts-ignore
  const renderOrderCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Order #{item.orderPrivateNumber}</Text>
      
      <View style={styles.cardText}> 
        <Text style={styles.datatext}><Text style={styles.bullet}>• </Text>{item.orderType}</Text>
        <Text style={styles.datatext}><Text style={styles.bullet}>• </Text> {item.describeOrder}</Text>
        <Text style={styles.datatext}><Text style={styles.bullet}>• </Text>{item.orderDate}</Text>

      </View>

      {/* Status Toggle Button */}
      {/* <TouchableOpacity
        style={[styles.statusButton, item.fieldStatus === "Success" ? styles.success : styles.Processing]}
        onPress={() => toggleStatus(item.id, item.fieldStatus)} // Toggle status on button press
      >
        <Text style={styles.buttonText}>
          {item.fieldStatus === "Success" ? "Success" : "notstarted"}
        </Text>
      </TouchableOpacity> */}
          {/* Status Toggle Button */}
    <TouchableOpacity
      style={[
        styles.statusButton,
        item.fieldStatus === 'Success' ? styles.success :
        item.fieldStatus === 'Processing' ? styles.Processing :
        item.fieldStatus === 'Pending' ? styles.pending :
        item.fieldStatus === 'Revision' ? styles.pending :
        item.fieldStatus === 'Assigned' ? styles.notStarted :
        styles.notStarted
      ]}
      onPress={() => toggleStatus(item.id, item.fieldStatus)} // Toggle status on button press
    >
      <Text style={styles.buttonText}>
        {item.fieldStatus}
      </Text>
    </TouchableOpacity>

      <View style={styles.buttonContainer}>
        {/* Upload Image Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('UploadImage', { orderId: item.id })}
        >
          <Ionicons name="image" size={24} color="red" />
          <Text style={styles.buttonText}>Uploads</Text>
        </TouchableOpacity>

        {/* Forum Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Forum', { userName, orderPrivateNumber: item.orderPrivateNumber })}
        >
          <Ionicons name="chatbubbles" size={24} color="green" />
          {postCounts[item.orderPrivateNumber] > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{postCounts[item.orderPrivateNumber]}</Text>
          </View>
        )}
          <Text style={styles.buttonText}></Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, filter === 'All' && styles.activeTab]}
          onPress={() => setFilter('All')}
        >
          <Text style={styles.tabText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'Success' && styles.activeTab]}
          onPress={() => setFilter('Success')}
        >
          <Text style={styles.tabText}>Success</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[styles.tab, filter === 'Processing' && styles.activeTab]}
          onPress={() => setFilter('Processing')}
        >
          <Text style={styles.tabText}>Processing</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.tab, filter === 'Assigned' && styles.activeTab]}
          onPress={() => setFilter('Assigned')}
        >
          <Text style={styles.tabText}>Assigned</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filter === 'Processing' && styles.activeTab]}
          onPress={() => setFilter('Processing')}
        >
          <Text style={styles.tabText}>Processing</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders} // Use filtered orders data
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
      />
    </View>
  );
}




// Stack Navigator for UploadImageScreen and ForumScreen
const Stack = createNativeStackNavigator();


// Define the props for OrderStack
interface OrderStackProps {
  userName: string;
}
// @ts-ignore
function OrderStack({userName }: OrderStackProps) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Order" 
      options={{
        title: "Your Tasks",
        headerTitleAlign: 'center', // Center the title
        headerTintColor: "white",
         headerStyle: { 
          backgroundColor: "#2040b3",
         },
         headerTitleStyle: {
          fontSize: 25
         }
        
      }}
      >
        {(props: any) => <OrderScreen {...props} userName={userName} />}
      </Stack.Screen>
      <Stack.Screen name="UploadImage" component={UploadImageScreen} 
            options={{
              headerTitleAlign: 'center', // Center the title
              headerTintColor: "white",
               headerStyle: { 
                backgroundColor: "#2040b3",
               },
               headerTitleStyle: {
                fontSize: 25
               }
              
            }}
      
      
      
      
      />
      <Stack.Screen name="Forum" 
       options={{
       headerTitleAlign: 'center', // Center the title
      headerTintColor: "white",
       headerStyle: { 
        backgroundColor: "#2040b3",
       },
      }}
      >
        {(props: any) => <ForumScreen {...props} userName={userName} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

export default function MainPage() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const database = getDatabase();

    if (user) {
      const usersRef = query(ref(database, 'users'), orderByChild('email'), equalTo(user.email));
      onValue(usersRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          setUserName(userData.name); // Assume 'name' is the field in your database
        });
      });
    }
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home'; // Home icon
          } else if (route.name === 'Tasks') {
            iconName = 'list'; // Order/Cart icon
          }
          else if (route.name === 'Settings') {
            iconName = 'settings'; // Order icon
          }
          
          
          
          // @ts-ignore
          return <Ionicons name={iconName} size={35} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          height: 70, // Increase the height of the tab bar
          fontSize:10,
          paddingBottom: 5, // Add padding to center the icons
          paddingTop: 10, // Add padding to center the icons
          backgroundColor: "#2040b3",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} 
            options={{
              headerTitleAlign: 'center', // Center the title
              title: "Home",
              headerTintColor: "white",
               headerStyle: { 
                backgroundColor: "#2040b3",
                shadowOpacity: 0.5, // Add shadow for iOS

               },
               headerTitleStyle: {
                fontSize: 25
               }
              
              
            }}
      
      />

      <Tab.Screen name="Tasks" options={{ headerShown: false }} // Hide the header for the Order screen
 >
        {(props) => <OrderStack {...props} userName={userName} />}
      </Tab.Screen>
      <Tab.Screen name="Settings"      
                  options={{
                    headerTitleAlign: 'center', // Center the title
                    title: "Settings",
                    headerTintColor: "white",
                     headerStyle: { 
                      backgroundColor: "#2040b3",
                     },
                     headerTitleStyle: {
                      fontSize: 25
                     }

                  }}
      
      
      
      >
        {(props) => <Settings {...props} userName={userName} />}
      </Tab.Screen>
      


    </Tab.Navigator>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: 'bold',

  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    marginLeft: 8,
    color: 'black',
    fontSize: 16,
  },
  statusButton: {
    padding: 5,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,

    
  },
  success: {
    backgroundColor: 'green',
  },
  Processing: {
    backgroundColor: '#5dacff',
  },
  pending: {
    backgroundColor: 'orange',
  },
  notStarted: {
    backgroundColor: '#fa3636',
  },
  cardText: {
    
    borderWidth: 1, // Width of the border around the box
    borderColor: 'gray', // Color of the border
    padding: 10, // Space between the text and the border
    borderRadius: 8, // Optional: rounded corners for the box
    marginVertical: 10, // Space around the box
    backgroundColor: 'white', // Optional: background color inside the box
  },

  datatext: {
    fontSize: 24, // Font size of the text
    color: '#333', // Text color
    fontWeight: '300', // Font weight
    padding: 3,
    marginHorizontal: 2,
  
    
  },

  buttonContainer: {
    flexDirection: 'row', // Align children horizontally
    justifyContent: 'space-between', // Space out buttons evenly
    marginTop: 10, // Adjust as needed
  },
    bullet: {
    fontSize: 24, // Increase bullet size

  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#ff4d4d', // Background color for the button
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    borderRadius: 8, // Rounded corners
    shadowColor: '#000', // Shadow color for elevation
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 3, // Shadow radius
    elevation: 4, // Elevation for Android shadow
  },
  buttonText2: {
    marginLeft: 8,
    fontSize: 40,
    color: 'black',
    fontWeight: 'condensedBold', // Use fontWeight to make the text bold
    
    
  },
  buttonText3: {
    marginLeft: 8,
    fontSize: 35,
    color: 'Black',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 2,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logo: {
    width: 250, // Adjust width as needed
    height: 250, // Adjust height as needed
    marginVertical: 20, // Space above and below the logo
  },

  

});
