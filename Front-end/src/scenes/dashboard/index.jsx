import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Typography, TextField, Card, IconButton } from '@mui/material';
import { ref, onValue, set, remove } from 'firebase/database';  // Firebase imports
import { db } from '../../firebase';  // Firebase instance
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '../../components/Header';
import { UserContext } from '../../context/UserContext';  // Import the UserContext to get the current user

// Colors for sticky notes
const colors = ['#FF0000', '#FF1493', '#FFA500', '#800080', '#008000', '#0000FF', '#A52A2A'];

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const { user } = useContext(UserContext);  // Get the current user from the context

  // Load the notes for the current user from Firebase on page load
  useEffect(() => {
    if (user && user.passportId) {
      const notesRef = ref(db, `notes/${user.passportId}`);
      onValue(notesRef, (snapshot) => {
        const data = snapshot.val();
        const loadedNotes = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
        setNotes(loadedNotes);  // Set notes from Firebase
      });
    }
  }, [user]);

  // Save the updated notes to Firebase for the current user
  const saveNotesToFirebase = (newNotes) => {
    if (user && user.passportId) {
      const notesRef = ref(db, `notes/${user.passportId}`);
      set(notesRef, newNotes.reduce((acc, note) => {
        acc[note.id] = note;
        return acc;
      }, {}));
    }
  };

  // Add a new sticky note
  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),  // Use a unique ID based on timestamp
      title: '',
      text: '',
      color: colors[Math.floor(Math.random() * colors.length)],  // Assign a random color
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotesToFirebase(updatedNotes);  // Save the updated notes to Firebase
  };

  // Update the content of a note
  const updateNote = (id, field, value) => {
    const updatedNotes = notes.map((note) => (note.id === id ? { ...note, [field]: value } : note));
    setNotes(updatedNotes);
    saveNotesToFirebase(updatedNotes);  // Save the updated notes to Firebase
  };

  // Delete a sticky note
  const deleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNotesToFirebase(updatedNotes);  // Save the updated notes to Firebase
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
                  sx: { color: 'black' },  // Ensure the text is readable
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
