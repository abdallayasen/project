// src/scenes/work/index.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Box, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../firebase';
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/CloudDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import CommentIcon from '@mui/icons-material/Comment';
import { UserContext } from "../../context/UserContext";
import StatusButton from '../../components/StatusButton'; // Ensure correct path
import Comments from '../../scenes/comments';

const Work = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const { user } = useContext(UserContext);
  const [editRowsModel, setEditRowsModel] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [pendingRow, setPendingRow] = useState(null);
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      const ordersRef = ref(db, 'orders/');
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        const orderList = data ? Object.keys(data).map((key, index) => ({
          id: key,
          serialNumber: index + 1,
          ...data[key]
        })) : [];
        setRows(orderList);
      });
    };

    fetchData();
  }, []);

  const updateOrderStatus = (orderId, type, newStatus) => {
    const orderRef = ref(db, `orders/${orderId}`);
    update(orderRef, { [type]: newStatus }).then(() => {
      setRows((prevRows) => prevRows.map((row) => {
        if (row.id === orderId) {
          return { ...row, [type]: newStatus };
        }
        return row;
      }));
      setSnackbarMessage(`Order ${orderId} ${type} updated to ${newStatus}`);
      setSnackbarOpen(true);
    }).catch((error) => {
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

  const handleEditRowsModelChange = (model) => {
    setEditRowsModel(model);
  };

  const handleEditDialogOpen = (row) => {
    setPendingRow(row);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setPendingRow(null);
  };

  const handleDeleteDialogOpen = (row) => {
    setPendingDeleteRow(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPendingDeleteRow(null);
  };

  const handleCommentsDialogOpen = (row) => {
    setSelectedOrder(row);
    setCommentsDialogOpen(true);
  };

  const handleCommentsDialogClose = () => {
    setCommentsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmEdit = () => {
    const newRow = pendingRow;
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    setSnackbarMessage('Row updated successfully');
    setSnackbarOpen(true);
    handleEditDialogClose();
  };

  const handleProcessRowUpdate = (newRow) => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    return newRow;
  };

  const handleConfirmDelete = () => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== pendingDeleteRow.id));
    setSnackbarMessage('Row deleted successfully');
    setSnackbarOpen(true);
    handleDeleteDialogClose();
  };

  const handleEditRow = (row) => {
    handleEditDialogOpen(row);
  };

  const handleDeleteRow = (row) => {
    handleDeleteDialogOpen(row);
  };

  const handleFileUpload = (event, row) => {
    const file = event.target.files[0];
    if (file) {
      const updatedRows = rows.map((r) => {
        if (r.id === row.id) {
          return { ...r, files: [...(r.files || []), file] };
        }
        return r;
      });
      setRows(updatedRows);
      setSnackbarMessage('File uploaded successfully');
      setSnackbarOpen(true);
    }
  };

  const handleFileDownload = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (file) => {
    const fileType = file.type;
    if (fileType.includes('pdf')) {
      return <PictureAsPdfIcon />;
    } else if (fileType.includes('image')) {
      return <ImageIcon />;
    } else {
      return <DescriptionIcon />;
    }
  };

  const columns = [
    { field: "serialNumber", headerName: "Serial Number", flex: 0.5, editable: false },
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "orderType",
      headerName: "Work Name",
      flex: 1,
      editable: true,
    },
    {
      field: "orderDate",
      headerName: "Order Date",
      flex: 1,
      editable: true,
    },
    {
      field: "fieldStatus",
      headerName: "Field Status",
      flex: 1,
      renderCell: (params) => (
        <StatusButton
          initialStatus={params.value}
          type="fieldStatus"
          orderId={params.row.id}
          updateOrderStatus={updateOrderStatus}
        />
      ),
      editable: false,
    },
    {
      field: "officeStatus",
      headerName: "Office Status",
      flex: 1,
      renderCell: (params) => (
        <StatusButton
          initialStatus={params.value}
          type="officeStatus"
          orderId={params.row.id}
          updateOrderStatus={updateOrderStatus}
        />
      ),
      editable: false,
    },
    {
      field: "employeeFieldName",
      headerName: "Field Employee",
      flex: 1,
      editable: true,
    },
    {
      field: "employeeOfficeName",
      headerName: "Office Employee",
      flex: 1,
      editable: true,
    },
    {
      field: "files",
      headerName: "Files",
      flex: 1,
      renderCell: (params) => (
        <Box>
          {params.row.files && params.row.files.map((file, index) => (
            <IconButton key={index} onClick={() => handleFileDownload(file)}>
              {getFileIcon(file)}
            </IconButton>
          ))}
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "comments",
      headerName: "Comments",
      flex: 1,
      renderCell: (params) => (
        <IconButton onClick={() => handleCommentsDialogOpen(params.row)}>
          <CommentIcon />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleDeleteRow(params.row)} color="warning">
            <DeleteIcon />
          </IconButton>

          <input
            style={{ display: 'none' }}
            id={`file-upload-${params.row.id}`}
            type="file"
            onChange={(event) => handleFileUpload(event, params.row)}
          />
          <label htmlFor={`file-upload-${params.row.id}`}>
            <IconButton component="span">
              <FileUploadIcon />
            </IconButton>
          </label>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box m="20px">
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
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={handleEditRowsModelChange}
          processRowUpdate={handleProcessRowUpdate}
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
        open={commentsDialogOpen}
        onClose={handleCommentsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          {selectedOrder && <Comments orderId={selectedOrder.id} />}
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
