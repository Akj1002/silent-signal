from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
import google.generativeai as genai
import os
from dotenv import load_dotenv

from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
import azure.cognitiveservices.speech as speechsdk

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

language_key = os.getenv("AZURE_LANGUAGE_KEY")
language_endpoint = os.getenv("AZURE_LANGUAGE_ENDPOINT")

def authenticate_azure_language():
    if not language_key or not language_endpoint:
        return None
    credential = AzureKeyCredential(language_key)
    return TextAnalyticsClient(endpoint=language_endpoint, credential=credential)

azure_client = authenticate_azure_language()

speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")

def get_working_model():
    candidates = [
        "models/gemini-flash-latest",     
        "models/gemini-1.5-flash",         
        "models/gemini-pro",               
        "gemini-1.5-flash",                
        "gemini-pro"                       
    ]
    for model_name in candidates:
        try:
            model = genai.GenerativeModel(model_name)
            model.generate_content("test")
            print(f"✅ Neural Mesh Linked: {model_name}")
            return model
        except:
            continue
    return genai.GenerativeModel("gemini-pro")

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
    return {"status": "Hybrid Neural Mesh Online (Google + Microsoft Azure)"}

@app.post("/api/agent/chat")
async def agent_logic(request: schemas.AgentRequest):
    msg = request.message
    vitals = request.vitals
    

    detected_sentiment = "Unknown"
    confidence_scores = {}
    
    if azure_client:
        try:
           
            documents = [msg]
            result = azure_client.analyze_sentiment(documents, show_opinion_mining=False)
            docs = [doc for doc in result if not doc.is_error]
            if docs:
                detected_sentiment = docs[0].sentiment  # "positive", "negative", "neutral"
                print(f"🧠 Azure Analysis: User is feeling {detected_sentiment.upper()}")
        except Exception as e:
            print(f"Azure Error: {e}")

  
    try:
    
        context_prompt = f"""
        You are Dr. AI, an empathetic specialist.
        User Status:
        - Heart Rate: {vitals.get('hr', 'N/A')} BPM
        - Anxiety Level: {vitals.get('anxiety', 'N/A')}%
        - AI Detected Emotion (Azure): {detected_sentiment.upper()}
        
        User Query: "{msg}"
        
        Instructions:
        1. Keep response under 50 words.
        2. Acknowledge their emotion ({detected_sentiment}) subtly.
        3. Be comforting and clinical.
        """
        
        response = model.generate_content(context_prompt)
        ai_text = response.text

       
        if speech_key and speech_region:
            try:
                speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
                speech_config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm)
                synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
                
                result = synthesizer.speak_text_async(ai_text).get()
                print("🔊 Azure Speech: Voice synthesis generated successfully.")
            except Exception as e:
                print(f"Speech Error: {e}")

        return {"agent": "Dr. AI (Azure+Gemini)", "response": ai_text, "action": "none"}
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {"agent": "System", "response": "Offline Mode", "action": "none"}


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