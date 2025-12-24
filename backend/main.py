from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
import google.generativeai as genai

# --- CONFIGURATION ---
# Your provided API Key
genai.configure(api_key="AlzaSyBhaOrx-PA5ii4Hsp2LvOWt91QfFvc0x24")
model = genai.GenerativeModel('gemini-pro')

app = FastAPI(title="Silent Signal Hybrid Agent")

# CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
database.Base.metadata.create_all(bind=database.engine)

@app.get("/health")
def health():
    return {"status": "Hybrid Neural Mesh Online"}

# --- THE AGENTIC BRAIN ---
@app.post("/api/agent/chat")
async def agent_logic(request: schemas.AgentRequest):
    msg = request.message.lower()
    vitals = request.vitals
    
    # 1. DETERMINISTIC LAYER (The "Hands")
    # Triggers app actions 100% reliably for the demo
    if any(word in msg for word in ["scan", "measure", "pacer", "heart", "pulse"]):
        return {
            "agent": "Behavioral Agent",
            "response": f"I'm activating the Relief Pacer. Your anxiety is {vitals.get('anxiety', 0)}%. Align your face with the camera.",
            "action": "trigger_pacer"
        }
    
    if any(word in msg for word in ["doctor", "psychiatrist", "appointment", "booking"]):
        return {
            "agent": "Scheduler Agent",
            "response": "I've connected to the Expert Nodes. Dr. Kavita Sharma has an opening tomorrow.",
            "action": "open_experts"
        }

    # 2. GENERATIVE LAYER (The "Brain")
    # Uses your API Key to answer general medical questions
    try:
        # Give the AI context about the user's health
        context_prompt = f"""
        You are Silent Signal, an empathetic health AI.
        User Vitals: Heart Rate {vitals.get('hr')} BPM, Anxiety {vitals.get('anxiety')}%.
        User Question: {request.message}
        Keep the answer brief, clinical, and supportive.
        """
        response = model.generate_content(context_prompt)
        return {
            "agent": "Gemini Health Mind",
            "response": response.text,
            "action": "none"
        }
    except Exception as e:
        return {
            "agent": "System", 
            "response": "I am operating in offline mode. Please ask about 'scans' or 'doctors'.", 
            "action": "none"
        }

# --- DATA ROUTES ---
@app.post("/api/logs", response_model=schemas.LogResponse)
def log_vitals(log: schemas.LogBase, db: Session = Depends(database.get_db)):
    db_log = models.BehavioralLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    return db_log

@app.get("/api/history", response_model=List[schemas.LogResponse])
def get_history(db: Session = Depends(database.get_db)):
    return db.query(models.BehavioralLog).order_by(models.BehavioralLog.timestamp.desc()).limit(7).all()

@app.post("/api/bookings")
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(database.get_db)):
    db_booking = models.ExpertBooking(**booking.model_dump())
    db.add(db_booking)
    db.commit()
    return {"status": "success"}
