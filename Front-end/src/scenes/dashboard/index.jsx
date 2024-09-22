import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, TextField, Card, IconButton } from '@mui/material';
import { ref, onValue, set } from 'firebase/database';  // Firebase imports
import { db } from '../../firebase';  // Firebase instance
import DeleteIcon from '@mui/icons-material/Delete';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import Header from '../../components/Header';
import { UserContext } from '../../context/UserContext';  // Import the UserContext to get the current user

// Colors for sticky notes
const colors = ['#e55656', '#e784ea', '#d8dc7d', '#1b94b8', '#90ea84', '#2db0f1', '#b784ea'];

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
      text: '',
      color: colors[Math.floor(Math.random() * colors.length)],  // Assign a random color
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotesToFirebase(updatedNotes);  // Save the updated notes to Firebase
  };

  // Update the content of a note
  const updateNote = (id, value) => {
    const updatedNotes = notes.map((note) => (note.id === id ? { ...note, text: value } : note));
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
<Box 
      m="20px" 
  >      <Box display="flex" justifyContent="space-between" alignItems="center" >
        <Header title="Home" subtitle="Welcome to your dashboard" />
        <Button variant="contained" color="secondary" onClick={addNote}>
          Add Sticky Note
        </Button>
      </Box>

      {/* Sticky Notes Section */}
      <Box mt={4} display="flex" flexWrap="wrap" gap={2} >
        {notes.map((note) => (
          <Card
            key={note.id}
            sx={{
              width: '289px',
              backgroundColor: note.color,
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              borderRadius: '20px',  // Add rounded corners
            }}
          >
            <Box flexGrow={1} mb={2} sx={{ paddingTop: '18px', paddingBottom: '0px' }}>
              <TextField
                label="Write your note here..."
                variant="outlined"
                multiline
                fullWidth
                rows={8}  // Increased rows for more space
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                InputProps={{
                  sx: { color: 'black'


                  },
                }}
              />
            </Box>
            <IconButton
              onClick={() => deleteNote(note.id)}
              color="black"
              sx={{ alignSelf: 'center' }}
            >
              <ClearRoundedIcon  />
            </IconButton>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
export default Dashboard;
