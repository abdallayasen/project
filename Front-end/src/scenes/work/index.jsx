import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Typography, Checkbox, MenuItem, Select, Button
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ref as dbRef, onValue, update, remove } from 'firebase/database';
import {
  ref as storageRef, uploadBytes, getDownloadURL, listAll
} from 'firebase/storage';
import { db, storage } from '../../firebase';
import { getAuth } from "firebase/auth";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DownloadIcon from '@mui/icons-material/Download';
import { UserContext } from "../../context/UserContext";
import StatusButton from '../../components/StatusButton';
import Comments from '../../scenes/comments';
import Badge from '@mui/material/Badge';

const Work = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);  // Holds the rows to display in the table
  const { user } = useContext(UserContext);  // User context to get the current logged-in user
  const [customers, setCustomers] = useState([]);  // List of customers fetched from the database
  const [fieldWorkers, setFieldWorkers] = useState([]);  // List of field workers fetched from the database
  const [editRowsModel, setEditRowsModel] = useState({});  // State to manage row editing
  const [snackbarOpen, setSnackbarOpen] = useState(false);  // Snackbar state to show notifications
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);  // Dialog for editing rows
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);  // Dialog for deleting rows
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);  // Dialog for showing comments
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);  // Confirmation dialog for actions

  const [pendingRow, setPendingRow] = useState(null);  // Temporary state for the row being edited
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);  // Temporary state for the row being deleted
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);  // State for pending status updates
  const [refundedStatus, setRefundedStatus] = useState(null);  // Holds the refunded status of the row
  const [selectedOrder, setSelectedOrder] = useState(null);  // The selected order for comments
  const [postCounts, setPostCounts] = useState({}); // Holds the post counts for each order

  useEffect(() => {
    // Function to fetch orders and their associated files
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
                  ...data[key],
                };
              })
            )
          : [];
  
        // Filter out completed orders before setting rows
        const activeOrders = orderList.filter((order) => !order.isCompleted);
        setRows(activeOrders); // Only show active orders (not completed)
      });
    };
  
    // Function to fetch customer data
    const fetchCustomers = () => {
      const customersRef = dbRef(db, 'customers/');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        const customerList = data ? Object.values(data) : [];
        setCustomers(customerList);
      });
    };
  
    // Function to fetch field worker data
    const fetchFieldWorkers = () => {
      const usersRef = dbRef(db, 'users/');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const fieldWorkerList = data ? Object.values(data).filter(user => user.userType === 'field_worker') : [];
        setFieldWorkers(fieldWorkerList);
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
              counts[orderPrivateNumber] = (counts[orderPrivateNumber] || 0) + 1;
            }
          });
        }
        setPostCounts(counts);
      });
    };
  
    // Call all the fetch functions
    fetchOrders();
    fetchCustomers();
    fetchFieldWorkers();
    fetchPostCounts(); // Add this to ensure the post count data is fetched as well
  }, []);

  

  // Function to fetch files from Firebase Storage based on order ID
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

  // Map orders with customer names
  const rowsWithCustomerNames = rows.map(order => {
    const customer = customers.find(cust => cust.email === order.customerEmail);
    return {
      ...order,
      customerName: customer ? customer.name : 'Unknown Customer'
    };
  });

  // Function to determine if a user is responsible for an order
  const isUserResponsible = (row) => {
    // Allow office employees and managers to edit their respective orders
    if (user.userType === 'manager') return true;
    return (
      (user.userType === 'employee_office' && row.employeeOfficeName === user.name) || 
      (user.userType === 'field_worker' && row.employeeFieldName === user.name)
    );
  };

  const getRowClass = (row) => {
    // Only apply the non-editable class to rows where the office employee's name is different
    if (user.userType === 'employee_office' && row.employeeOfficeName !== user.name && row.employeeOfficeName) {
      return 'white-shadow';
    }
    return ''; // No additional class is needed, so return an empty string
  };

  // Function to update order status
  const updateOrderStatus = (orderId, type, newStatus) => {
    if (newStatus === "Success") {
      const currentRow = rows.find((row) => row.id === orderId);
      const previousStatus = currentRow ? currentRow[type] : "Refunded";

      setRefundedStatus(previousStatus);
      setPendingStatusUpdate({ orderId, type, newStatus });
      setConfirmationDialogOpen(true);
    } else {
      const orderRef = dbRef(db, `orders/${orderId}`);
      update(orderRef, { [type]: newStatus }).then(() => {
        setRows((prevRows) =>
          prevRows.map((row) => (row.id === orderId ? { ...row, [type]: newStatus } : row))
        );
        setSnackbarMessage(`Order ${orderId} ${type} updated to ${newStatus}`);
        setSnackbarOpen(true);
      }).catch((error) => {
        setSnackbarMessage(`Failed to update order ${orderId}: ${error.message}`);
        setSnackbarOpen(true);
      });
    }
  };

  // Confirm the status update for an order
  const handleConfirmStatusUpdate = () => {
    if (pendingStatusUpdate) {
      const { orderId, type, newStatus } = pendingStatusUpdate;
      const orderRef = dbRef(db, `orders/${orderId}`);
      
      update(orderRef, { [type]: newStatus }).then(() => {
        setRows((prevRows) =>
          prevRows.map((row) => (row.id === orderId ? { ...row, [type]: newStatus } : row))
        );
        setSnackbarMessage(`Order ${orderId} ${type} updated to ${newStatus}`);
        setSnackbarOpen(true);
        setConfirmationDialogOpen(false);
        setPendingStatusUpdate(null);
      }).catch((error) => {
        setSnackbarMessage(`Failed to update order ${orderId}: ${error.message}`);
        setSnackbarOpen(true);
      });
    }
  };

  // Cancel the pending status update
  const handleCancelStatusUpdate = () => {
    if (pendingStatusUpdate) {
      const { orderId, type } = pendingStatusUpdate;
      const orderRef = dbRef(db, `orders/${orderId}`);
      
      update(orderRef, { [type]: refundedStatus || "Refunded" })
        .then(() => {
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === orderId ? { ...row, [type]: refundedStatus || "Refunded" } : row
            )
          );
          setSnackbarMessage(`Order ${orderId} ${type} reverted to ${refundedStatus || "Refunded"}`);
          setSnackbarOpen(true);
          setConfirmationDialogOpen(false);
          setPendingStatusUpdate(null);
        })
        .catch((error) => {
          setSnackbarMessage(`Failed to revert order ${orderId}: ${error.message}`);
          setSnackbarOpen(true);
        });
    }
  };

  // Function to close the snackbar notification
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleEditRowsModelChange = (model) => {
    setEditRowsModel(model);
  };

  // Edit row dialog functions
  const handleEditDialogOpen = (row) => {
    setPendingRow(row);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setPendingRow(null);
  };

  // Delete row dialog functions
  const handleDeleteDialogOpen = (row) => {
    setPendingDeleteRow(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPendingDeleteRow(null);
  };

  // Comments dialog functions
  const handleCommentsDialogOpen = (row) => {
    setSelectedOrder(row);
    setCommentsDialogOpen(true);
  };

  const handleCommentsDialogClose = () => {
    setCommentsDialogOpen(false);
    setSelectedOrder(null);
  };

  // Confirm the edit of a row
  const handleConfirmEdit = () => {
    const newRow = pendingRow;
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    setSnackbarMessage('Row updated successfully');
    setSnackbarOpen(true);
    handleEditDialogClose();
  };

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
      const activeOrders = orderList.filter((order) => !order.isCompleted); // Filter out completed orders
      setRows(activeOrders);
    });
  };

  
  // Process row updates
  const handleProcessRowUpdate = (newRow) => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    return newRow;
  };

  // Confirm the deletion of a row
  const handleConfirmDelete = () => {
    const orderId = pendingDeleteRow.id;
    const orderRef = dbRef(db, `orders/${orderId}`);
    remove(orderRef).then(() => {
      setRows((prevRows) => prevRows.filter((row) => row.id !== orderId));
      setSnackbarMessage('Row deleted successfully');
      setSnackbarOpen(true);
      handleDeleteDialogClose();
    }).catch((error) => {
      setSnackbarMessage(`Failed to delete order ${orderId}: ${error.message}`);
      setSnackbarOpen(true);
    });
  };

  // Delete row handler
  const handleDeleteRow = (row) => {
    handleDeleteDialogOpen(row);
  };

  const handleOfficeCheckboxChange = async (orderId) => {
    if (user.userType === 'employee_office') {
      const orderRef = dbRef(db, `orders/${orderId}`);
      await update(orderRef, { employeeOfficeName: user.name });
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === orderId ? { ...row, employeeOfficeName: user.name } : row
        )
      );
    }
  };

  const handleFieldWorkerChange = async (orderId, fieldWorkerName) => {
    const orderRef = dbRef(db, `orders/${orderId}`);
    await update(orderRef, { employeeFieldName: fieldWorkerName });
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === orderId ? { ...row, employeeFieldName: fieldWorkerName } : row
      )
    );
  };

  const handleFileUpload = async (orderId, event) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User is not authenticated. Please log in to upload files.");
      setSnackbarMessage("User is not authenticated. Please log in to upload files.");
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
              ? { ...row, files: [...(row.files || []), { name: file.name, url }] }
              : row
          )
        );
        setSnackbarMessage("File uploaded successfully.");
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage("Upload failed: " + error.message);
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
      setSnackbarMessage("Download failed: " + error.message);
      setSnackbarOpen(true);
    }
  };

  const handleDownloadAllFiles = async (orderId) => {
    const files = rows.find(row => row.id === orderId)?.files || [];
    if (files.length === 0) {
      setSnackbarMessage("No files to download.");
      setSnackbarOpen(true);
      return;
    }
  
    for (const file of files) {
      try {
        const response = await fetch(file.url); // Fetch the file from the URL
        const blob = await response.blob(); // Convert response to blob
        const link = document.createElement('a'); // Create a link element
        link.href = URL.createObjectURL(blob); // Create object URL from blob
        link.download = file.name; // Set the download attribute with file name
        link.click(); // Programmatically click the link to trigger download
      } catch (error) {
        console.error(`Error downloading file ${file.name}:`, error);
        setSnackbarMessage(`Failed to download ${file.name}`);
        setSnackbarOpen(true);
      }
    }
  };
  

  // Render file icons in the table
  const renderFileIcons = (params) => {
    const files = params.row.files || [];
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {files.map((file) => {
          let icon;
          const lowerCaseFile = file.name.toLowerCase();
          if (lowerCaseFile.endsWith('.pdf')) {
            icon = <PictureAsPdfIcon sx={{ color: 'red' }} />;
          } else if (lowerCaseFile.endsWith('.jpg') || lowerCaseFile.endsWith('.png') || lowerCaseFile.endsWith('.jpeg') || lowerCaseFile.endsWith('.JPG')) {
            icon = <ImageIcon sx={{ color: 'red', fontSize: 20 }} />;
          } else if (lowerCaseFile.endsWith('.mp4')) {
            icon = <VideoLibraryIcon  sx={{ color: 'primary' }}/>;
          } else {
            icon = <TextSnippetIcon  sx={{ color: 'primary' }}/>;
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
      editable: (params) => isUserResponsible(params.row),
    },
    {
      field: "orderType",
      headerName: "Order Type",
      flex: 1,
      editable: (params) => isUserResponsible(params.row),
    },
    {
      field: "employeeOfficeName",
      headerName: "Office Employee",
      flex: 1,
      renderCell: (params) => {
        if (params.value) {
          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {params.value}
            </Typography>
          );
        }
        return (
          <Checkbox
            onChange={() => handleOfficeCheckboxChange(params.row.id)}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
            disabled={user.userType !== 'employee_office'}
          />
        );
      },
    },
    {
      field: "employeeFieldName",
      headerName: "Field Employee",
      flex: 1,
      renderCell: (params) => {
        // Only allow manager to edit this field
        if (user.userType === 'manager') {
          return (
            <Select
              value={params.value || ''}
              onChange={(e) => handleFieldWorkerChange(params.row.id, e.target.value)}
              displayEmpty
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
            >
              <MenuItem value="" disabled>Select Field Worker</MenuItem>
              {fieldWorkers.map((worker) => (
                <MenuItem key={worker.name} value={worker.name}>
                  {worker.name}
                </MenuItem>
              ))}
            </Select>
          );
        }
        // For other user types, just display the value
        return (
          <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {params.value || 'Not Assigned'}
          </Typography>
        );
      },
    },
    
    {
      field: "fieldStatus",
      headerName: "Field Status",
      flex: 1,
      renderCell: (params) => (
        <Box sx={statusStyle(params.value)}>
          <StatusButton
            initialStatus={params.value}
            type="fieldStatus"
            orderId={params.row.id}
            updateOrderStatus={updateOrderStatus}
            disabled={!isUserResponsible(params.row)}
          />
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
          <StatusButton
            initialStatus={params.value}
            type="officeStatus"
            orderId={params.row.id}
            updateOrderStatus={updateOrderStatus}
            disabled={!isUserResponsible(params.row)}
          />
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
      headerName: "Posts",
      flex: 1,
      renderCell: (params) => (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%' ,
            color:"green"
          }}
        >
          <Badge
            badgeContent={postCounts[params.row.orderPrivateNumber] || 0} // Ensure post count is displayed
            color="error"
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <IconButton onClick={() => handleCommentsDialogOpen(params.row)}>
              <CommentIcon sx={{ color: colors.grey[100]}}/>
            </IconButton>
          </Badge>
        </Box>
      ),
      sortable: false,
      filterable: false,
    }
    
    


    ,
    {
      
        field: "action",
        headerName: "Action",
        flex: 1,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'center', gap: 0 }}>
            {/* Delete Button */}
            <IconButton
              onClick={() => handleDeleteRow(params.row)}
              color="warning"
              disabled={user.userType === 'field_worker'}
            >
              <DeleteIcon />
            </IconButton>
            
            {/* Upload Button */}
            <IconButton component="label" color="primary" disabled={!isUserResponsible(params.row)}>
              <CloudUploadIcon sx={{ color: colors.grey[100] }} />
              <input
                type="file"
                hidden
                onChange={(event) => handleFileUpload(params.row.id, event)}
              />
            </IconButton>
            
            {/* Download All Files Button */}
            <IconButton onClick={() => handleDownloadAllFiles(params.row.id)} color="primary">
              <DownloadIcon sx={{ color: colors.grey[100] }} />
            </IconButton>
          </Box>
        ),
        sortable: false,
        filterable: false,
      
      
    }
    ,
  ];

  return (
    <Box 
   
  >
    <Header
      title="Work Management"
      subtitle="List of work status and observation"
    />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
          "& .white-shadow": {
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            pointerEvents: 'none',
            opacity: 0.6,
          },
        }}
      >
        <DataGrid
          rows={rowsWithCustomerNames}
          columns={columns}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={handleEditRowsModelChange}
          processRowUpdate={handleProcessRowUpdate}
          getRowClassName={(params) => getRowClass(params.row)}
          slots={{ toolbar: GridToolbar }}
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
        open={editDialogOpen}
        onClose={handleEditDialogClose}
      >
        <DialogTitle>Confirm Edit</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save the changes?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} sx={{ backgroundColor: colors.greenAccent[400] }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmEdit} sx={{ backgroundColor: colors.greenAccent[400] }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the row?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} sx={{ backgroundColor: colors.greenAccent[400] }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} sx={{ backgroundColor: colors.greenAccent[400] }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmationDialogOpen}
        onClose={handleCancelStatusUpdate}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update the status to "Success"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusUpdate} sx={{ backgroundColor: colors.greenAccent[400] }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmStatusUpdate} sx={{ backgroundColor: colors.greenAccent[400] }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={commentsDialogOpen}
        onClose={handleCommentsDialogClose}
        maxWidth="md"
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
          {selectedOrder && <Comments orderPrivateNumber={selectedOrder.orderPrivateNumber} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommentsDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Work;
