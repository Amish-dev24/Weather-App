import React, { useState, useEffect } from "react";
import "./Historical.scss";

const Historical = () => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [newEvent, setNewEvent] = useState({
    date: "",
    location: "",
    description: "",
    event_type: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false); // For loader
  const [showEventsModal, setShowEventsModal] = useState(false); // Show event list modal

  const validateDate = (year, month, day) => {
    if (year.length !== 4 || month.length !== 2 || day.length !== 2) {
      return false;
    }
    const dateStr = `${year}-${month}-${day}`;
    const date = new Date(dateStr);
    return (
      date.getFullYear() === parseInt(year) &&
      date.getMonth() + 1 === parseInt(month) &&
      date.getDate() === parseInt(day)
    );
  };

  const fetchEvents = async () => {
    try {
      setLoading(true); // Show loader
      if (!validateDate(year, month, day)) {
        throw new Error("Please enter a valid date in YYYY-MM-DD format.");
      }

      const formattedDate = `${year}-${month}-${day}`;
      const response = await fetch(
        `http://127.0.0.1:8000/historical-events/?date=${formattedDate}`
      );

      if (!response.ok) {
        throw new Error("No event found for the selected date");
      }

      const data = await response.json();
      setEvents(data);
      setError("");

      // Simulate loader delay even if operation is fast
      setTimeout(() => {
        setShowEventsModal(true); // Show event list modal
        setLoading(false); // Hide loader after a short delay
      }, 1000); // Delay for 1 second
    } catch (err) {
      setError(err.message);
      setEvents([]);
      setLoading(false); // Hide loader immediately if there's an error
    }
  };

  const handleFetch = () => {
    if (year && month && day) {
      fetchEvents();
    } else {
      setError("Please fill in all date fields.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); // Show loader
      if (
        !newEvent.date ||
        !newEvent.location ||
        !newEvent.description ||
        !newEvent.event_type
      ) {
        setError("Please fill in all fields for the new event.");
        return;
      }

      const dateParts = newEvent.date.split("-");
      if (
        dateParts.length !== 3 ||
        dateParts[0].length !== 4 ||
        dateParts[1].length !== 2 ||
        dateParts[2].length !== 2
      ) {
        setError("Date must be in YYYY-MM-DD format.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/historical-events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        setError("");
        setNewEvent({
          date: "",
          location: "",
          description: "",
          event_type: "",
        });
        setShowAddForm(false);

        // Simulate loader delay even if operation is fast
        setTimeout(() => {
          alert("Event added successfully!");
          setLoading(false); // Hide loader after a short delay
        }, 1000); // Delay for 1 second
      } else {
        throw new Error("Failed to add event.");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false); // Hide loader immediately if there's an error
    }
  };

  const closeEventsModal = () => {
    setShowEventsModal(false); // Close the event list modal
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-10 historical-container">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Historical Events
      </h2>

      {/* Date Inputs and Fetch Button */}
      <div className="flex gap-4 mb-6 event-inputs">
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="YYYY"
          maxLength="4"
          className="w-20 p-2 text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="MM"
          maxLength="2"
          className="w-16 p-2 text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          placeholder="DD"
          maxLength="2"
          className="w-16 p-2 text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleFetch}
        className="px-6 py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
      >
        Fetch Events
      </button>

      {/* Error Messages */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">{error}</p>
      )}

      {/* Add New Event Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="px-6 py-2 mb-6 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
      >
        Add New Event
      </button>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowAddForm(false)}>
              &times;
            </button>
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Add a New Event
            </h3>
            <form onSubmit={handleAddEvent}>
              <input
                type="text"
                name="date"
                value={newEvent.date}
                onChange={handleInputChange}
                placeholder="Date (YYYY-MM-DD)"
                className="w-full p-2 mb-4 border rounded-lg"
              />
              <input
                type="text"
                name="location"
                value={newEvent.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full p-2 mb-4 border rounded-lg"
              />
              <input
                type="text"
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full p-2 mb-4 border rounded-lg"
              />
              <input
                type="text"
                name="event_type"
                value={newEvent.event_type}
                onChange={handleInputChange}
                placeholder="Event Type"
                className="w-full p-2 mb-4 border rounded-lg"
              />
              <button
                type="submit"
                className="w-full px-6 py-2 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
              >
                Add Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Events Modal */}
      {showEventsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeEventsModal}>
              &times;
            </button>
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Historical Events on {year}-{month}-{day}
            </h3>
            <div className="event-list">
              <ul className="space-y-4">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <li key={index} className="event-item">
                      <p>
                        <strong>Date:</strong> {event.event_date}
                      </p>
                      <p>
                        <strong>Location:</strong> {event.location}
                      </p>
                      <p>
                        <strong>Type:</strong> {event.event_type}
                      </p>
                      <p>
                        <strong>Description:</strong> {event.description}
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No events to display.
                  </p>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loader Modal */}
      {loading && (
        <div className="loader-modal-overlay">
          <div className="loader-modal-content">
            <div className="container">
              <div className="cloud front">
                <span className="left-front"></span>
                <span className="right-front"></span>
              </div>
              <span className="sun sunshine"></span>
              <span className="sun"></span>
              <div className="cloud back">
                <span className="left-back"></span>
                <span className="right-back"></span>
              </div>
            </div>
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historical;
