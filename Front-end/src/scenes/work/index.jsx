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
import Comments from '../../scenes/comments';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

import DescriptionIcon from '@mui/icons-material/Description';
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
  const [officeEmployees, setOfficeEmployees] = useState([]); // List of office employees
  const [alertOpen, setAlertOpen] = useState(false);
// Add this at the top of your component
const statusOptions = ["Assigned", "Processing", "Revision", "Success"];
const newOrder = {
  // ... other properties
  fieldStatus: 'Not Assigned',
  officeStatus: 'Not Assigned',
};
const statusColors = {
  "Not Assigned": "#ff0000",
  "Assigned": "#2b62d8",
  "Processing": "#19b8ba", // Updated color
  "Revision": "#f58c0e",
  "Success": "#2c8826",    // Updated color
};

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
        const updatedOrders = activeOrders.map((order) => {
          let updatedOrder = { ...order };
        
          if (!order.employeeFieldName) {
            updatedOrder.fieldStatus = "Not Assigned";
          } else if (order.fieldStatus === "Not Assigned") {
            updatedOrder.fieldStatus = "Assigned";
          }
        
          if (!order.employeeOfficeName) {
            updatedOrder.officeStatus = "Not Assigned";
          } else if (order.officeStatus === "Not Assigned") {
            updatedOrder.officeStatus = "Assigned";
          }
        
          return updatedOrder;
        });
        
        setRows(updatedOrders);
        
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

  
  const handleOfficeChange = async (orderId, selectedOfficeName) => {
    const orderRef = dbRef(db, `orders/${orderId}`);
  
    const currentRow = rows.find((row) => row.id === orderId);
  
    if (!currentRow) {
      console.error(`Order with ID ${orderId} not found in rows`);
      return;
    }
  
    let currentStatus = currentRow.officeStatus || "Not Assigned";
    let newStatus = currentStatus;
  
    if (selectedOfficeName) {
      if (currentStatus === "Not Assigned") {
        newStatus = "Assigned";
      } else {
        // Keep the current status if it's beyond "Assigned"
        newStatus = currentStatus;
      }
    } else {
      newStatus = "Not Assigned";
    }
  
    // Ensure newStatus is defined
    if (typeof newStatus === 'undefined') {
      console.error('newStatus is undefined');
      newStatus = "Not Assigned";
    }
  
    await update(orderRef, {
      employeeOfficeName: selectedOfficeName || null,
      officeStatus: newStatus,
    });
  
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === orderId
          ? {
              ...row,
              employeeOfficeName: selectedOfficeName || null,
              officeStatus: newStatus,
            }
          : row
      )
    );
  };
  
  
  
  
  
  
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

  const updateOrderStatus = (orderId, type, newStatus) => {
    const orderRef = dbRef(db, `orders/${orderId}`);
    if (newStatus === "Revision" && user.userType !== "manager") {
      setSnackbarMessage(`Only managers can set the status to "Revision".`);
      setSnackbarOpen(true);
      return;
    }
    update(orderRef, { [type]: newStatus })
      .then(() => {
        setRows((prevRows) =>
          prevRows.map((row) => (row.id === orderId ? { ...row, [type]: newStatus } : row))
        );
        setSnackbarMessage(`Order ${orderId} ${type} updated to ${newStatus}`);
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(`Failed to update order ${orderId}: ${error.message}`);
        setSnackbarOpen(true);
      });
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

  const StatusButton = ({
    initialStatus,
    type,
    orderId,
    updateOrderStatus,
    disabled,
    userType,
  }) => {
    const [status, setStatus] = useState(initialStatus || "Not Assigned");
  
    // Define status options based on userType
    const statusOptions = userType === "manager"
      ? ["Assigned", "Processing", "Revision", "Success"]
      : ["Assigned", "Processing", "Success"]; // Exclude "Revision" for non-managers
  
    const isDisabled = disabled || status === "Not Assigned";
  
    const handleClick = () => {
      if (isDisabled) return;
  
      const currentIndex = statusOptions.indexOf(status);
  
      // If the current status is "Revision" and the user is not a manager, disable the button
      if (status === "Revision" && userType !== "manager") {
        return;
      }
  
      const nextIndex = (currentIndex + 1) % statusOptions.length;
      const newStatus = statusOptions[nextIndex];
  
      setStatus(newStatus);
      updateOrderStatus(orderId, type, newStatus);
    };
  
    // Disable the button if the status is "Revision" and the user is not a manager
    const buttonDisabled = isDisabled || (status === "Revision" && userType !== "manager");
  
    return (
      <Button
        variant="contained"
        sx={{
          backgroundColor: statusColors[status],
          color: 'white',
          textTransform: 'none',
          fontSize: '12px',
          padding: '6px 12px',
          minWidth: '100px',
          borderRadius: '9999px',
        }}
        onClick={handleClick}
        disabled={buttonDisabled}
      >
        {status}
      </Button>
    );
  };
  
  
  
  
  

  const fetchOrders = async () => {
    const ordersRef = dbRef(db, 'orders/');
    onValue(ordersRef, async (snapshot) => {
      const data = snapshot.val();
      const orderList = data
        ? await Promise.all(
            Object.keys(data).map(async (key, index) => {
              const fileList = await fetchFilesFromStorage(key);
              const orderData = data[key];
              return {
                id: key,
                serialNumber: index + 1,
                files: fileList,
                fieldStatus: orderData.fieldStatus || "Not Assigned",
                officeStatus: orderData.officeStatus || "Not Assigned",
                ...orderData,
              };
            })
          )
        : [];
        const activeOrders = orderList.filter((order) => !order.isCompleted);

        // Update statuses based on employee assignments
        const updatedOrders = activeOrders.map(order => {
          let updatedOrder = { ...order };
        
          if (!order.employeeFieldName) {
            updatedOrder.fieldStatus = "Not Assigned";
          } else if (order.fieldStatus === "Not Assigned") {
            updatedOrder.fieldStatus = "Assigned";
          }
        
          if (!order.employeeOfficeName) {
            updatedOrder.officeStatus = "Not Assigned";
          } else if (order.officeStatus === "Not Assigned") {
            updatedOrder.officeStatus = "Assigned";
          }
        
          return updatedOrder;
        });
        
        setRows(updatedOrders);
        
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
      await update(orderRef, { employeeOfficeName: user.name }); // Update the field with the office employee's name
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === orderId ? { ...row, employeeOfficeName: user.name } : row
        )
      );
    }
  };
  

  const handleFieldWorkerChange = async (orderId, fieldWorkerName) => {
    const orderRef = dbRef(db, `orders/${orderId}`);
  
    const currentRow = rows.find((row) => row.id === orderId);
  
    if (!currentRow) {
      console.error(`Order with ID ${orderId} not found in rows`);
      return;
    }
  
    let currentStatus = currentRow.fieldStatus || "Not Assigned";
    let newStatus = currentStatus;
  
    if (fieldWorkerName) {
      if (currentStatus === "Not Assigned") {
        newStatus = "Assigned";
      } else {
        // Keep the current status if it's beyond "Assigned"
        newStatus = currentStatus;
      }
    } else {
      newStatus = "Not Assigned";
    }
  
    await update(orderRef, {
      employeeFieldName: fieldWorkerName || null,
      fieldStatus: newStatus,
    });
  
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === orderId
          ? {
              ...row,
              employeeFieldName: fieldWorkerName || null,
              fieldStatus: newStatus,
            }
          : row
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
  

  const renderFileIcons = (params) => {
    const files = params.row.files || [];
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {files.map((file) => {
          let icon;
          const lowerCaseFile = file.name.toLowerCase();
  
          if (lowerCaseFile.endsWith('.pdf')) {
            icon = <PictureAsPdfIcon sx={{ color: 'red' }} />;
          } else if (
            lowerCaseFile.endsWith('.jpg') || 
            lowerCaseFile.endsWith('.png') || 
            lowerCaseFile.endsWith('.jpeg')
          ) {
            icon = <ImageIcon sx={{ color: 'green', fontSize: 20 }} />;
          } else if (lowerCaseFile.endsWith('.mp4')) {
            icon = <VideoLibraryIcon sx={{ color: 'blue' }} />;
          } else if (lowerCaseFile.endsWith('.txt')) {
            icon = <DescriptionIcon sx={{ color: '#FFA500' }} />; // Use standard orange color
          } else {
            icon = <CloudDownloadIcon sx={{ color: colors.greenAccent[500] }} />;
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




  const handleManagerOfficeChange = async (orderId, selectedEmployee) => {
    const orderRef = dbRef(db, `orders/${orderId}`);
    await update(orderRef, { employeeOfficeName: selectedEmployee === 'not-assigned' ? null : selectedEmployee });
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === orderId ? { ...row, employeeOfficeName: selectedEmployee === 'not-assigned' ? null : selectedEmployee } : row
      )
    );
  };
  
// Function to fetch office employee data
const fetchOfficeEmployees = () => {
  const usersRef = dbRef(db, 'users/');
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    const officeEmployeeList = data ? Object.values(data).filter(user => user.userType === 'employee_office') : [];
    setOfficeEmployees(officeEmployeeList); // Set office employee list
  });
};

// Fetch office employees when the component loads
useEffect(() => {
  fetchOfficeEmployees(); // Fetch office employees
}, []);


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
      flex: 6,
      renderCell: (params) => {
        const isManager = user.userType === 'manager';
        const isOfficeEmployee = user.userType === 'employee_office'; // Determine if the user is an office employee
        const fieldStatus = params.row.fieldStatus; // Get the field status from the row
    
        if (isManager) {
          const isDisabled = fieldStatus !== "Success";
    
          return (
            <Tooltip
              title={
                isDisabled
                  ? 'Cannot assign an office employee until the field status is "Success".'
                  : ''
              }
            >
              <span>
                <Select
                  value={params.row.employeeOfficeName || ""}
                  onChange={(e) => handleOfficeChange(params.row.id, e.target.value)}
                  displayEmpty
                  sx={{ width: '100%' }}
                  disabled={isDisabled}
                >
                  <MenuItem value="" disabled>
                    Not Assigned
                  </MenuItem>
                  {officeEmployees.map((employee) => (
                    <MenuItem key={employee.name} value={employee.name}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </span>
            </Tooltip>
          );
        } else if (isOfficeEmployee) { // Added block for office employees
          if (!params.value) {
            if (fieldStatus === "Success") {
              // Office employee sees checkbox if no one is assigned and fieldStatus is "Success"
              return (
                <Checkbox
                  onChange={() => handleOfficeCheckboxChange(params.row.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                  disabled={fieldStatus !== "Success"} // Disable if field status is not "Success"
                />
              );
            } else {
              // Display message if fieldStatus is not "Success"
              return (
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  Waiting for Field Completion
                </Typography>
              );
            }
          } else {
            // Display the assigned name
            return (
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                {params.value}
              </Typography>
            );
          }
        } else {
          // For other users, display the assigned name or 'Not Assigned'
          return (
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              {params.row.employeeOfficeName || 'Not Assigned'}
            </Typography>
          );
        }
      },
    },
    
    
    
    















    {
      field: "employeeFieldName",
      headerName: "Field Employee",
      flex: 6,
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
    
    // For fieldStatus
    {
      field: "fieldStatus",
      headerName: "Field Status",
      flex: 4.5,
      renderCell: (params) => {
    
        // **NEW CODE START**
        // If employeeFieldName is empty or "Not Assigned", set fieldStatus to "Not Assigned"
        if (!params.row.employeeFieldName || params.row.employeeFieldName === "Not Assigned") {
          params.row.fieldStatus = "Not Assigned";
        }
        // **NEW CODE END**
    
        // Determine if the user is allowed to change the status
        const isAssignedFieldWorker =
          user.userType === 'field_worker' &&
          params.row.employeeFieldName === user.name;
    
        const isManager = user.userType === 'manager';
    
        // The button is disabled if the user is neither the assigned field worker nor a manager
        // **MODIFIED CODE START**
        // Also disable if employeeFieldName is empty or "Not Assigned"
        const isDisabled = !(isAssignedFieldWorker || isManager) || !params.row.employeeFieldName || params.row.employeeFieldName === "Not Assigned";
        // **MODIFIED CODE END**
    
        const statusColors = {
          "Assigned": "#2b62d8",
          "Processing": "#19b8ba", // Updated color
          "Revision": "#f58c0e",
          "Success": "#2c8826",    // Updated color
          "Not Assigned": "#ff0000",   // Color for "Not Assigned"
        };
    
        // Define the statuses available to the user
        let statusOptions = [];
        if (isManager) {
          statusOptions = ['Assigned', 'Processing', 'Revision', 'Success'];
        } 
        else if (isAssignedFieldWorker) {
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
    
        // Disable button if not assigned or not manager
        const isDisabled =
          !(isAssignedOfficeEmployee || isManager) ||
          !params.row.employeeOfficeName;
    
        const statusColors = {
          "Assigned": "#2b62d8",
          "Processing": "#19b8ba", // Updated color
          "Revision": "#f58c0e",
          "Success": "#2c8826",    // Updated color
          "Not Assigned": "#ff0000",   // Color for "Not Assigned"
        };
    
        // Define the statuses available to the user
        let statusOptions = [];
    
        if (isManager) {
          statusOptions = ['Assigned', 'Processing', 'Revision', 'Success'];
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
    
        // Determine the display status
        let displayStatus = params.value;
    
        if (!params.row.employeeOfficeName) {
          displayStatus = "Not Assigned";
        } else if (params.row.employeeOfficeName && !params.row.officeStatus) {
          // If employeeOfficeName is set but officeStatus is empty, set it to "Assigned"
          displayStatus = "Assigned";
          // Note: Ideally, handle this in the assignment function to update the database
        }
    
        return (
          <Button
            variant="contained"
            sx={{
              backgroundColor: statusColors[displayStatus] || 'grey',
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
            {displayStatus}
          </Button>
        );
      },
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
      flex: 2,
      renderCell: (params) => (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
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
      // field: "action",
      // headerName: "Action",
      // flex: 7,
      // renderCell: (params) => (
      //   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      //     {/* Delete Button */}
      //     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      //       <IconButton
      //         onClick={() => handleDeleteRow(params.row)}
      //         color="warning"
      //         disabled={user.userType === 'field_worker' || user.userType === 'employee_office'}
      //       >
      //         <DeleteIcon />
      //       </IconButton>
      //       <Typography variant="caption">Delete</Typography>
      //     </Box>
    
      //     {/* Upload Button */}
      //     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      //       <IconButton component="label" color="primary" disabled={!isUserResponsible(params.row)}>
      //         <CloudUploadIcon sx={{ color: colors.grey[100] }} />
      //         <input
      //           type="file"
      //           hidden
      //           onChange={(event) => handleFileUpload(params.row.id, event)}
      //         />
      //       </IconButton>
      //       <Typography variant="caption">Upload</Typography>
      //     </Box>
    
      //     {/* Download All Files Button */}
      //     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      //       <IconButton onClick={() => handleDownloadAllFiles(params.row.id)} color="primary">
      //         <DownloadIcon sx={{ color: colors.grey[100] }} />
      //       </IconButton>
      //       <Typography variant="caption">Download All</Typography>
      //     </Box>
      //   </Box>
      // ),
      // sortable: false,
      // filterable: false,

      field: "action",
      headerName: "Action",
      flex: 7,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1 }}>
          {/* Delete Button */}
          {!(user.userType === 'field_worker' || user.userType === 'employee_office') && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton
                onClick={() => handleDeleteRow(params.row)}
                color="warning"
              >
                <DeleteIcon />
              </IconButton>
              <Typography variant="caption">Delete</Typography>
            </Box>
          )}
          
          {/* Upload Button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton component="label" color="primary" disabled={!isUserResponsible(params.row)}>
              <CloudUploadIcon sx={{ color: colors.grey[100] }} />
              <input
                type="file"
                hidden
                onChange={(event) => handleFileUpload(params.row.id, event)}
              />
            </IconButton>
            <Typography variant="caption">Upload</Typography>
          </Box>
    
          {/* Download All Files Button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton onClick={() => handleDownloadAllFiles(params.row.id)} color="primary">
              <DownloadIcon sx={{ color: colors.grey[100] }} />
            </IconButton>
            <Typography variant="caption">Download All</Typography>
          </Box>
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
            backgroundColor: colors.primary[400],
            color: 'black',
            overflowY: 'auto',
            
          },
        }}
      >
        {/* <DialogTitle>POSTS</DialogTitle> */}
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
