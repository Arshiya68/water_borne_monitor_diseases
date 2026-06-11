import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report
from sklearn.utils.class_weight import compute_sample_weight
import joblib, os
from .preprocess import preprocess_for_training

MODEL_PATH = os.path.join(os.path.dirname(__file__),
                          '../../../data/models/outbreak_model.pkl')
COMBINED_PATH = os.path.join(os.path.dirname(__file__),
                             '../../../data/combined/final_training_data.csv')

def generate_synthetic_data(n=3000):
    np.random.seed(42)
    rows = []
    for _ in range(n):
        risk = np.random.choice([0,1,2], p=[0.65,0.25,0.10])
        if risk == 0:
            r = dict(turbidity=np.random.normal(2,.5),
                     chlorophyll_a=np.random.normal(5,1),
                     nitrates=np.random.normal(3,.5),
                     sulphates=np.random.normal(50,10),
                     ph=np.random.normal(7.2,.3),
                     dissolved_oxygen=np.random.normal(8,.5),
                     total_suspended_solids=np.random.normal(10,3),
                     diarrhea=np.random.choice([0,1],p=[.9,.1]),
                     vomiting=np.random.choice([0,1],p=[.95,.05]),
                     fever=np.random.choice([0,1],p=[.9,.1]),
                     abdominal_pain=np.random.choice([0,1],p=[.92,.08]),
                     dehydration=np.random.choice([0,1],p=[.97,.03]),
                     water_source=np.random.choice([0,1]),
                     household_affected=np.random.randint(1,3),
                     age_group=np.random.randint(0,3),
                     symptom_duration=np.random.randint(1, 3),
                     risk_label=0)
        elif risk == 1:
            r = dict(turbidity=np.random.normal(12,3),
                     chlorophyll_a=np.random.normal(20,5),
                     nitrates=np.random.normal(15,3),
                     sulphates=np.random.normal(150,30),
                     ph=np.random.normal(6.5,.5),
                     dissolved_oxygen=np.random.normal(5,1),
                     total_suspended_solids=np.random.normal(45,10),
                     diarrhea=np.random.choice([0,1],p=[.5,.5]),
                     vomiting=np.random.choice([0,1],p=[.6,.4]),
                     fever=np.random.choice([0,1],p=[.5,.5]),
                     abdominal_pain=np.random.choice([0,1],p=[.55,.45]),
                     dehydration=np.random.choice([0,1],p=[.7,.3]),
                     water_source=np.random.choice([1,2,3]),
                     household_affected=np.random.randint(2,6),
                     age_group=np.random.randint(0,3),
                     symptom_duration=np.random.randint(2, 5),
                     risk_label=1)
        else:
            r = dict(turbidity=np.random.normal(40,10),
                     chlorophyll_a=np.random.normal(60,15),
                     nitrates=np.random.normal(45,10),
                     sulphates=np.random.normal(400,80),
                     ph=np.random.normal(5.5,.8),
                     dissolved_oxygen=np.random.normal(2,.8),
                     total_suspended_solids=np.random.normal(120,30),
                     diarrhea=np.random.choice([0,1],p=[.1,.9]),
                     vomiting=np.random.choice([0,1],p=[.2,.8]),
                     fever=np.random.choice([0,1],p=[.15,.85]),
                     abdominal_pain=np.random.choice([0,1],p=[.15,.85]),
                     dehydration=np.random.choice([0,1],p=[.2,.8]),
                     water_source=np.random.choice([2,3]),
                     household_affected=np.random.randint(5,15),
                     age_group=np.random.randint(0,3),
                     symptom_duration=np.random.randint(3, 7),
                     risk_label=2)
        rows.append(r)
    return pd.DataFrame(rows)


def load_combined_training_data():
    if not os.path.exists(COMBINED_PATH):
        return None

    df = pd.read_csv(COMBINED_PATH)
    if 'chlorophyll' in df.columns and 'chlorophyll_a' not in df.columns:
        df['chlorophyll_a'] = df['chlorophyll']

    for col in [
        'turbidity', 'chlorophyll_a', 'nitrates',
        'sulphates', 'ph', 'dissolved_oxygen', 'total_suspended_solids',
    ]:
        if col not in df.columns:
            df[col] = np.nan

    if 'risk_label' not in df.columns:
        if 'health_risk_score' in df.columns:
            df['risk_label'] = pd.cut(
                pd.to_numeric(df['health_risk_score'], errors='coerce').fillna(0),
                bins=[-1, 33, 66, 100], labels=[0, 1, 2]
            ).astype(int)
        else:
            df['risk_label'] = 0

    if 'diarrhea' not in df.columns:
        prevalence = df.get('diarrhea_prevalence', pd.Series(0, index=df.index))
        df['diarrhea'] = (pd.to_numeric(prevalence, errors='coerce').fillna(0) > 5).astype(int)

    for col in ['vomiting', 'fever', 'abdominal_pain', 'dehydration']:
        if col not in df.columns:
            df[col] = (pd.to_numeric(df['risk_label'], errors='coerce').fillna(0).astype(int) >= 1).astype(int)

    if 'water_source' not in df.columns:
        if 'water_source_type' in df.columns:
            mapping = {'Tap': 0, 'Borewell': 1, 'Tank': 2, 'River': 3, 'Pond': 2}
            df['water_source'] = df['water_source_type'].map(mapping).fillna(0).astype(int)
        else:
            df['water_source'] = np.random.choice([0, 1, 2, 3], size=len(df))

    if 'household_affected' not in df.columns:
        df['household_affected'] = np.maximum(
            1,
            pd.to_numeric(df.get('population_density', pd.Series(1, index=df.index)), errors='coerce').fillna(1).astype(int)
        )

    if 'age_group' not in df.columns:
        df['age_group'] = np.random.randint(0, 3, size=len(df))

    if 'symptom_duration' not in df.columns:
        df['symptom_duration'] = np.random.randint(1, 7, size=len(df))

    return df


def train_model():
    print('Loading training data...')
    df = load_combined_training_data()
    if df is None or df.empty:
        print('Combined dataset not found or empty. Falling back to synthetic data.')
        df = generate_synthetic_data(3000)
    else:
        print(f'Using combined dataset with {len(df)} rows.')

    y = pd.to_numeric(df['risk_label'], errors='coerce').fillna(0).astype(int)
    X = preprocess_for_training(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    sw = compute_sample_weight('balanced', y_train)
    model = GradientBoostingClassifier(
        n_estimators=250, learning_rate=0.08,
        max_depth=5, random_state=42)

    print('Training model...')
    model.fit(X_train, y_train, sample_weight=sw)

    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred,
          target_names=['Low', 'Medium', 'High']))

    cv = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f'CV Accuracy: {cv.mean():.3f} ± {cv.std():.3f}')

    joblib.dump(model, MODEL_PATH)
    print(f'Model saved -> {MODEL_PATH}')

if __name__ == '__main__':
    train_model()