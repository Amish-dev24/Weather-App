import React, { useState } from 'react';

const UserForm = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [interests, setInterests] = useState([]);
    const [weatherCondition, setWeatherCondition] = useState('');

    const handleInterestChange = (e) => {
        const value = e.target.value;
        setInterests(prevInterests => 
            prevInterests.includes(value) 
                ? prevInterests.filter(interest => interest !== value) 
                : [...prevInterests, value]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, interests, weatherCondition });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>User Preferences</h2>
            <input 
                type="text" 
                placeholder="Your Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
            />
            <div>
                <h3>Select Your Interests:</h3>
                <label>
                    <input type="checkbox" value="outdoor" onChange={handleInterestChange} />
                    Outdoor
                </label>
                <label>
                    <input type="checkbox" value="indoor" onChange={handleInterestChange} />
                    Indoor
                </label>
                <label>
                    <input type="checkbox" value="sports" onChange={handleInterestChange} />
                    Sports
                </label>
            </div>
            <input 
                type="text" 
                placeholder="Current Weather Condition" 
                value={weatherCondition} 
                onChange={(e) => setWeatherCondition(e.target.value)} 
                required 
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default UserForm; 