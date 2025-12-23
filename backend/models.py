from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base

class BehavioralLog(Base):
    __tablename__ = "behavioral_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    hr = Column(Integer)
    br = Column(Integer)
    anxiety_score = Column(Integer)
    cognitive_load = Column(Integer)
    status = Column(String)

class ExpertBooking(Base):
    __tablename__ = "expert_bookings"
    id = Column(Integer, primary_key=True, index=True)
    expert_name = Column(String)
    consultation_date = Column(String)
    user_name = Column(String, default="Abhinav Jha")