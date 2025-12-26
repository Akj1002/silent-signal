from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
import google.generativeai as genai
import os

# --- CONFIGURATION ---
# PASTE YOUR NEW API KEY HERE (The one starting with Alza...)
API_KEY = "AIzaSyAA7XNeyZLEL-y1qT5usFcl5gN2YEEF0f8" 
genai.configure(api_key=API_KEY)

# --- SMART MODEL SELECTOR ---
# This function tries the models found in your list, starting with the fastest.
def get_working_model():
    candidates = [
        "gemini-flash-latest",          # FASTEST (Best for Chat)
        "gemini-2.5-flash-lite",        # Very fast, lightweight
        "gemini-pro-latest",            # Smarter, slightly slower
        "gemini-3-flash-preview",       # Bleeding edge
        "gemini-1.5-flash",             # Fallback
        "gemini-pro"                    # Oldest fallback
    ]
    
    print("🔄 Connecting to Neural Mesh...")
    for model_name in candidates:
        try:
            model = genai.GenerativeModel(model_name)
            # Test connection with a tiny prompt
            model.generate_content("test")
            print(f"✅ SUCCESS: Connected to '{model_name}'")
            return model
        except Exception:
            continue
    
    print("⚠️ WARNING: Could not connect to primary models. Checking available list...")
    return genai.GenerativeModel("gemini-pro") # Final Fallback

# Initialize the AI
model = get_working_model()

app = FastAPI(title="Silent Signal Hybrid Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database.Base.metadata.create_all(bind=database.engine)

@app.get("/health")
def health():
    return {"status": "Hybrid Neural Mesh Online"}

@app.post("/api/agent/chat")
async def agent_logic(request: schemas.AgentRequest):
    msg = request.message.lower()
    vitals = request.vitals
    
    # --- LAYER 1: APP CONTROLS (Deterministic) ---
    if any(word in msg for word in ["scan", "measure", "pacer", "heart", "pulse"]):
        return {"agent": "Behavioral Agent", "response": "Opening Relief Pacer...", "action": "trigger_pacer"}
    
    if any(word in msg for word in ["doctor", "psychiatrist", "appointment", "booking"]):
        return {"agent": "Scheduler Agent", "response": "Opening Expert Nodes...", "action": "open_experts"}
    
    if any(word in msg for word in ["pharmacy", "medicine", "pill", "supplement"]):
        return {"agent": "Pharmacy Agent", "response": "Opening Pharmacy...", "action": "open_pharmacy"}

    # --- LAYER 2: MEDICAL AI (Generative) ---
    try:
        context_prompt = f"""
        You are Silent Signal, an empathetic medical AI assistant.
        User Vitals: Heart Rate {vitals.get('hr', 'N/A')} BPM, Anxiety {vitals.get('anxiety', 'N/A')}%.
        User Question: "{request.message}"
        
        Instructions:
        1. Keep response under 50 words.
        2. Be clinical yet comforting.
        3. If asking about diet, mention specific foods (e.g., dark chocolate, berries).
        """
        
        response = model.generate_content(context_prompt)
        return {"agent": "Dr. AI", "response": response.text, "action": "none"}
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "agent": "System", 
            "response": "I am operating in offline mode. Please check your internet connection.", 
            "action": "none"
        }

# --- DATABASE ROUTES ---
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
