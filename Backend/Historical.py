from fastapi import FastAPI, HTTPException, Depends
import asyncpg
from datetime import datetime
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Initialize FastAPI app
app = FastAPI()

# PostgreSQL connection URL
DATABASE_URL = "postgresql://postgres:1234@127.0.0.1/weather_database"

# Configure logging
logging.basicConfig(level=logging.INFO)

# Dependency to get a database connection
async def get_db():
    try:
        connection = await asyncpg.connect(DATABASE_URL)
        yield connection
    finally:
        await connection.close()  # Ensure the connection is closed after use

@app.on_event("startup")
async def startup():
    app.state.db = await get_db()
    if not app.state.db:
        logging.error("Database connection could not be established.")
        raise HTTPException(status_code=500, detail="Database connection failed.")

@app.on_event("shutdown")
async def shutdown():
    await app.state.db.close()

# Pydantic model for a historical event
class HistoricalEvent(BaseModel):
    date: str  # Format: YYYY-MM-DD
    location: str
    description: str
    event_type: str  # Example: "war", "discovery", "cultural"

@app.get("/events/")
async def read_events(date: Optional[str] = None, db=Depends(get_db)):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection could not be established.")
    return await fetch_events(date, db)

# Function to fetch historical events with db dependency
async def fetch_events(date: Optional[str] = None, db=None):
    try:
        if not date:
            date_obj = datetime.today().date()
        else:
            try:
                date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
        
        query = """
            SELECT location, description, event_type 
            FROM historical_events
            WHERE date = $1
        """
        
        events = await db.fetch(query, date_obj)  # Use the db parameter
        
        if not events:
            raise HTTPException(status_code=404, detail="No events found for this date.")
        
        return [{"location": event["location"], "description": event["description"], "event_type": event["event_type"]} for event in events]
    
    except Exception as e:
        logging.error(f"Error fetching events: {str(e)}")  # Log the error
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")  # Include the error message in the response

# Function to add a new historical event with db dependency
async def add_event(event: HistoricalEvent, db=Depends(get_db)):
    try:
        event_date = datetime.strptime(event.date, "%Y-%m-%d").date()
        
        query = """
            INSERT INTO historical_events (date, location, description, event_type)
            VALUES ($1, $2, $3, $4)
        """
        await db.execute(query, event_date, event.location, event.description, event.event_type)
        
        return {"message": "Event added successfully"}
    
    except Exception as e:
        logging.error(f"Error adding event: {str(e)}")  # Log the error with more context
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")  # Include the error message in the response
