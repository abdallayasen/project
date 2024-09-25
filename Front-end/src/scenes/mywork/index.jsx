// src/scenes/mywork/index.js

import React, { useState, useEffect, useContext } from 'react';
import {Box,Snackbar,Alert,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,Typography,MenuItem,Select,Button,Badge,Tooltip,} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ref as dbRef, onValue, update, remove } from 'firebase/database';
import {ref as storageRef,uploadBytes,getDownloadURL,listAll,} from 'firebase/storage';
import { db, storage } from '../../firebase';
import { getAuth } from 'firebase/auth';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DescriptionIcon from '@mui/icons-material/Description';
import { UserContext } from '../../context/UserContext';
import StatusButton from '../../components/StatusButton';
import Comments from '../../scenes/comments';

const MyWork = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderChecklist, setOrderChecklist] = useState([]);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [postCounts, setPostCounts] = useState({});
  const statusColors = {
    "Assigned": "grey",
    "Processing": "#19b8ba", // Updated color
    "Revision": "#f58c0e",
    "Success": "#2c8826",    // Updated color
  };
  
  useEffect(() => {
    const fetchOrders = async () => {
      const ordersRef = dbRef(db, 'orders/');
      onValue(ordersRef, async (snapshot) => {
        const data = snapshot.val();
        const orderList = data
          ? await Promise.all(
              Object.keys(data).map(async (key, index) => {
                const fileList = await fetchFilesFromStorage(key);
                return {
                  id: key,
                  serialNumber: index + 1,
                  files: fileList,
                  fieldStatus: data[key].fieldStatus || 'Not Assigned',
                  officeStatus: data[key].officeStatus || 'Not Assigned',
                  ...data[key],
                };
              })
            )
          : [];

        // Filter orders based on user type
        const filteredOrders = orderList.filter((order) => {
          if (user.userType === 'manager') {
            // For manager, show all active orders
            return !order.isCompleted;
          }
          // For other user types, show orders assigned to them
          return (
            !order.isCompleted &&
            ((user.userType === 'employee_office' &&
              order.employeeOfficeName === user.name) ||
              (user.userType === 'field_worker' &&
                order.employeeFieldName === user.name))
          );
        });

        // Update statuses based on employee assignments
        const updatedOrders = filteredOrders.map((order) => {
          let updatedOrder = { ...order };

          if (!order.employeeFieldName) {
            updatedOrder.fieldStatus = 'Not Assigned';
          } else if (order.fieldStatus === 'Not Assigned') {
            updatedOrder.fieldStatus = 'Assigned';
          }

          if (!order.employeeOfficeName) {
            updatedOrder.officeStatus = 'Not Assigned';
          } else if (order.officeStatus === 'Not Assigned') {
            updatedOrder.officeStatus = 'Assigned';
          }

          return updatedOrder;
        });

        setRows(updatedOrders);
        setOrderChecklist(
          updatedOrders.map((order) => order.orderPrivateNumber)
        );
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

    // Function to fetch post counts for each order (for displaying in the badge)
    const fetchPostCounts = async () => {
      const postsRef = dbRef(db, 'posts');
      onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        const counts = {};
        if (data) {
          Object.keys(data).forEach((postId) => {
            const post = data[postId];
            const orderPrivateNumber = post.orderPrivateNumber;
            if (orderPrivateNumber) {
              counts[orderPrivateNumber] =
                (counts[orderPrivateNumber] || 0) + 1;
            }
          });
        }
        setPostCounts(counts);
      });
    };

    fetchOrders();
    fetchCustomers();
    fetchPostCounts(); // Fetch the post counts for the badge
  }, [user.name, user.userType]);

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
      console.error('Error fetching files from storage:', error);
    }
    return fileList;
  };

  const rowsWithCustomerNames = rows.map((order) => {
    const customer = customers.find(
      (cust) => cust.email === order.customerEmail
    );
    return {
      ...order,
      customerName: customer ? customer.name : 'Unknown Customer',
    };
  });

  const handleConfirmOrderCompletion = () => {
    if (selectedOrder) {
      const orderId = selectedOrder.id;
      const orderRef = dbRef(db, `orders/${orderId}`);
      update(orderRef, {
        isCompleted: true,
        markerColor: 'green', // Update marker color to green
      })
        .then(() => {
          setRows((prevRows) =>
            prevRows.filter((row) => row.id !== orderId)
          ); // Remove from My Work page
          setSnackbarMessage(
            `Order ${orderId} successfully completed and moved.`
          );
          setSnackbarOpen(true);
          setConfirmationDialogOpen(false);
        })
        .catch((error) => {
          setSnackbarMessage(
            `Failed to complete order ${orderId}: ${error.message}`
          );
          setSnackbarOpen(true);
        });
    }
  };

  const updateOrderStatus = (orderId, type, newStatus) => {
    const orderRef = dbRef(db, `orders/${orderId}`);
    update(orderRef, { [type]: newStatus })
      .then(() => {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === orderId ? { ...row, [type]: newStatus } : row
          )
        );
        setSnackbarMessage(`Order ${orderId} ${type} updated to ${newStatus}`);
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(`Failed to update order ${orderId}: ${error.message}`);
        setSnackbarOpen(true);
      });
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

  const handleDeleteRow = (row) => {
    const orderId = row.id;
    const orderRef = dbRef(db, `orders/${orderId}`);
    remove(orderRef)
      .then(() => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== orderId));
        setSnackbarMessage('Order deleted successfully');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(
          `Failed to delete order ${orderId}: ${error.message}`
        );
        setSnackbarOpen(true);
      });
  };

  const handleProcessRowUpdate = (newRow) => {
    const updatedRows = rows.map((row) =>
      row.id === newRow.id ? newRow : row
    );
    setRows(updatedRows);
    return newRow;
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
              <PictureAsPdfIcon sx={{ color: 'red' }} />
            );
          } else if (
            lowerCaseFile.endsWith('.jpg') ||
            lowerCaseFile.endsWith('.png') ||
            lowerCaseFile.endsWith('.jpeg')
          ) {
            icon = <ImageIcon sx={{ color: 'green', fontSize: 20 }} />;
          } else if (lowerCaseFile.endsWith('.mp4')) {
            icon = (
              <VideoLibraryIcon sx={{ color: 'blue' }} />
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

  // Function to determine if a user is responsible for an order
  const isUserResponsible = (row) => {
    if (user.userType === 'manager') return true;
    return (
      (user.userType === 'employee_office' &&
        row.employeeOfficeName === user.name) ||
      (user.userType === 'field_worker' &&
        row.employeeFieldName === user.name)
    );
  };

  const columns = [
    { field: 'serialNumber', headerName: 'Serial Number', flex: 0.5 },
    {
      field: 'customerName',
      headerName: 'Customer Name',
      flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'orderPrivateNumber',
      headerName: 'Order Private Number',
      flex: 2,
    },
    {
      field: 'describeOrder',
      headerName: 'Order Description',
      flex: 1,
    },
    {
      field: 'orderType',
      headerName: 'Order Type',
      flex: 1,
    },
    {
      field: 'employeeOfficeName',
      headerName: 'Office Employee',
      flex: 4,
    },
    {
      field: 'employeeFieldName',
      headerName: 'Field Employee',
      flex: 4,
    },
    {
      field: "fieldStatus",
      headerName: "Field Status",
      flex: 4.5,
      renderCell: (params) => {
        
        // Determine if the user is allowed to change the status
        const isAssignedFieldWorker =
          user.userType === 'field_worker' &&
          params.row.employeeFieldName === user.name;
    
        const isManager = user.userType === 'manager';
    
        // The button is disabled if the user is neither the assigned field worker nor a manager
        const isDisabled = !(isAssignedFieldWorker || isManager);
    
        const statusColors = {
          "Assigned": "grey",
          "Processing": "#19b8ba", // Updated color
          "Revision": "#f58c0e",
          "Success": "#2c8826",    // Updated color
        };
    
        // Define the statuses available to the user
        let statusOptions = [];
    
        if (isManager) {
          // Managers can set 'Revision' and 'Success'
          statusOptions = ['Revision', 'Success'];
        } else if (isAssignedFieldWorker) {
          // Assigned field workers can set 'Assigned', 'Processing', 'Success'
          statusOptions = ['Assigned', 'Processing', 'Success'];
        } else {
          // Other users cannot change the status
          statusOptions = [];
        }
    
        const handleClick = () => {
          if (isDisabled) return;
    
          const currentStatus = params.value;
          const currentIndex = statusOptions.indexOf(currentStatus);
          const nextIndex = (currentIndex + 1) % statusOptions.length;
          const newStatus = statusOptions[nextIndex];
    
          // Prevent field workers from setting the status to 'Revision'
          if (newStatus === 'Revision' && !isManager) {
            setSnackbarMessage('Only managers can set the status to "Revision".');
            setSnackbarOpen(true);
            return;
          }
    
          // Update the status in the database and in the state
          updateOrderStatus(params.row.id, 'fieldStatus', newStatus);
        };
    
        return (
          <Button
            variant="contained"
            sx={{
              backgroundColor: statusColors[params.value] || 'grey',
              color: 'white',
              textTransform: 'none',
              fontSize: '12px',
              padding: '6px 12px',
              minWidth: '100px',
              borderRadius: '9999px',
            }}
            onClick={handleClick}
            disabled={isDisabled || statusOptions.length === 0}
          >
            {params.value}
          </Button>
        );
      },
    },
    
    
    {
      field: "officeStatus",
      headerName: "Office Status",
      flex: 4.5,
      renderCell: (params) => {
        // Determine if the user is allowed to change the status
        const isAssignedOfficeEmployee =
          user.userType === 'employee_office' &&
          params.row.employeeOfficeName === user.name;
    
        const isManager = user.userType === 'manager';
    
        // The button is disabled if the user is neither the assigned office employee nor a manager
        const isDisabled = !(isAssignedOfficeEmployee || isManager);
    
        const statusColors = {
          "Assigned": "grey",
          "Processing": "#19b8ba", // Updated color
          "Revision": "#f58c0e",
          "Success": "#2c8826",    // Updated color
        };
    
        // Define the statuses available to the user
        let statusOptions = [];
    
        if (isManager) {
          // Managers can set 'Revision' and 'Success'
          statusOptions = ['Revision', 'Success'];
        } else if (isAssignedOfficeEmployee) {
          // Assigned office employees can set 'Assigned', 'Processing', 'Success'
          statusOptions = ['Assigned', 'Processing', 'Success'];
        } else {
          // Other users cannot change the status
          statusOptions = [];
        }
    
        const handleClick = () => {
          if (isDisabled) return;
    
          const currentStatus = params.value;
          const currentIndex = statusOptions.indexOf(currentStatus);
          const nextIndex = (currentIndex + 1) % statusOptions.length;
          const newStatus = statusOptions[nextIndex];
    
          // Prevent office employees from setting the status to 'Revision'
          if (newStatus === 'Revision' && !isManager) {
            setSnackbarMessage('Only managers can set the status to "Revision".');
            setSnackbarOpen(true);
            return;
          }
    
          // Update the status in the database and in the state
          updateOrderStatus(params.row.id, 'officeStatus', newStatus);
        };
    
        return (
          <Button
            variant="contained"
            sx={{
              backgroundColor: statusColors[params.value] || 'grey',
              color: 'white',
              textTransform: 'none',
              fontSize: '12px',
              padding: '6px 12px',
              minWidth: '100px',
              borderRadius: '9999px', // For curved shape
            }}
            onClick={handleClick}
            disabled={isDisabled || statusOptions.length === 0}
          >
            {params.value}
          </Button>
        );
      },
    },
    
    
    {
      field: 'files',
      headerName: 'Files',
      flex: 8,
      renderCell: renderFileIcons,
    },
    {
      field: 'comments',
      headerName: 'Posts',
      flex: 2,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'green',
          }}
        >
          <Badge
            badgeContent={postCounts[params.row.orderPrivateNumber] || 0}
            color='error'
            overlap='circular'
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <IconButton onClick={() => handleCommentsDialogOpen(params.row)}>
              <CommentIcon sx={{ color: colors.grey[100] }} />
            </IconButton>
          </Badge>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 7,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {/* Delete Button */}
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <IconButton
              onClick={() => handleDeleteRow(params.row)}
              color='warning'
              disabled={
                user.userType === 'field_worker' ||
                user.userType === 'employee_office'
              }
            >
              <DeleteIcon />
            </IconButton>
            <Typography variant='caption'>Delete</Typography>
          </Box>

          {/* Upload Button */}
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <IconButton
              component='label'
              color='primary'
              disabled={!isUserResponsible(params.row)}
            >
              <CloudUploadIcon sx={{ color: colors.grey[100] }} />
              <input
                type='file'
                hidden
                onChange={(event) => handleFileUpload(params.row.id, event)}
              />
            </IconButton>
            <Typography variant='caption'>Upload</Typography>
          </Box>

          {/* Download All Files Button */}
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <IconButton onClick={() => handleDownloadAllFiles(params.row.id)} color='primary'>
              <DownloadIcon sx={{ color: colors.grey[100]}} />
            </IconButton>
            <Typography variant='caption'>Download All</Typography>
          </Box>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const handleDownloadAllFiles = async (orderId) => {
    const files = rows.find((row) => row.id === orderId)?.files || [];
    for (const file of files) {
      await handleFileDownload(file);
    }
  };

  const handleFileUpload = async (orderId, event) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSnackbarMessage(
        'User is not authenticated. Please log in to upload files.'
      );
      setSnackbarOpen(true);
      return;
    }

    const file = event.target.files[0];
    if (file) {
      const fileStorageRef = storageRef(storage, `orders/${orderId}/${file.name}`);
      try {
        await uploadBytes(fileStorageRef, file);
        const url = await getDownloadURL(fileStorageRef);
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === orderId
              ? {
                  ...row,
                  files: [...(row.files || []), { name: file.name, url }],
                }
              : row
          )
        );
        setSnackbarMessage('File uploaded successfully.');
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage('Upload failed: ' + error.message);
        setSnackbarOpen(true);
      }
    }
  };

  const handleFileDownload = async (file) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    } catch (error) {
      setSnackbarMessage('Download failed: ' + error.message);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box m='20px'>
      <Header title='My Work' subtitle='List of works assigned to you' />

      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        mt={2}
        mb={2}
      >
        {user.userType === 'manager' && (
          <>
            <Typography>Checklist of Completed Orders:</Typography>
            <Select
              value={selectedOrder ? selectedOrder.orderPrivateNumber : ''}
              onChange={(e) => {
                const selected = rows.find(
                  (order) => order.orderPrivateNumber === e.target.value
                );
                setSelectedOrder(selected);
              }}
              displayEmpty
              sx={{ ml: 2 }}
            >
              <MenuItem value='' disabled>
                Select an Order
              </MenuItem>
              {orderChecklist.map((orderPrivateNumber) => (
                <MenuItem key={orderPrivateNumber} value={orderPrivateNumber}>
                  {orderPrivateNumber}
                </MenuItem>
              ))}
            </Select>
            <Button
              sx={{ ml: 2, backgroundColor: colors.greenAccent[500] }}
              onClick={() => setConfirmationDialogOpen(true)}
              disabled={!selectedOrder}
            >

            <Typography
              sx={{
                color: colors.grey[100], // Change text color
                textTransform: 'none', // Prevent uppercase transformation
              }}
            >
              Confirm Completion
            </Typography>
              
            </Button>
          </>
        )}
      </Box>

      <Box
        m='40px 0 0 0'
        height='75vh'
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
          '& .name-column--cell': {
            color: colors.greenAccent[300],
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: colors.blueAccent[700],
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: colors.primary[400],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: colors.blueAccent[700],
          },
          '& .MuiCheckbox-root': {
            color: `${colors.greenAccent[200]} !important`,
          },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rowsWithCustomerNames}
          columns={columns}
          editRowsModel={{}}
          onEditRowsModelChange={() => {}}
          processRowUpdate={handleProcessRowUpdate}
          slots={{ toolbar: GridToolbar }}
          getRowId={(row) => row.id}
        />
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity='success'
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmationDialogOpen}
        onClose={() => setConfirmationDialogOpen(false)}
      >
        <DialogTitle>Confirm Order Completion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark the order as completed and move it to
            the All Work page?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmationDialogOpen(false)}
            sx={{ backgroundColor: colors.greenAccent[400] }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmOrderCompletion}
            sx={{ backgroundColor: colors.greenAccent[400] }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={commentsDialogOpen}
        onClose={() => setCommentsDialogOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#04042c',
            color: '#ffffff',
            overflowY: 'auto',
          },
        }}
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent
          sx={{
            overflowY: 'auto',
            maxHeight: '70vh',
          }}
        >
          {selectedOrder && (
            <Comments orderPrivateNumber={selectedOrder.orderPrivateNumber} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentsDialogOpen(false)} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyWork;
