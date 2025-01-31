// import React, { useState, useEffect } from 'react';

// const ActivityRecommendation = ({ weather, interests }) => {
//     const [recommendations, setRecommendations] = useState([]);

//     const activities = {
//         sunny: {
//             outdoor: ['Go for a hike', 'Have a picnic', 'Play a sport'],
//             indoor: ['Visit a museum', 'Go to a café', 'Watch a movie'],
//         },
//         rainy: {
//             outdoor: ['Visit an indoor amusement park', 'Go for a scenic drive'],
//             indoor: ['Read a book', 'Watch a series', 'Try a new recipe'],
//         },
//         snowy: {
//             outdoor: ['Go skiing', 'Build a snowman', 'Ice skating'],
//             indoor: ['Make hot chocolate', 'Watch a winter movie', 'Do a puzzle'],
//         },
//         cloudy: {
//             outdoor: ['Go for a walk', 'Visit a botanical garden'],
//             indoor: ['Visit an art gallery', 'Attend a workshop'],
//         },
//     };

//     useEffect(() => {
//         if (weather && interests) {
//             const currentWeather = weather.weather[0].main.toLowerCase();
//             const userInterests = interests.map(interest => interest.toLowerCase());

//             const availableActivities = activities[currentWeather] || {};
//             const recommendedActivities = [];

//             userInterests.forEach(interest => {
//                 if (availableActivities[interest]) {
//                     recommendedActivities.push(...availableActivities[interest]);
//                 }
//             });

//             setRecommendations(recommendedActivities);
//         }
//     }, [weather, interests]);

//     return (
//         <div className="activity-recommendation">
//             <h2>Recommended Activities</h2>
//             {recommendations.length > 0 ? (
//                 <ul>
//                     {recommendations.map((activity, index) => (
//                         <li key={index}>{activity}</li>
//                     ))}
//                 </ul>
//             ) : (
//                 <p>No recommendations available based on your interests and the current weather.</p>
//             )}
//         </div>
//     );
// };

// export default ActivityRecommendation;
