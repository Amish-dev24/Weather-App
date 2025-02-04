import React, { useState } from "react";
import "./ActivitySuggestions.scss";

const ActivitySuggestions = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { city, hobbies };

    fetch("http://127.0.0.1:8000/weather-interests/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then(() => {
        fetch(
          `http://127.0.0.1:8000/activities/?city=${city}&hobbies=${encodeURIComponent(
            hobbies
          )}`
        )
          .then((response) => response.json())
          .then((data) => {
            setActivities(data); // Set the activities data
          })
          .catch((error) => console.error("Error fetching activities:", error));
      })
      .catch((error) => console.error("Error submitting interests:", error));
  };

  return (
    <div className="activity-suggestions">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
        Get Activity Suggestions
      </h2>
      <div className="button-container">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Get Activity Suggestions
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h2>Tell Us About Yourself</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Hobbies (comma separated)"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                required
              />
              <div className="submit-button-container">
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                >
                  Get Suggestions
                </button>
              </div>
            </form>

            {/* Display activity suggestions inside the modal */}
            {activities.length > 0 && (
              <div className="activity-list">
                <h2>Activity Suggestions for {city}</h2>
                <ul>
                  {activities.map((activity, index) => (
                    <li key={index}>
                      <h3>{activity.name}</h3>
                      <p>{activity.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySuggestions;
