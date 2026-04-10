import React, { useState, useEffect } from 'react';
import './App.css';

const API = 'https://gym-booking-slot.onrender.com/api';

function App() {
  const [slots, setSlots] = useState([]);
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [message, setMessage] = useState('');

  const fetchSlots = async () => {
    const res = await fetch(`${API}/slots`);
    const data = await res.json();
    setSlots(data);
  };

  const fetchMyBookings = async (name) => {
    const res = await fetch(`${API}/bookings/${name}`);
    const data = await res.json();
    setMyBookings(data);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleLogin = () => {
    if (!inputName.trim()) return;
    setUserName(inputName.trim());
    fetchMyBookings(inputName.trim());
  };

  const handleBook = async (slot_id) => {
    if (!userName) return alert('Please enter your name first!');
    const res = await fetch(`${API}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id, user_name: userName }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchSlots();
    fetchMyBookings(userName);
  };

  const handleCancel = async (booking_id) => {
    const res = await fetch(`${API}/cancel/${booking_id}`, { method: 'DELETE' });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchSlots();
    fetchMyBookings(userName);
  };

  return (
    <div className="app">
      <h1>🏋️ Gym Slot Booking</h1>

      {!userName ? (
        <div className="login-box">
          <input
            placeholder="Enter your name to continue"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <button onClick={handleLogin}>Continue</button>
        </div>
      ) : (
        <p className="welcome">Welcome, <strong>{userName}</strong>!</p>
      )}

      {message && <div className="msg">{message}</div>}

      <h2>Available Slots</h2>
      <div className="slots-grid">
        {slots.map((slot) => {
          const available = slot.capacity - slot.booked;
          const isFull = available === 0;
          return (
            <div key={slot.id} className={`slot-card ${isFull ? 'full' : ''}`}>
              <h3>{slot.slot_time}</h3>
              <p>{isFull ? '❌ Full' : `✅ ${available} spots left`}</p>
              <button
                disabled={isFull || !userName}
                onClick={() => handleBook(slot.id)}
              >
                {isFull ? 'Full' : 'Book'}
              </button>
            </div>
          );
        })}
      </div>

      {userName && myBookings.length > 0 && (
        <div className="my-bookings">
          <h2>My Bookings</h2>
          {myBookings.map((b) => (
            <div key={b.id} className="booking-item">
              <span>{b.slot_time}</span>
              <button className="cancel-btn" onClick={() => handleCancel(b.id)}>
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;