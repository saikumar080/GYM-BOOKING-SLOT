const express = require('express');
const cors = require('cors');
const db = require('./db');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(cors());
app.use(express.json());

// GET all slots with current booking:::
app.get('/api/slots', (req, res) => {
  const query = `
    SELECT s.id, s.slot_time, s.capacity,
      COUNT(b.id) AS booked
    FROM slots s
    LEFT JOIN bookings b ON s.id = b.slot_id
    GROUP BY s.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST book a slot
app.post('/api/book', (req, res) => {
  const { slot_id, user_name } = req.body;

  if (!slot_id || !user_name)
    return res.status(400).json({ error: 'slot_id and user_name are required' });

  // Check capacity
  const checkQuery = `
    SELECT s.capacity, COUNT(b.id) AS booked
    FROM slots s
    LEFT JOIN bookings b ON s.id = b.slot_id
    WHERE s.id = ?
    GROUP BY s.id
  `;
  db.query(checkQuery, [slot_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Slot not found' });

    const { capacity, booked } = results[0];
    if (booked >= capacity)
      return res.status(400).json({ error: 'Slot is full!' });

    // Insert booking
    db.query(
      'INSERT INTO bookings (slot_id, user_name) VALUES (?, ?)',
      [slot_id, user_name],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Booking successful!', booking_id: result.insertId });
      }
    );
  });
});

// DELETE cancel a booking
app.delete('/api/cancel/:booking_id', (req, res) => {
  const { booking_id } = req.params;
  db.query('DELETE FROM bookings WHERE id = ?', [booking_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking cancelled successfully!' });
  });
});

// GET bookings by user
app.get('/api/bookings/:user_name', (req, res) => {
  const { user_name } = req.params;
  const query = `
    SELECT b.id, s.slot_time, b.user_name, b.created_at
    FROM bookings b
    JOIN slots s ON b.slot_id = s.id
    WHERE b.user_name = ?
  `;
  db.query(query, [user_name], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));