from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
import database 

class BehavioralLog(database.Base):
    __tablename__ = "behavioral_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    hr = Column(Integer)
    br = Column(Integer)
    anxiety_score = Column(Integer)
    status = Column(String)

class ExpertBooking(database.Base):
    __tablename__ = "expert_bookings"
    id = Column(Integer, primary_key=True, index=True)
    expert_name = Column(String)
    consultation_date = Column(String)
    user_name = Column(String, default="Abhinav")