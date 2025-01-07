from fastapi import FastAPI, HTTPException
import asyncpg
from datetime import datetime
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from React's dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# PostgreSQL connection URL
DATABASE_URL = "postgresql://postgres:1234@127.0.0.1/weather_database"

# Asyncpg connection pool
async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

@app.on_event("startup")
async def startup():
    app.state.db = await get_db_connection()

@app.on_event("shutdown")
async def shutdown():
    await app.state.db.close()

# Pydantic model for a historical event
class HistoricalEvent(BaseModel):
    date: str  # Format: YYYY-MM-DD
    location: str
    description: str
    event_type: str  # Example: "war", "discovery", "cultural"

# Endpoint to fetch historical events by date
@app.get("/events")
async def get_events(date: Optional[str] = None):
    try:
        # If no date is provided, use today's date
        if not date:
            date_obj = datetime.today().date()
        else:
            # Convert the date string to a datetime.date object
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        
        # Query to fetch events for the given date
        query = """
            SELECT location, description, event_type 
            FROM historical_events
            WHERE date = $1
        """
        
        # Fetch events for the given date
        events = await app.state.db.fetch(query, date_obj)
        
        if not events:
            raise HTTPException(status_code=404, detail="No events found for this date.")
        
        # Return formatted response
        return [{"location": event["location"], "description": event["description"], "event_type": event["event_type"]} for event in events]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Endpoint to add a new historical event
@app.post("/events")
async def add_event(event: HistoricalEvent):
    """
    Add a new historical event to the database.
    """
    try:
        # Convert date string to a datetime.date object
        try:
            event_date = datetime.strptime(event.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
        
        # Insert the event into the database
        query = """
            INSERT INTO historical_events (date, location, description, event_type)
            VALUES ($1, $2, $3, $4)
        """
        await app.state.db.execute(query, event_date, event.location, event.description, event.event_type)
        
        return {"message": "Event added successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
