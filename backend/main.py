from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import models, schemas, database
import google.generativeai as genai
import os
import base64
from dotenv import load_dotenv

# --- MICROSOFT AZURE IMPORTS ---
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
import azure.cognitiveservices.speech as speechsdk

# --- CONFIGURATION ---
load_dotenv()

# 1. Google Gemini Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# 2. Azure Language Setup
language_key = os.getenv("AZURE_LANGUAGE_KEY")
language_endpoint = os.getenv("AZURE_LANGUAGE_ENDPOINT")

def authenticate_azure_language():
    if not language_key or not language_endpoint:
        return None
    credential = AzureKeyCredential(language_key)
    return TextAnalyticsClient(endpoint=language_endpoint, credential=credential)

azure_client = authenticate_azure_language()

# 3. Azure Speech Setup
speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")

# --- MODEL SETUP (FIXED) ---
# Switching to "gemini-flash-latest" as it is in your available list and stable
MODEL_NAME = "models/gemini-flash-latest"

try:
    model = genai.GenerativeModel(MODEL_NAME)
    print(f"✅ Gemini Model Selected: {MODEL_NAME}")
except Exception as e:
    print(f"❌ Error setting up Gemini: {e}")

app = FastAPI(title="Silent Signal Hybrid Agent")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
database.Base.metadata.create_all(bind=database.engine)

# --- SCHEMAS ---
class ChatRequest(BaseModel):
    message: str
    vitals: dict

class OrderRequest(BaseModel):
    items: List[dict]
    total: float
    payment_method: str

# --- HEALTH CHECK ---
@app.get("/health")
def health():
    return {"status": "Online", "model": MODEL_NAME}

# --- 1. THE BRAIN: CHAT + SENTIMENT + AUDIO ---
@app.post("/api/agent/chat")
async def agent_logic(request: ChatRequest):
    msg = request.message
    vitals = request.vitals
    
    print(f"📩 Received Message: {msg}")

    # A. AZURE SENTIMENT ANALYSIS
    detected_sentiment = "Neutral"
    if azure_client:
        try:
            documents = [msg]
            result = azure_client.analyze_sentiment(documents, show_opinion_mining=False)
            docs = [doc for doc in result if not doc.is_error]
            if docs:
                detected_sentiment = docs[0].sentiment
                print(f"🧠 Azure Sentiment: {detected_sentiment.upper()}")
        except Exception as e:
            print(f"⚠️ Azure Sentiment Warning: {e}")

    # B. GOOGLE GEMINI INTELLIGENCE
    try:
        context_prompt = f"""
        You are Dr. AI, a specialist in mental health.
        
        PATIENT VITALS:
        - Heart Rate: {vitals.get('hr', 'N/A')} BPM
        - Anxiety Level: {vitals.get('anxiety', '0')}%
        - Emotional State (Detected by Azure): {detected_sentiment.upper()}
        
        USER QUERY: "{msg}"
        
        INSTRUCTIONS:
        1. Keep response concise (max 2-3 sentences).
        2. Be empathetic but clinical.
        3. If anxiety is high (>50%), recommend breathing exercises immediately.
        """
        
        # Call Gemini
        response = model.generate_content(context_prompt)
        ai_text = response.text
        print(f"🤖 AI Response: {ai_text}")

        # C. AZURE TEXT-TO-SPEECH (Generate Audio)
        audio_base64 = None
        if speech_key and speech_region:
            try:
                speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
                speech_config.speech_synthesis_voice_name='en-US-JennyNeural' 
                speech_config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm)
                synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
                
                result = synthesizer.speak_text_async(ai_text).get()
                
                if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                    audio_base64 = base64.b64encode(result.audio_data).decode('utf-8')
                    print("🔊 Azure Speech: Audio Generated")
            except Exception as e:
                print(f"⚠️ Speech Warning: {e}")

        return {
            "agent": "Dr. AI", 
            "response": ai_text, 
            "audio": audio_base64,
            "sentiment": detected_sentiment
        }
        
    except Exception as e:
        # CRITICAL FIX: Return the ACTUAL error to the Frontend
        error_msg = str(e)
        print(f"❌ AI CRITICAL ERROR: {error_msg}")
        return {
            "agent": "System", 
            "response": f"System Error: {error_msg} (Check Server Logs)", 
            "action": "none"
        }

# --- 2. LOGGING VITALS ---
@app.post("/api/logs", response_model=schemas.LogResponse)
def log_vitals(log: schemas.LogBase, db: Session = Depends(database.get_db)):
    db_log = models.BehavioralLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    return db_log

@app.get("/api/history", response_model=List[schemas.LogResponse])
def get_history(db: Session = Depends(database.get_db)):
    return db.query(models.BehavioralLog).order_by(models.BehavioralLog.timestamp.desc()).limit(7).all()

# --- 3. BOOKING ---
@app.post("/api/bookings")
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(database.get_db)):
    print(f"📅 Booking: {booking}")
    db_booking = models.ExpertBooking(**booking.model_dump())
    db.add(db_booking)
    db.commit()
    return {"status": "confirmed"}

# --- 4. PHARMACY ORDERS ---
@app.post("/api/orders")
def place_order(order: OrderRequest):
    print(f"🛒 Order Received: ${order.total}")
    return {"status": "success"}