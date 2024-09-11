import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Typography, TextField, Card, IconButton } from '@mui/material';
import { ref, onValue, set, remove } from 'firebase/database';  // Import Firebase functions
import { db } from '../../firebase';  // Import Firebase instance
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '../../components/Header';
import { UserContext } from '../../context/UserContext';  // Assuming you have a UserContext to get current user

// Colors for sticky notes
const colors = ['#FFEB3B', '#FF5722', '#4CAF50', '#00BCD4', '#FFC107', '#9C27B0'];

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const { user } = useContext(UserContext);  // Get the current user context

  // Load notes for the current user from Firebase
  useEffect(() => {
    if (user && user.passportId) {
      const notesRef = ref(db, `notes/${user.passportId}`);
      onValue(notesRef, (snapshot) => {
        const data = snapshot.val();
        const loadedNotes = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
        setNotes(loadedNotes);
      });
    }
  }, [user]);

  // Save notes to Firebase under the current user's passportId
  const saveNoteToFirebase = (newNotes) => {
    if (user && user.passportId) {
      const notesRef = ref(db, `notes/${user.passportId}`);
      set(notesRef, newNotes.reduce((acc, note) => {
        acc[note.id] = note;
        return acc;
      }, {}));
    }
  };

  // Function to add a new sticky note
  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),  // Use string for Firebase key compatibility
      title: '',
      text: '',
      color: colors[Math.floor(Math.random() * colors.length)], // Assign a random color
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNoteToFirebase(updatedNotes);
  };

  // Function to update a note's content
  const updateNote = (id, field, value) => {
    const updatedNotes = notes.map((note) => (note.id === id ? { ...note, [field]: value } : note));
    setNotes(updatedNotes);
    saveNoteToFirebase(updatedNotes);
  };

  // Function to delete a sticky note
  const deleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNoteToFirebase(updatedNotes);
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Home" subtitle="Welcome to your dashboard" />
        <Button variant="contained" color="primary" onClick={addNote}>
          Add Sticky Note
        </Button>
      </Box>

      {/* Sticky Notes Section */}
      <Box mt={4} display="flex" flexWrap="wrap" gap={2}>
        {notes.map((note) => (
          <Card
            key={note.id}
            sx={{
              width: '250px',
              backgroundColor: note.color,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Box mb={2}>
              <TextField
                label="Title"
                variant="outlined"
                fullWidth
                value={note.title}
                onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                InputProps={{
                  sx: { color: 'black' }, // Ensure the text is readable
                }}
                InputLabelProps={{
                  sx: { color: 'black' },
                }}
              />
            </Box>
            <Box flexGrow={1} mb={2}>
              <TextField
                label="Write your note here..."
                variant="outlined"
                multiline
                fullWidth
                rows={6}
                value={note.text}
                onChange={(e) => updateNote(note.id, 'text', e.target.value)}
                InputProps={{
                  sx: { color: 'black' },
                }}
                InputLabelProps={{
                  sx: { color: 'black' },
                }}
              />
            </Box>
            <IconButton
              onClick={() => deleteNote(note.id)}
              color="error"
              sx={{ alignSelf: 'flex-end' }}
            >
              <DeleteIcon />
            </IconButton>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Dashboard;
