// src/scenes/Calendar/Calendar.jsx
import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box } from '@mui/material';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format: (date, formatStr) => format(date, formatStr, { locale: enUS }),
  parse: (dateStr, formatStr) => parse(dateStr, formatStr, new Date(), { locale: enUS }),
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay: (date) => getDay(date),
  locales,
});


const MyCalendar = () => {
  const [events] = useState([
    {
      title: 'Meeting with Team',
      start: new Date(),
      end: new Date(),
    },
  ]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        margin: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{
          width: '80%', // Increase width to 80%
          height: '75vh',
          color: '#333',
        }}
        
        views={['month', 'week', 'day']}
        defaultView="month"
      />
    </Box>
  );
};

export default MyCalendar;
