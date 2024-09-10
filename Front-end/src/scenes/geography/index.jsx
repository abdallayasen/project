import React, { useState, useCallback, useEffect } from "react";
import { Box, Button, Typography, useTheme, Card, CardContent, Select, MenuItem, Grid } from "@mui/material";
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
  const [selectedColor, setSelectedColor] = useState("red");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [orders, setOrders] = useState([]);

  // Load the Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAfzJl_kuLF-4BygyRvc_mf5NGGEYBPsKU",
    libraries: ["places"],
  });

  // Fetch the orders from Firebase
  useEffect(() => {
    const ordersRef = dbRef(db, 'orders/');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const fetchedOrders = data ? Object.keys(data).map((key) => data[key].orderPrivateNumber) : [];
      setOrders(fetchedOrders);
    });
  }, []);

  const onMapClick = useCallback((event) => {
    if (!selectedOrder) {
      alert("Please select an order.");
      return;
    }

    const newMarker = {
      id: Date.now(),
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
      color: selectedColor,
      orderPrivateNumber: selectedOrder,
    };

    setMarkers((current) => [...current, newMarker]);
  }, [selectedColor, selectedOrder]);

  const handleDeleteMarker = (markerId) => {
    setMarkers((current) => current.filter((marker) => marker.id !== markerId));
  };

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  const handleOrderChange = (event) => {
    setSelectedOrder(event.target.value);
  };

  return (
    <Box m="20px">
      <Header title="Geography Vizo Map" subtitle="Visualize locations for current and previous work orders" />

      {/* Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <Box display="flex" gap={2}>
          <Select value={selectedOrder} onChange={handleOrderChange} displayEmpty>
            <MenuItem value="" disabled>Select Order</MenuItem>
            {orders.map((orderPrivateNumber) => (
              <MenuItem key={orderPrivateNumber} value={orderPrivateNumber}>
                {orderPrivateNumber}
              </MenuItem>
            ))}
          </Select>

          <Select value={selectedColor} onChange={handleColorChange}>
            <MenuItem value="red">Red</MenuItem>
            <MenuItem value="green">Green</MenuItem>
          </Select>
        </Box>

        <Typography variant="body1">Click on the map to add a marker for the selected order.</Typography>
      </Box>

      {/* Google Map */}
      <Box>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onClick={onMapClick}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                label={{
                  text: `${marker.position.lat.toFixed(4)}, ${marker.position.lng.toFixed(4)}`,
                  color: marker.color,
                }}
                icon={{
                  url: `http://maps.google.com/mapfiles/ms/icons/${marker.color}-dot.png`,
                }}
              />
            ))}
          </GoogleMap>
        )}
      </Box>

      {/* Marker Table */}
      <Box mt={4}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Markers Information
        </Typography>
        <Grid container spacing={2}>
          {markers.map((marker) => (
            <Grid item xs={12} sm={6} md={4} key={marker.id}>
              <Card sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], boxShadow: `0 4px 10px ${colors.blueAccent[500]}`, borderRadius: '12px' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Order #{marker.orderPrivateNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Coordinates: {marker.position.lat.toFixed(4)}, {marker.position.lng.toFixed(4)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Is Completed: {marker.color === "green" ? "Yes" : "No"}
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
