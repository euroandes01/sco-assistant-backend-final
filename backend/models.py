# models.py - pydantic models (simple)
from pydantic import BaseModel
from typing import List, Optional, Any

class Product(BaseModel):
    title: str
    min: Optional[str]
    max: Optional[str]
    fob: Optional[str]
    cif: Optional[str]
    net: Optional[str]
    gross: Optional[str]
    commission: Optional[str]
    raw: Optional[str]

class SCOReport(BaseModel):
    raw: Optional[str]
    header: Optional[dict]
    products: List[Product]
    procedures: List[str]
    red_flags: List[str]
    risk_score: int
    recommendation: str
