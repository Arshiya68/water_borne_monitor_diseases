import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib, os

BASE        = os.path.dirname(__file__)
SCALER_PATH = os.path.join(BASE, '../../../data/models/scaler.pkl')

WATER_FEATURES = [
    'turbidity', 'chlorophyll_a', 'nitrates',
    'sulphates', 'ph', 'dissolved_oxygen', 'total_suspended_solids'
]
SYMPTOM_FEATURES = [
    'diarrhea', 'vomiting', 'fever',
    'abdominal_pain', 'dehydration',
    'water_source', 'household_affected', 'age_group',
    'symptom_duration'
]

def preprocess_for_training(df):
    X = df.copy()

    for col in WATER_FEATURES:
        if col not in X.columns:
            X[col] = 0
        X[col] = pd.to_numeric(X[col], errors='coerce')
        X[col] = X[col].fillna(X[col].median() if X[col].notna().any() else 0)

    for col in SYMPTOM_FEATURES:
        if col not in X.columns:
            X[col] = 0
        X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0).astype(int)

    scaler = StandardScaler()
    X[WATER_FEATURES] = scaler.fit_transform(X[WATER_FEATURES])

    joblib.dump(scaler, SCALER_PATH)

    return X[WATER_FEATURES + SYMPTOM_FEATURES].reset_index(drop=True)

def preprocess_for_inference(input_dict):
    scaler = joblib.load(SCALER_PATH)

    water_vals = pd.DataFrame(
        [[float(input_dict.get(f, 0) or 0) for f in WATER_FEATURES]],
        columns=WATER_FEATURES,
    )
    symptom_vals = pd.DataFrame(
        [[int(input_dict.get(f, 0) or 0) for f in SYMPTOM_FEATURES]],
        columns=SYMPTOM_FEATURES,
    )

    water_scaled = pd.DataFrame(scaler.transform(water_vals), columns=WATER_FEATURES)
    return pd.concat([water_scaled, symptom_vals], axis=1)