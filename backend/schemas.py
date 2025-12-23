from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LogBase(BaseModel):
    hr: int
    br: int
    anxiety_score: int
    cognitive_load: int
    status: str

class LogResponse(LogBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class AgentRequest(BaseModel):
    message: str
    vitals: dict

class BookingCreate(BaseModel):
    expert_name: str
    consultation_date: str