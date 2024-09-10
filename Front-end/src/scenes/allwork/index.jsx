import React, { useEffect, useState } from 'react';
import {
  Box, IconButton, Checkbox, MenuItem, Select, Typography, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ref as dbRef, onValue, update } from 'firebase/database';
import { ref as storageRef, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from '../../firebase';
import Header from "../../components/Header";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StatusButton from '../../components/StatusButton';
import Comments from '../../scenes/comments';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

const AllWork = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fieldWorkers, setFieldWorkers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const ordersRef = dbRef(db, 'orders/');
      onValue(ordersRef, async (snapshot) => {
        const data = snapshot.val();
        const orderList = data
          ? await Promise.all(Object.keys(data).map(async (key, index) => {
              const fileList = await fetchFilesFromStorage(key);
              return {
                id: key,
                serialNumber: index + 1,
                files: fileList,
                ...data[key],
              };
            }))
          : [];
        const completedOrders = orderList.filter((order) => order.isCompleted); // Show only completed orders
        setRows(completedOrders);
      });
    };
    

    const fetchCustomers = () => {
      const customersRef = dbRef(db, 'customers/');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        const customerList = data ? Object.values(data) : [];
        setCustomers(customerList);
      });
    };

    const fetchFieldWorkers = () => {
      const usersRef = dbRef(db, 'users/');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const fieldWorkerList = data ? Object.values(data).filter(user => user.userType === 'field_worker') : [];
        setFieldWorkers(fieldWorkerList);
      });
    };

    fetchOrders();
    fetchCustomers();
    fetchFieldWorkers();
  }, []);

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

  const rowsWithCustomerNames = rows.map(order => {
    const customer = customers.find(cust => cust.email === order.customerEmail);
    return {
      ...order,
      customerName: customer ? customer.name : 'Unknown Customer'
    };
  });

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

  const handleDownloadAllFiles = async (orderId) => {
    const files = rows.find(row => row.id === orderId)?.files || [];
    for (const file of files) {
      await handleFileDownload(file);
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
            icon = <PictureAsPdfIcon />;
          } else if (lowerCaseFile.endsWith('.jpg') || lowerCaseFile.endsWith('.png') || lowerCaseFile.endsWith('.jpeg')) {
            icon = <ImageIcon sx={{ color: 'white', fontSize: 20 }} />;
          } else if (lowerCaseFile.endsWith('.mp4')) {
            icon = <VideoLibraryIcon />;
          } else {
            icon = <CloudDownloadIcon sx={{ color: 'white' }} />;
          }

          return (
            <IconButton
              key={file.name}
              onClick={() => handleFileDownload(file)}
            >
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
      flex: 1,
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
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "employeeFieldName",
      headerName: "Field Employee",
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "fieldStatus",
      headerName: "Field Status",
      flex: 1,
      renderCell: (params) => (
        <Box sx={statusStyle(params.value)}>
          <StatusButton initialStatus={params.value} type="fieldStatus" orderId={params.row.id} />
        </Box>
      ),
      editable: false,
    },
    {
      field: "officeStatus",
      headerName: "Office Status",
      flex: 1,
      renderCell: (params) => (
        <Box sx={statusStyle(params.value)}>
          <StatusButton initialStatus={params.value} type="officeStatus" orderId={params.row.id} />
        </Box>
      ),
      editable: false,
    },
    {
      field: "files",
      headerName: "Files",
      flex: 1,
      renderCell: renderFileIcons,
    },
    {
      field: "comments",
      headerName: "Comments",
      flex: 1,
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
            <CommentIcon />
          </IconButton>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'center', gap: 0 }}>
          <IconButton onClick={() => handleDownloadAllFiles(params.row.id)} color="primary">
            <CloudDownloadIcon sx={{ color: 'white' }} />
          </IconButton>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box m="20px">
      <Header title="Completed Orders" subtitle="List of successfully completed orders" />
      <Box mt="20px" height="75vh">
        <DataGrid
          rows={rowsWithCustomerNames}
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
