from fastapi import FastAPI, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import asyncpg
import openai
import logging
import requests
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from datetime import datetime

# Define the database URL
DATABASE_URL = "postgresql://postgres:1234@127.0.0.1/weather_database"  # Your actual database credentials

# OpenAI API key (replace with your actual key)
OPENAI_API_KEY = "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"
openai.api_key = OPENAI_API_KEY

# Weather API key (replace with your actual key)
WEATHER_API_KEY = "c84c17d8012ea4f9644a0a6c94acef50"
WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather"

app = FastAPI()

# Dependency to get a database connection
async def get_db():
    connection = await asyncpg.connect(DATABASE_URL)
    try:
        yield connection
    finally:
        await connection.close()  # Ensure the connection is closed after use

# Define Pydantic models
class WeatherInterest(BaseModel):
    city: str
    hobbies: str

class Activity(BaseModel):
    name: str
    description: str

class HistoricalEvent(BaseModel):
    date: date  # Format: YYYY-MM-DD
    location: str
    description: str
    event_type: str  # Example: "war", "discovery", "cultural"

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, adjust as necessary
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# In-memory storage for weather interests
weather_interests = []

# Function to fetch weather condition
async def fetch_weather_condition(city: str):
    try:
        response = requests.get(
            WEATHER_API_URL,
            params={"q": city, "appid": WEATHER_API_KEY, "units": "metric"}
        )
        response.raise_for_status()
        weather_data = response.json()
        return weather_data["weather"][0]["main"]  # e.g., "Clear", "Rain", "Clouds"
    except Exception as e:
        logging.error(f"Error fetching weather data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

# Endpoint to submit weather interest
@app.post("/weather-interests/", response_model=WeatherInterest)
async def submit_weather_interest(weather_interest: WeatherInterest, db=Depends(get_db)):
    # Insert the weather interest into the database
    query = """
    INSERT INTO weather_interests (city, hobbies)
    VALUES ($1, $2)
    RETURNING id;
    """
    async with db.transaction():
        new_id = await db.fetchval(query, weather_interest.city, weather_interest.hobbies)
    return {**weather_interest.dict(), "id": new_id}  # Return the created interest with its ID

# Endpoint to fetch activities based on hobbies and weather condition
@app.get("/activities/", response_model=List[Activity])
async def fetch_activities(
     city: str = Query(..., description="City to fetch weather for"),
    hobbies: str = Query(..., description="User's hobbies (e.g., sports, reading)")
):
    logging.info(f"Fetching activities for city: {city}, hobbies: {hobbies}")

    # Fetch the current weather condition
    weather_condition = await fetch_weather_condition(city)

    # Generate prompt for OpenAI
    prompt = (
        f"Suggest three activities for someone with hobbies '{hobbies}' in the city '{city}' given the current weather condition: '{weather_condition}'. "
        "Provide each activity with a name and a brief description. Format the response as follows:\n"
        "1. Activity Name: Description\n"
        "2. Activity Name: Description\n"
        "3. Activity Name: Description"
    )

    try:
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
        )
        suggestions = response.choices[0].message.content.strip().split("\n")

        # Parse suggestions into Activity objects
        activities = []
        for suggestion in suggestions:
            if ": " in suggestion:
                name, description = suggestion.split(": ", 1)
                activities.append(Activity(name=name.strip(), description=description.strip()))

        if not activities:
            raise ValueError("No valid activities generated.")

        return activities
    except Exception as e:
        logging.error(f"Error generating activities: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating activities: {e}")

# Historical Data Module

# Example endpoint to fetch historical events
@app.get("/historical-events/")
async def get_historical_events(date: Optional[str] = None, db=Depends(get_db)):
    try:
        if date:
            # Convert the date string to a datetime.date object
            parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
            query = "SELECT * FROM historical_events1 WHERE event_date = $1"
            return await db.fetch(query, parsed_date)
        else:
            query = "SELECT * FROM historical_events1"
            return await db.fetch(query)
    except Exception as e:
        logging.error(f"Error fetching historical events1: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch historical events")

# Example endpoint to add a new historical event
@app.post("/historical-events/")
async def create_historical_event(event: HistoricalEvent, db=Depends(get_db)):
    try:
        query = """
        INSERT INTO historical_events1 (event_date, location, description, event_type)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
        """
        new_id = await db.fetchval(query, event.date, event.location, event.description, event.event_type)
        return event.dict() | {"id": new_id}  # Corrected response format
    except Exception as e:
        logging.error(f"Error adding historical event: {e}")
        raise HTTPException(status_code=500, detail="Failed to add historical event")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)