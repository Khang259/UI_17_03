from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List
import logging

# Initialize FastAPI app
app = FastAPI()

# Configure logging
logging.basicConfig(filename="app_requests.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Setup Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Store received data
data_store = []

# Define a request model
class DataModel(BaseModel):
    device_id: str
    timestamp: str
    sensor_value: float

# Create a POST endpoint to receive data
@app.post("/receive-data")
async def receive_data(data: DataModel):
    # Store received data
    data_store.append(data)
    
    # Log received data
    logging.info(f"Received data: {data}")
    
    print(f"Received data: {data}")
    
    # Respond with success message
    return {"message": "Data received successfully", "received_data": data.dict()}

# Create a GET endpoint to fetch received data
@app.get("/get-data", response_model=List[DataModel])
async def get_data():
    return data_store

# Create UI to display data
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Run the server using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
