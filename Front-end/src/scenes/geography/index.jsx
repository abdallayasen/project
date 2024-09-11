import React, { useState, useEffect } from "react";
import { Box, Button, Typography, useTheme, Card, CardContent, Grid, Select, MenuItem } from "@mui/material";
import Header from "../../components/Header";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { ref as dbRef, onValue } from 'firebase/database';
import { db } from "../../firebase";
import { tokens } from "../../theme";
import DeleteIcon from '@mui/icons-material/Delete';

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: 40.748817,
  lng: -73.985428,
};

const Geography = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [markers, setMarkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [selectedColor, setSelectedColor] = useState("all");
  const [dateFilter, setDateFilter] = useState(false);

  // Load the Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAfzJl_kuLF-4BygyRvc_mf5NGGEYBPsKU",
    libraries: ["places"],
  });

  // Fetch the orders and customers data
  useEffect(() => {
    // Fetch customers
    const customersRef = dbRef(db, 'customers/');
    onValue(customersRef, (snapshot) => {
      const customerData = snapshot.val();
      const customerList = customerData ? Object.values(customerData) : [];
      setCustomers(customerList);
    });

    // Fetch orders and set markers with full data
    const ordersRef = dbRef(db, 'orders/');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const fetchedOrders = data
        ? Object.keys(data).map((key) => {
            const order = data[key];
            const customer = customers.find(cust => cust.email === order.customerEmail) || {};

            let markerColor = "red";
            let isCompletedStatus = "no";

            if (order.employeeFieldName && !order.isCompleted) {
              markerColor = "yellow"; // Yellow when a field worker is assigned and not completed
              isCompletedStatus = "under processing";
            } else if (order.isCompleted) {
              markerColor = "green"; // Green when order is completed
              isCompletedStatus = "yes";
            }

            return {
              ...order,
              position: {
                lat: parseFloat(order.x),
                lng: parseFloat(order.y),
              },
              color: markerColor,
              customerName: customer.name || "Unknown Customer",
              customerPhone: customer.phone || "No Phone Available",
              isCompletedStatus, // Store the completion status based on the marker color
              orderDate: new Date(order.orderDate), // Add orderDate for filtering
            };
          })
        : [];
      setMarkers(fetchedOrders);
    });
  }, [customers]);

  // Filter markers based on color and date filters
  useEffect(() => {
    let filtered = [...markers];

    // Apply color filter
    if (selectedColor !== "all") {
      filtered = filtered.filter((marker) => marker.color === selectedColor);
    }

    // Apply date filter (only show oldest 10 orders if date filter is selected)
    if (dateFilter) {
      filtered.sort((a, b) => a.orderDate - b.orderDate); // Sort by date ascending
      filtered = filtered.slice(0, 10); // Take only the oldest 10
    }

    setFilteredMarkers(filtered);
  }, [markers, selectedColor, dateFilter]);

  const handleDeleteMarker = (markerId) => {
    setMarkers((current) => current.filter((marker) => marker.id !== markerId));
  };

  return (
    <Box m="20px">
      <Header title="Geography Vizo Map" subtitle="Visualize locations for current and previous work orders" />

      {/* Filter Controls */}
      <Box display="flex" gap={2} mb={4}>
        <Select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          displayEmpty
        >
          <MenuItem value="all">All Colors</MenuItem>
          <MenuItem value="red">Red</MenuItem>
          <MenuItem value="yellow">Yellow</MenuItem>
          <MenuItem value="green">Green</MenuItem>
        </Select>

        <Button
  variant={dateFilter ? "contained" : "outlined"}
  onClick={() => setDateFilter((prev) => !prev)}
  sx={{
    color: 'white', // Set text color to white
    borderColor: 'white', // Ensure the outline also appears in white when in "outlined" mode
  }}
>
  {dateFilter ? "Show All" : "Show Oldest 10 Orders"}
</Button>

      </Box>

      {/* Google Map */}
      <Box>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                label={{
                  text: `${marker.position.lat.toFixed(4)}, ${marker.position.lng.toFixed(4)}`,
                  color: marker.color,
                }}
                icon={{
                  url: `http://maps.google.com/mapfiles/ms/icons/${marker.color}-dot.png`,  // Marker color based on assigned worker
                }}
              />
            ))}
          </GoogleMap>
        )}
      </Box>

      {/* Marker Information */}
      <Box mt={4}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Markers Information
        </Typography>
        <Grid container spacing={2}>
          {filteredMarkers.map((marker) => (
            <Grid item xs={12} sm={6} md={4} key={marker.id}>
              <Card sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], boxShadow: `0 4px 10px ${colors.blueAccent[500]}`, borderRadius: '12px' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Order #{marker.orderPrivateNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Order Private Number: {marker.orderPrivateNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Coordinates: {marker.position.lat.toFixed(4)}, {marker.position.lng.toFixed(4)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Field Worker: {marker.employeeFieldName || "No Name Yet"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Office Employee: {marker.employeeOfficeName || "No Name Yet"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Description: {marker.describeOrder || "No Description"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Customer Name: {marker.customerName || "Unknown Customer"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Customer Phone: {marker.customerPhone || "No Phone Available"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Is Completed: {marker.isCompletedStatus}
                  </Typography>
                  <Button
                    startIcon={<DeleteIcon />}
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeleteMarker(marker.id)}
                    sx={{ mt: 2 }}
                  >
                    Delete Marker
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Geography;
