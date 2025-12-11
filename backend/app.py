from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SCO Assistant Backend")

# ✅ Permitir conexión desde la extensión de Chrome
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# ✅ MODELOS
# ==========================
class SCORequest(BaseModel):
    text: str


# ==========================
# ✅ ENDPOINT PRINCIPAL
# ==========================
@app.get("/")
def root():
    return {"status": "ok", "message": "SCO Assistant backend running"}


# ==========================
# ✅ HEALTH CHECK (TU ERROR)
# ==========================
@app.get("/api/health")
def health():
    return {"status": "healthy", "server": "local"}


# ==========================
# ✅ ANALYSIS ENDPOINT
# ==========================
@app.post("/api/analyze")
def analyze_sco(data: SCORequest):
    text = data.text.lower()

    red_flags = []
    score = 100

    suspicious_keywords = [
        "trial shipment",
        "only soft copy",
        "no inspection",
        "private mandate",
        "non circumvention",
        "swift mt103 before bl",
        "100% upfront",
        "no refund",
    ]

    for word in suspicious_keywords:
        if word in text:
            red_flags.append(word)
            score -= 10

    if score < 0:
        score = 0

    return {
        "risk_score": score,
        "red_flags": red_flags,
        "verdict": "HIGH RISK" if score < 60 else "MEDIUM RISK" if score < 85 else "LOW RISK"
    }
