import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
RAW_DIR = BASE_DIR / 'data' / 'raw'
PROCESSED_DIR = BASE_DIR / 'data' / 'processed'
COMBINED_DIR = BASE_DIR / 'data' / 'combined'

PROCESSED_DIR.mkdir(exist_ok=True)
COMBINED_DIR.mkdir(exist_ok=True)


def safe_read_csv(filepath, nrows=None):
    """Safely read CSV with encoding fallback."""
    try:
        return pd.read_csv(filepath, encoding='utf-8', nrows=nrows)
    except:
        return pd.read_csv(filepath, encoding='latin1', nrows=nrows)


def load_nfhs5_districts():
    """
    Process NFHS-5 district health data.
    Contains:
    - Water source
    - Sanitation
    - Diarrhea prevalence
    """

    filepath = RAW_DIR / 'indian_govt' / 'nfhs5_districts_health.csv'

    if not filepath.exists():
        print(f"⚠️ NFHS-5 dataset not found at {filepath}")
        return None

    df = safe_read_csv(filepath)

    print(f"✓ Loaded NFHS-5 data: {len(df)} rows, {len(df.columns)} columns")

    # Clean columns
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(' ', '_')
        .str.replace('(', '', regex=False)
        .str.replace(')', '', regex=False)
        .str.replace('%', 'pct', regex=False)
    )

    print("\n📌 Available Columns:")
    print(df.columns.tolist())

    df_clean = pd.DataFrame()

    # Find district/state columns
    district_cols = [c for c in df.columns if 'district' in c]
    state_cols = [c for c in df.columns if 'state' in c]

    if district_cols:
        df_clean['district'] = df[district_cols[0]]

    if state_cols:
        df_clean['state'] = df[state_cols[0]]

    # Find relevant columns
    water_cols = [c for c in df.columns if 'water' in c or 'drinking' in c]
    diarrhea_cols = [c for c in df.columns if 'diarrh' in c]
    sanitation_cols = [c for c in df.columns if 'sanit' in c or 'toilet' in c]

    print(f"\n✓ Water Columns: {water_cols[:5]}")
    print(f"✓ Diarrhea Columns: {diarrhea_cols[:5]}")
    print(f"✓ Sanitation Columns: {sanitation_cols[:5]}")

    # Initialize
    df_clean['water_source_unsafe_pct'] = 0.0
    df_clean['diarrhea_prevalence'] = 0.0
    df_clean['sanitation_poor_pct'] = 0.0

    # WATER
    for col in water_cols[:2]:
        values = pd.to_numeric(
            df[col].astype(str).str.replace('%', '').str.strip(),
            errors='coerce'
        ).fillna(0)

        df_clean['water_source_unsafe_pct'] += values

    # DIARRHEA
    for col in diarrhea_cols[:2]:
        values = pd.to_numeric(
            df[col].astype(str).str.replace('%', '').str.strip(),
            errors='coerce'
        ).fillna(0)

        df_clean['diarrhea_prevalence'] += values

    # SANITATION
    for col in sanitation_cols[:2]:
        values = pd.to_numeric(
            df[col].astype(str).str.replace('%', '').str.strip(),
            errors='coerce'
        ).fillna(0)

        df_clean['sanitation_poor_pct'] += values

    # Normalize
    if len(water_cols) > 1:
        df_clean['water_source_unsafe_pct'] /= min(2, len(water_cols))

    if len(diarrhea_cols) > 1:
        df_clean['diarrhea_prevalence'] /= min(2, len(diarrhea_cols))

    if len(sanitation_cols) > 1:
        df_clean['sanitation_poor_pct'] /= min(2, len(sanitation_cols))

    # Composite score
    df_clean['health_risk_score'] = (
        df_clean['water_source_unsafe_pct'] * 0.4 +
        df_clean['diarrhea_prevalence'] * 0.4 +
        df_clean['sanitation_poor_pct'] * 0.2
    )

    # Risk labels
    df_clean['risk_label'] = pd.cut(
        df_clean['health_risk_score'],
        bins=[-np.inf, 20, 40, np.inf],
        labels=[0, 1, 2]
    )

    # Synthetic water quality generation
    np.random.seed(42)

    for idx, row in df_clean.iterrows():

        risk = int(row['risk_label']) if pd.notna(row['risk_label']) else 0

        if risk == 0:
            df_clean.at[idx, 'turbidity'] = np.random.normal(3, 1)
            df_clean.at[idx, 'ph'] = np.random.normal(7.1, 0.3)
            df_clean.at[idx, 'nitrates'] = np.random.normal(5, 2)
            df_clean.at[idx, 'dissolved_oxygen'] = np.random.normal(7.5, 1)
            df_clean.at[idx, 'chlorophyll_a'] = np.random.normal(8, 3)
            df_clean.at[idx, 'sulphates'] = np.random.normal(70, 20)
            df_clean.at[idx, 'total_suspended_solids'] = np.random.normal(15, 5)

        elif risk == 1:
            df_clean.at[idx, 'turbidity'] = np.random.normal(15, 4)
            df_clean.at[idx, 'ph'] = np.random.normal(6.5, 0.5)
            df_clean.at[idx, 'nitrates'] = np.random.normal(18, 5)
            df_clean.at[idx, 'dissolved_oxygen'] = np.random.normal(5, 1)
            df_clean.at[idx, 'chlorophyll_a'] = np.random.normal(25, 8)
            df_clean.at[idx, 'sulphates'] = np.random.normal(180, 40)
            df_clean.at[idx, 'total_suspended_solids'] = np.random.normal(50, 15)

        else:
            df_clean.at[idx, 'turbidity'] = np.random.normal(45, 10)
            df_clean.at[idx, 'ph'] = np.random.normal(5.5, 0.8)
            df_clean.at[idx, 'nitrates'] = np.random.normal(50, 12)
            df_clean.at[idx, 'dissolved_oxygen'] = np.random.normal(2, 0.8)
            df_clean.at[idx, 'chlorophyll_a'] = np.random.normal(70, 20)
            df_clean.at[idx, 'sulphates'] = np.random.normal(450, 100)
            df_clean.at[idx, 'total_suspended_solids'] = np.random.normal(130, 30)

    df_clean['data_source'] = 'nfhs5'

    # Drop invalid
    df_clean = df_clean.dropna(subset=['risk_label'])

    output_path = PROCESSED_DIR / 'nfhs5_processed.csv'
    df_clean.to_csv(output_path, index=False)

    print(f"\n✓ Processed NFHS5 rows: {len(df_clean)}")

    print(
        f"✓ Risk Distribution → "
        f"Low={sum(df_clean['risk_label']==0)}, "
        f"Medium={sum(df_clean['risk_label']==1)}, "
        f"High={sum(df_clean['risk_label']==2)}"
    )

    print(f"✓ Saved → {output_path}\n")

    return df_clean


def load_india_water_quality():

    filepath = RAW_DIR / 'kaggle' / 'india_water_quality_measured.csv'

    if not filepath.exists():
        print("⚠️ India water quality dataset missing")
        return None

    df = safe_read_csv(filepath)

    print(f"✓ Loaded India water quality: {len(df)} rows")

    df.columns = df.columns.str.lower().str.replace(' ', '_')

    column_mapping = {
        'temp': 'temperature',
        'do': 'dissolved_oxygen',
        'tds': 'total_suspended_solids',
        'nitrate': 'nitrates',
        'sulphate': 'sulphates',
        'chlorophyll': 'chlorophyll_a',
    }

    df.rename(
        columns={k: v for k, v in column_mapping.items() if k in df.columns},
        inplace=True
    )

    # FIX: convert columns to numeric
    numeric_cols = [
        'ph',
        'turbidity',
        'dissolved_oxygen',
        'nitrates',
        'total_suspended_solids',
        'sulphates',
        'chlorophyll_a'
    ]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(
                df[col].astype(str).str.replace(',', '').str.strip(),
                errors='coerce'
            )

    df['wqi_score'] = 0

    if 'ph' in df.columns:
        df['wqi_score'] += (
            ((df['ph'] < 6.5) | (df['ph'] > 8.5)).astype(int) * 25
        )

    if 'turbidity' in df.columns:
        df['wqi_score'] += (df['turbidity'] > 5).astype(int) * 20

    if 'dissolved_oxygen' in df.columns:
        df['wqi_score'] += (df['dissolved_oxygen'] < 5).astype(int) * 20

    if 'nitrates' in df.columns:
        df['wqi_score'] += (df['nitrates'] > 10).astype(int) * 15

    if 'total_suspended_solids' in df.columns:
        df['wqi_score'] += (
            (df['total_suspended_solids'] > 25).astype(int) * 20
        )

    df['risk_label'] = pd.cut(
        df['wqi_score'],
        bins=[-np.inf, 30, 60, np.inf],
        labels=[0, 1, 2]
    )

    df['data_source'] = 'india_water_measured'

    df = df.dropna(subset=['risk_label'])

    output_path = PROCESSED_DIR / 'india_water_processed.csv'
    df.to_csv(output_path, index=False)

    print(f"✓ Saved → {output_path}\n")

    return df


def load_india_disease_cases():

    filepath = RAW_DIR / 'kaggle' / 'india_disease_cases_statewise.csv'

    if not filepath.exists():
        print("⚠️ Disease dataset missing")
        return None

    # LOAD ONLY FIRST 100K ROWS
    df = safe_read_csv(filepath, nrows=100000)

    print(f"✓ Loaded India disease cases: {len(df)} rows")

    df.columns = df.columns.str.lower().str.replace(' ', '_')

    possible_case_cols = [c for c in df.columns if 'case' in c]

    if not possible_case_cols:
        print("⚠️ No case column found")
        return None

    case_col = possible_case_cols[0]

    df['risk_label'] = pd.cut(
        pd.to_numeric(df[case_col], errors='coerce').fillna(0),
        bins=[-np.inf, 100, 500, np.inf],
        labels=[0, 1, 2]
    )

    df['data_source'] = 'india_disease_cases'

    output_path = PROCESSED_DIR / 'india_disease_processed.csv'
    df.to_csv(output_path, index=False)

    print(f"✓ Saved → {output_path}\n")

    return df


def load_global_correlation():

    filepath = RAW_DIR / 'kaggle' / 'global_water_disease_correlation.csv'

    if not filepath.exists():
        print("⚠️ Global dataset missing")
        return None

    df = safe_read_csv(filepath)

    print(f"✓ Loaded global correlation data: {len(df)} rows")

    df.columns = df.columns.str.lower().str.replace(' ', '_')

    if 'risk_label' not in df.columns:

        disease_cols = [
            c for c in df.columns
            if 'disease' in c or 'diarrhea' in c or 'incidence' in c
        ]

        if disease_cols:

            col = disease_cols[0]

            df['risk_label'] = pd.cut(
                pd.to_numeric(df[col], errors='coerce').fillna(0),
                bins=[-np.inf, 10, 50, np.inf],
                labels=[0, 1, 2]
            )
        else:
            df['risk_label'] = 0

    df['data_source'] = 'global_correlation'

    output_path = PROCESSED_DIR / 'global_correlation_processed.csv'
    df.to_csv(output_path, index=False)

    print(f"✓ Saved → {output_path}\n")

    return df


def process_all():

    print("=" * 70)
    print("WATERBORNE DISEASE MONITORING — DATA PROCESSING")
    print("=" * 70)

    nfhs = load_nfhs5_districts()
    water = load_india_water_quality()
    disease = load_india_disease_cases()
    global_df = load_global_correlation()

    loaded = [df for df in [nfhs, water, disease, global_df] if df is not None]

    if not loaded:
        print("❌ No datasets loaded")
        return

    combined = pd.concat(loaded, ignore_index=True)

    print(f"\n✓ Combined dataset rows: {len(combined)}")

    output_path = COMBINED_DIR / 'final_training_data.csv'

    combined.to_csv(output_path, index=False)

    print(f"✅ Final dataset saved → {output_path}")

    print("\n✅ PIPELINE COMPLETED SUCCESSFULLY")


if __name__ == '__main__':
    process_all()