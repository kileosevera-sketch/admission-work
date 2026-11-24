from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
import io
import os

app = FastAPI(title="V3RA Student Admission Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

backend_dir = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(backend_dir, "final_student_admission_model.pkl"), "rb") as model_file:
    model = pickle.load(model_file)

with open(os.path.join(backend_dir, "scaler.pkl"), "rb") as scaler_file:
    scaler = pickle.load(scaler_file)


class StudentScores(BaseModel):
    score1: float
    score2: float


@app.get("/")
def home():
    return {"message": "V3RA Admission Prediction API is running!"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
    }


@app.post("/predict")
def predict(data: StudentScores):
    features = np.array([[data.score1, data.score2]])
    scaled_features = scaler.transform(features)

    prediction = model.predict(scaled_features)[0]
    probabilities = model.predict_proba(scaled_features)[0]

    status = "Admitted" if int(prediction) == 1 else "Rejected"
    confidence = float(probabilities[1] if int(prediction) == 1 else probabilities[0]) * 100

    return {
        "status": status,
        "confidence": round(confidence, 2),
        "probability_admitted": round(float(probabilities[1]) * 100, 2),
    }


@app.post("/predict-batch")
async def predict_batch(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {exc}")

    df.columns = [column.strip() for column in df.columns]
    col_map = {column.lower(): column for column in df.columns}

    if "score1" not in col_map or "score2" not in col_map:
        raise HTTPException(
            status_code=422,
            detail=f"CSV must contain 'Score1' and 'Score2' columns. Found columns: {list(df.columns)}",
        )

    score1_col = col_map["score1"]
    score2_col = col_map["score2"]

    df = df.dropna(subset=[score1_col, score2_col])
    if df.empty:
        raise HTTPException(status_code=422, detail="No valid rows found after dropping missing values.")

    try:
        df[score1_col] = df[score1_col].astype(float)
        df[score2_col] = df[score2_col].astype(float)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=f"Non-numeric value in Score columns: {exc}")

    features = df[[score1_col, score2_col]].values
    scaled_features = scaler.transform(features)
    predictions = model.predict(scaled_features)
    probabilities = model.predict_proba(scaled_features)

    results = []
    for idx, (pred, proba) in enumerate(zip(predictions, probabilities)):
        label = "Admitted" if int(pred) == 1 else "Rejected"
        prob_admitted = float(proba[1])
        confidence = float(proba[1] if int(pred) == 1 else proba[0]) * 100
        results.append({
            "id": idx + 1,
            "score1": round(float(features[idx][0]), 4),
            "score2": round(float(features[idx][1]), 4),
            "prediction": label,
            "confidence": round(confidence, 2),
            "probability_admitted": round(prob_admitted * 100, 2),
        })

    total = len(results)
    admitted = sum(1 for result in results if result["prediction"] == "Admitted")
    rejected = total - admitted
    admission_rate = round((admitted / total) * 100, 2) if total > 0 else 0.0

    return {
        "summary": {
            "total": total,
            "admitted": admitted,
            "rejected": rejected,
            "admission_rate": admission_rate,
        },
        "results": results,
    }
