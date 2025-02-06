import React, { useState } from "react";
import "./ActivitySuggestions.scss";

const ActivitySuggestions = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false); // New state for activity modal
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoadingModalOpen(true);

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
            setActivities(data);
            setIsLoadingModalOpen(false);
            setShowModal(false); // Close the form modal
            setShowActivityModal(true); // Open the activity modal
          })
          .catch((error) => {
            console.error("Error fetching activities:", error);
            setIsLoadingModalOpen(false);
          });
      })
      .catch((error) => {
        console.error("Error submitting interests:", error);
        setIsLoadingModalOpen(false);
      });
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

      {/* Form Modal */}
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
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => setShowActivityModal(false)}
            >
              &times;
            </button>
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
        </div>
      )}

      {/* Loader Modal */}
      {isLoadingModalOpen && (
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

export default ActivitySuggestions;
