from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List
import openai
import logging

# Initialize FastAPI app
app = FastAPI()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Activity model
class Activity(BaseModel):
    name: str
    description: str

# Set OpenAI API key (replace with your actual key)
openai.api_key = "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"

# Endpoint to fetch activities
@app.get("/activities/", response_model=List[Activity])
async def fetch_activities(
    city: str = Query(..., description="City to fetch weather for"),
    hobbies: str = Query(..., description="User's hobbies (e.g., sports, reading)"),
    weather_condition: str = Query(..., description="Current weather condition (e.g., sunny, rainy)")
):
    logger.info(f"Fetching activities for hobbies: {hobbies}, weather: {weather_condition} in city: {city}")
    
    if not hobbies or not weather_condition:
        raise HTTPException(status_code=400, detail="Hobbies and weather condition must be provided.")
    
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
        response = openai.Completion.create(
            engine="gpt-3.5-turbo",
            prompt=prompt,
            max_tokens=150,
        )
        suggestions = response.choices[0].text.strip().split("\n")
        
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
        logger.error(f"Error generating activities: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating activities: {e}")