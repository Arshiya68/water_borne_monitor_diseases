import joblib
import numpy as np
import os
from datetime import datetime
from .preprocess import preprocess_for_inference

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../../data/models/outbreak_model.pkl')
RISK_LABELS = {0: 'Low', 1: 'Medium', 2: 'High'}

def calculate_water_quality_score(input_dict):
    turbidity = float(input_dict.get('turbidity', 0) or 0)
    ph = float(input_dict.get('ph', 7) or 7)
    nitrates = float(input_dict.get('nitrates', 0) or 0)
    dissolved_oxygen = float(input_dict.get('dissolved_oxygen', 0) or 0)
    sulphates = float(input_dict.get('sulphates', 0) or 0)
    total_suspended_solids = float(input_dict.get('total_suspended_solids', 0) or 0)

    score = 100
    score -= max(0, (turbidity - 5) * 2)
    score -= max(0, abs(ph - 7) * 5)
    score -= max(0, (nitrates - 10) * 1.5)
    score -= max(0, (8 - dissolved_oxygen) * 5)
    score -= max(0, (sulphates - 100) * 0.2)
    score -= max(0, (total_suspended_solids - 20) * 0.1)

    return max(0, min(100, score))


SYMPTOM_FEATURES = ['diarrhea', 'vomiting', 'fever', 'abdominal_pain', 'dehydration']


def calculate_symptom_risk(input_dict):
    symptom_count = sum(int(input_dict.get(symptom, 0) or 0) for symptom in SYMPTOM_FEATURES)
    duration = float(input_dict.get('symptom_duration', 0) or 0)
    household_affected = float(input_dict.get('household_affected', 1) or 1)

    symptom_score = min(
        100,
        (symptom_count * 18) +
        min(30, duration * 4) +
        min(30, household_affected * 3)
    )

    return {
        'symptom_count': symptom_count,
        'symptom_score': symptom_score,
        'symptom_duration': duration,
        'household_affected': household_affected,
    }


def derive_rule_risk(water_quality_score, symptom_score):
    rule_score = (100 - water_quality_score) * 0.55 + (symptom_score * 0.45)

    if rule_score >= 65:
        return 'High', rule_score
    if rule_score >= 42:
        return 'Medium', rule_score
    return 'Low', rule_score


def override_risk(model_risk, model_confidence, rule_risk, water_quality_score, symptom_count):
    if model_risk == 'Low':
        if rule_risk == 'High' and (model_confidence < 0.92 or water_quality_score < 40):
            return 'High'
        if rule_risk == 'Medium' and (model_confidence < 0.90 or (water_quality_score < 50 and symptom_count >= 2)):
            return 'Medium'
    if model_risk == 'Medium' and rule_risk == 'High' and model_confidence < 0.95:
        return 'High'
    return model_risk


def predict_risk(input_dict):
    """
    Predict outbreak risk based on water quality + symptoms
    Returns comprehensive prediction with confidence
    """
    try:
        model = joblib.load(MODEL_PATH)
        features = preprocess_for_inference(input_dict)
        
        class_index = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]
        
        model_risk = RISK_LABELS[class_index]
        confidence = float(max(probabilities))
        water_quality_score = calculate_water_quality_score(input_dict)
        symptom_info = calculate_symptom_risk(input_dict)
        rule_risk, rule_score = derive_rule_risk(water_quality_score, symptom_info['symptom_score'])
        final_risk = override_risk(
            model_risk,
            confidence,
            rule_risk,
            water_quality_score,
            symptom_info['symptom_count'],
        )

        return {
            'risk_level': final_risk,
            'model_risk_level': model_risk,
            'rule_risk_level': rule_risk,
            'adjusted': final_risk != model_risk,
            'rule_score': float(rule_score),
            'class_index': class_index,
            'probability': confidence,
            'probabilities': {
                'low': float(probabilities[0]),
                'medium': float(probabilities[1]),
                'high': float(probabilities[2]),
            },
            'water_quality_score': water_quality_score,
            'symptom_score': symptom_info['symptom_score'],
            'symptom_count': symptom_info['symptom_count'],
            'model_version': '1.0',
            'timestamp': datetime.utcnow().isoformat(),
        }
    except Exception as e:
        print(f"Prediction error, falling back to rule-based: {e}")
        try:
            water_quality_score = calculate_water_quality_score(input_dict)
            symptom_info = calculate_symptom_risk(input_dict)
            rule_risk, rule_score = derive_rule_risk(water_quality_score, symptom_info['symptom_score'])
            
            # Estimate probability using rule score
            prob = min(0.99, max(0.01, rule_score / 100.0))
            
            # Map rule_risk to class_index
            # RISK_LABELS = {0: 'Low', 1: 'Medium', 2: 'High'}
            risk_to_idx = {'Low': 0, 'Medium': 1, 'High': 2}
            class_index = risk_to_idx.get(rule_risk, 0)
            
            probs = [0.0, 0.0, 0.0]
            probs[class_index] = prob
            remaining = 1.0 - prob
            for idx in range(3):
                if idx != class_index:
                    probs[idx] = remaining / 2.0

            return {
                'risk_level': rule_risk,
                'model_risk_level': 'RuleFallback',
                'rule_risk_level': rule_risk,
                'adjusted': False,
                'rule_score': float(rule_score),
                'class_index': class_index,
                'probability': prob,
                'probabilities': {
                    'low': float(probs[0]),
                    'medium': float(probs[1]),
                    'high': float(probs[2]),
                },
                'water_quality_score': water_quality_score,
                'symptom_score': symptom_info['symptom_score'],
                'symptom_count': symptom_info['symptom_count'],
                'model_version': '1.0-rule-fallback',
                'timestamp': datetime.utcnow().isoformat(),
                'error': str(e),
            }
        except Exception as fallback_err:
            print(f"Severe fallback error: {fallback_err}")
            return {
                'risk_level': 'Low',
                'model_risk_level': 'Error',
                'rule_risk_level': 'Low',
                'adjusted': False,
                'rule_score': 0.0,
                'class_index': 0,
                'probability': 0.0,
                'probabilities': {'low': 1.0, 'medium': 0.0, 'high': 0.0},
                'water_quality_score': 50.0,
                'symptom_score': 0.0,
                'symptom_count': 0,
                'model_version': 'error-fallback',
                'timestamp': datetime.utcnow().isoformat(),
                'error': f"{e} | fallback_err: {fallback_err}",
            }

def calculate_village_risk(village_name, water_quality_data, symptom_reports):
    """
    Calculate composite risk score for entire village
    Uses both water quality and symptom data
    """
    
    water_score = 0
    if water_quality_data:
        wq = water_quality_data
        water_score = 100 - (wq.get('water_quality_index', 50))
    
    symptom_score = 0
    if symptom_reports:
        symptom_score = (len(symptom_reports) / 100) * 50  # Up to 50 points
    
    # Weighted composite score
    final_score = (water_score * 0.6) + (symptom_score * 0.4)
    
    if final_score > 70:
        risk = 'High'
    elif final_score > 40:
        risk = 'Medium'
    else:
        risk = 'Low'
    
    return {
        'village': village_name,
        'composite_score': min(100, final_score),
        'water_quality_contribution': water_score,
        'symptom_contribution': symptom_score,
        'predicted_risk': risk,
        'confidence': min(final_score / 100, 1.0),
    }