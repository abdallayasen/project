import React, { useEffect, useState } from 'react';
import {
  Box, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ref as dbRef, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { Typography, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CommentIcon from '@mui/icons-material/Comment';
import Header from "../../components/Header";
import StatusButton from '../../components/StatusButton';
import Comments from '../../scenes/comments';
import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';  // Make sure you have storage configured in your firebase.js
import DescriptionIcon from '@mui/icons-material/Description';

const AllWork = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [ordersInfo, setOrdersInfo] = useState([]); // Orders information table
  const [customers, setCustomers] = useState([]); // Customer info table
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const index = 0;

  useEffect(() => {
    // Fetch orders from OrdersInfo (which contains order details)
    const fetchOrdersInfo = async () => {
      const ordersRef = dbRef(db, 'orders/');
      onValue(ordersRef, async (snapshot) => {
        const data = snapshot.val();
        const orderList = data
          ? await Promise.all(
              Object.keys(data).map(async (key) => {
                const files = await fetchFilesFromStorage(key);  // Fetch files for each order
                return {
                  id: key,
                  serialNumber: index + 1, // Assign a serial number based on the index
                  orderPrivateNumber: data[key].orderPrivateNumber,
                  client_mail: data[key].customerEmail,
                  officeStatus: data[key].officeStatus,
                  fieldStatus: data[key].fieldStatus,
                  isCompleted: data[key].isCompleted,  // Ensure this flag is part of the data
                  files, // Include the files in the order data
                  ...data[key],
                };
              })
            )
          : [];
    
        // Filter orders: only show orders with both officeStatus and fieldStatus as 'Success' and isCompleted is true
        const filteredOrders = orderList.filter(
          (order) => order.officeStatus === 'Success' && order.fieldStatus === 'Success' && order.isCompleted
        );
    
        setOrdersInfo(filteredOrders); // Save filtered orders
      });
    };
    
// Add the fetchFilesFromStorage function to fetch files for each order
const fetchFilesFromStorage = async (orderId) => {
  const filesRef = storageRef(storage, `orders/${orderId}`);
  const fileList = [];
  try {
    const result = await listAll(filesRef);
    for (const itemRef of result.items) {
      const url = await getDownloadURL(itemRef);
      fileList.push({ name: itemRef.name, url });
    }
  } catch (error) {
    console.error("Error fetching files from storage:", error);
  }
  return fileList;
};
    // Fetch customers
    const fetchCustomers = () => {
      const customersRef = dbRef(db, 'customers/');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        const customerList = data ? Object.values(data) : [];
        setCustomers(customerList); // Save customer data
      });
    };

    fetchOrdersInfo();
    fetchCustomers();
  }, []);

  // Map orders with client_id and customerName from OrdersInfo and Customers data
  const rowsWithCustomerInfo = ordersInfo.map((order) => {
    const customer = customers.find((cust) => cust.email === order.client_mail); // Match by email
    return {
      ...order,
      customerName: customer ? customer.name : 'Unknown Customer',
      client_id: customer ? customer.passportId : 'Unknown Client ID', // Use passportId as client_id
    };
  });

  const handleDownloadAllFiles = async (orderId) => {
    const files = rowsWithCustomerInfo.find(row => row.id === orderId)?.files || [];
    if (files.length === 0) {
      setSnackbarMessage("No files to download.");
      setSnackbarOpen(true);
      return;
    }
  
    for (const file of files) {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
  
        // Clean up the URL object
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error(`Error downloading file ${file.name}:`, error);
        setSnackbarMessage(`Failed to download ${file.name}`);
        setSnackbarOpen(true);
      }
    }
  };
  

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleCommentsDialogOpen = (row) => {
    setSelectedOrder(row);
    setCommentsDialogOpen(true);
  };

  const handleCommentsDialogClose = () => {
    setCommentsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleFileDownload = async (file) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    } catch (error) {
      setSnackbarMessage("Download failed: " + error.message);
      setSnackbarOpen(true);
    }
  };

  

  const renderFileIcons = (params) => {
    const files = params.row.files || [];
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {files.map((file) => {
          let icon;
          const lowerCaseFile = file.name.toLowerCase();

          if (lowerCaseFile.endsWith('.pdf')) {
            icon = (
              <PictureAsPdfIcon sx={{ color: colors.greenAccent[500] }} />
            );
          } else if (
            lowerCaseFile.endsWith('.jpg') ||
            lowerCaseFile.endsWith('.png') ||
            lowerCaseFile.endsWith('.jpeg')
          ) {
            icon = <ImageIcon sx={{ color: 'red', fontSize: 20 }} />;
          } else if (lowerCaseFile.endsWith('.mp4')) {
            icon = (
              <VideoLibraryIcon sx={{ color: colors.blueAccent[500] }} />
            );
          } else if (lowerCaseFile.endsWith('.txt')) {
            icon = (
              <DescriptionIcon sx={{ color: '#FFA500' }} /> // Use standard orange color
            );
          } else {
            icon = (
              <CloudDownloadIcon sx={{ color: colors.greenAccent[500] }} />
            );
          }

          return (
            <IconButton key={file.name} onClick={() => handleFileDownload(file)}>
              {icon}
            </IconButton>
          );
        })}
      </Box>
    );
  };

  const statusStyle = (status) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 2,
  });

  const columns = [
    { field: "serialNumber", headerName: "Serial Number", flex: 0.5, editable: false },
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: false,
    },
    {
      field: "orderPrivateNumber",
      headerName: "Order Private Number",
      flex: 2,
    },
    {
      field: "describeOrder",
      headerName: "Order Description",
      flex: 1,
    },
    {
      field: "orderType",
      headerName: "Order Type",
      flex: 1,
    },
    {
      field: "employeeOfficeName",
      headerName: "Office Employee",
      flex: 4,
      renderCell: (params) => (
        <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "employeeFieldName",
      headerName: "Field Employee",
      flex: 4,
      renderCell: (params) => (
        <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "client_id",
      headerName: "Client ID",
      flex: 2,
      editable: false,
    },
    {
      field: "files",
      headerName: "Files",
      flex: 8,
      renderCell: renderFileIcons,
    },
    
    {
      field: "comments",
      headerName: "Posts",
      flex: 1.5,
      renderCell: (params) => (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center', 
            height: '100%' 
          }}
        >
          <IconButton onClick={() => handleCommentsDialogOpen(params.row)}>
            <CommentIcon sx={{ color: colors.greenAccent[500] }} />
          </IconButton>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1.5,
      renderCell: (params) => (
        
        <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'center', gap: 0 }}>
          <IconButton onClick={() => handleDownloadAllFiles(params.row.id)} color="primary">
            <CloudDownloadIcon sx={{ color: colors.greenAccent[500] }} />
          </IconButton>
          </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
<Box 
    m="20px" 

  >      <Header title="Completed Orders" subtitle="List of successfully completed orders" />
      <Box mt="20px" height="75vh">
        <DataGrid
          rows={rowsWithCustomerInfo}
          columns={columns}
          editRowsModel={{}}
          onEditRowsModelChange={() => {}}
          processRowUpdate={(newRow) => newRow}
          slots={{ toolbar: GridToolbar }}
          sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .name-column--cell": { color: colors.greenAccent[300] },
            "& .MuiDataGrid-columnHeader": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
            "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
            "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
            "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
          }}
        />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={commentsDialogOpen}
        onClose={handleCommentsDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#04042c', color: '#ffffff', overflowY: 'auto' },
        }}
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent sx={{ overflowY: 'auto', maxHeight: '70vh' }}>
          {selectedOrder && <Comments orderPrivateNumber={selectedOrder.orderPrivateNumber} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommentsDialogClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllWork;
