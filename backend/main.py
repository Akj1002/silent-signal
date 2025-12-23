from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database  # Absolute imports
app = FastAPI(title="Silent Signal Agentic API")

# 1. FIXED CORS: Essential for Integrated App.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. INITIALIZE DATABASE: Auto-creates silent_signal.db tables
models.Base.metadata.create_all(bind=database.engine)

@app.get("/health")
def health():
    return {"status": "Agentic Mesh Online", "agent": "Active"}

# 3. AGENTIC CHAT ENGINE: Real-time reasoning
@app.post("/api/agent/chat")
async def process_agent_logic(request: schemas.AgentRequest):
    msg = request.message.lower()
    vitals = request.vitals
    
    # AGENT 1: BEHAVIORAL ANALYSIS AGENT
    if any(word in msg for word in ["stress", "anxious", "panic"]):
        return {
            "agent": "Behavioral Agent",
            "response": f"Analyzing mesh signals... Your anxiety is currently {vitals.get('anxiety', 0)}%. I suggest initiating a Relief Pacer scan.",
            "action": "trigger_pacer"
        }
    
    # AGENT 2: CLINICAL SCHEDULER AGENT
    if any(word in msg for word in ["doctor", "psychiatrist", "appointment"]):
        return {
            "agent": "Scheduler Agent",
            "response": "I can assist you in booking a session with Dr. Kavita Sharma. Please select a date in the Expert Nodes tab.",
            "action": "open_experts"
        }

    return {
        "agent": "Health Specialist",
        "response": "I am monitoring your biometric trends. How can I assist you today?",
        "action": "none"
    }

# 4. DATA PERSISTENCE: Records real scans and history
@app.post("/api/logs", response_model=schemas.LogResponse)
def log_vitals(log: schemas.LogBase, db: Session = Depends(database.get_db)):
    db_log = models.BehavioralLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/api/history", response_model=List[schemas.LogResponse])
def get_history(db: Session = Depends(database.get_db)):
    # Returns last 7 entries for the chart
    return db.query(models.BehavioralLog).order_by(models.BehavioralLog.timestamp.desc()).limit(7).all()

@app.post("/api/bookings")
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(database.get_db)):
    db_booking = models.ExpertBooking(**booking.model_dump())
    db.add(db_booking)
    db.commit()
    return {"status": "success", "message": "Consultation recorded locally."}