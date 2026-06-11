from app.ml.predict import predict_risk

test_cases = [
    {
        'turbidity': 1, 'ph': 7.0, 'nitrates': 2, 'sulphates': 40,
        'dissolved_oxygen': 8, 'total_suspended_solids': 5,
        'diarrhea': 0, 'vomiting': 0, 'fever': 0, 'abdominal_pain': 0,
        'dehydration': 0, 'water_source': 0, 'household_affected': 1,
        'age_group': 1, 'symptom_duration': 1,
    },
    {
        'turbidity': 50, 'ph': 5.2, 'nitrates': 50, 'sulphates': 450,
        'dissolved_oxygen': 2, 'total_suspended_solids': 120,
        'diarrhea': 1, 'vomiting': 1, 'fever': 1, 'abdominal_pain': 1,
        'dehydration': 1, 'water_source': 3, 'household_affected': 10,
        'age_group': 2, 'symptom_duration': 6,
    },
    {
        'turbidity': 15, 'ph': 6.5, 'nitrates': 18, 'sulphates': 180,
        'dissolved_oxygen': 4, 'total_suspended_solids': 50,
        'diarrhea': 1, 'vomiting': 0, 'fever': 1, 'abdominal_pain': 0,
        'dehydration': 0, 'water_source': 2, 'household_affected': 4,
        'age_group': 1, 'symptom_duration': 3,
    },
]

for i, case in enumerate(test_cases, 1):
    result = predict_risk(case)
    print(f"CASE {i}: risk={result['risk_level']} prob={result['probability']:.4f} wq={result['water_quality_score']}")
