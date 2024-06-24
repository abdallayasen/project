import { Box, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataWorkStatus } from "../../data/mockData";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import Button from '@mui/material/Button';
import { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/CloudDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import CommentIcon from '@mui/icons-material/Comment';

const StatusButton = ({ initialStatus }) => {
  const statuses = ["Success", "Pending", "Processing", "Refunded"];
  const [status, setStatus] = useState(initialStatus);

  const handleClick = () => {
    const currentIndex = statuses.indexOf(status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    setStatus(newStatus);
  };

  const getButtonStyle = (status) => {
    switch (status) {
      case "Success":
        return { backgroundColor: '#4caf50' };
      case "Pending":
        return { backgroundColor: '#ff5722' };
      case "Processing":
        return { backgroundColor: '#29B6F6' };
      default:
        return { backgroundColor: '#D9250F' };
    }
  };

  return (
    <Button
      variant="contained"
      style={getButtonStyle(status)}
      onClick={handleClick}
    >
      {status}
    </Button>
  );
};

const Work = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState(mockDataWorkStatus);
  const [editRowsModel, setEditRowsModel] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingRow, setPendingRow] = useState(null);
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);

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

  const handleConfirmEdit = () => {
    const newRow = pendingRow;
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    setSnackbarMessage('Row updated successfully');
    setSnackbarOpen(true);
    handleEditDialogClose();
  };

  const handleProcessRowUpdate = (newRow) => {
    handleEditDialogOpen(newRow);
    return newRow;
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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

  const handleOpenComments = (row) => {
    // Navigate to the comments page or modal for the specific row
    console.log("Open comments for row:", row);
    // Implement your logic to open comments here, e.g., using a router or modal
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, editable: false },
    {
      field: "customername",
      headerName: "Customer Name",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "workname",
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
      renderCell: (params) => <StatusButton initialStatus={params.value} />,
      editable: false,
    },
    {
      field: "officeStatus",
      headerName: "Office Status",
      flex: 1,
      renderCell: (params) => <StatusButton initialStatus={params.value} />,
      editable: false,
    },
    {
      field: "fieldEmployee",
      headerName: "Field Employee",
      flex: 1,
      editable: true,
    },
    {
      field: "officeEmployee",
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
        <IconButton onClick={() => handleOpenComments(params.row)}>
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
          <DialogContentText>
            Are you sure you want to save the changes?
          </DialogContentText>
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
          <DialogContentText>
            Are you sure you want to delete the row?
          </DialogContentText>
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
    </Box>
  );
};

export default Work;