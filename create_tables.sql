-- Database creation command (Run in MySQL Workbench first)
CREATE DATABASE IF NOT EXISTS waterborne_db;
USE waterborne_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'villager',
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Telangana',
    latitude DOUBLE DEFAULT 17.3850,
    longitude DOUBLE DEFAULT 78.4867,
    prefer_sms BOOLEAN DEFAULT TRUE,
    prefer_email BOOLEAN DEFAULT TRUE,
    age INT,
    gender VARCHAR(20),
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_phone (phone),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Water Quality Table
CREATE TABLE IF NOT EXISTS water_quality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    recorded_year INT NOT NULL,
    recorded_month INT NOT NULL,
    turbidity DOUBLE DEFAULT 0,
    chlorophyll_a DOUBLE DEFAULT 0,
    nitrates DOUBLE DEFAULT 0,
    sulphates DOUBLE DEFAULT 0,
    ph_level DOUBLE DEFAULT 7.0,
    dissolved_oxygen DOUBLE DEFAULT 6.0,
    total_suspended_solids DOUBLE DEFAULT 0,
    water_quality_index DOUBLE DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wq_location (village, district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Notifications (EWS Alerts) Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Telangana',
    risk_level VARCHAR(20) DEFAULT 'High',
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_location (village, district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Symptom Reports Table
CREATE TABLE IF NOT EXISTS symptom_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    villager_name VARCHAR(100),
    villager_age INT,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    diarrhea INT DEFAULT 0,
    vomiting INT DEFAULT 0,
    fever INT DEFAULT 0,
    abdominal_pain INT DEFAULT 0,
    dehydration INT DEFAULT 0,
    nausea INT DEFAULT 0,
    blood_in_stool INT DEFAULT 0,
    skin_infection INT DEFAULT 0,
    other_symptoms TEXT,
    diarrhea_severity INT DEFAULT 1,
    fever_severity INT DEFAULT 1,
    water_source INT DEFAULT 0,
    household_affected INT DEFAULT 1,
    age_group INT DEFAULT 1,
    predicted_risk VARCHAR(20) DEFAULT 'Low',
    risk_confidence DOUBLE DEFAULT 0.0,
    water_quality_score DOUBLE DEFAULT 50.0,
    verified BOOLEAN DEFAULT FALSE,
    verified_by_id INT,
    diagnosis VARCHAR(100),
    referral_status BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'Pending',
    assigned_asha_worker_id INT,
    verified_at DATETIME,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    alert_sent BOOLEAN DEFAULT FALSE,
    alert_sent_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_asha_worker_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sr_village (village),
    INDEX idx_sr_district (district),
    INDEX idx_sr_status (status),
    INDEX idx_sr_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Household Visits (ASHA Worker Direct Entries) Table
CREATE TABLE IF NOT EXISTS household_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asha_worker_id INT NOT NULL,
    household_name VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    family_members INT DEFAULT 1,
    water_source VARCHAR(50),
    sick_members_count INT DEFAULT 0,
    symptoms TEXT,
    status VARCHAR(50) DEFAULT 'Healthy',
    notes TEXT,
    visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    follow_up_date DATETIME,
    FOREIGN KEY (asha_worker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_hv_worker (asha_worker_id),
    INDEX idx_hv_village (village),
    INDEX idx_hv_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Alert Investigations Table
CREATE TABLE IF NOT EXISTS alert_investigations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    asha_worker_id INT NOT NULL,
    village VARCHAR(100) NOT NULL,
    findings TEXT,
    verification_status VARCHAR(50) DEFAULT 'Pending',
    visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (asha_worker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_alert (alert_id),
    INDEX idx_ai_worker (asha_worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Water Sources Table
CREATE TABLE IF NOT EXISTS water_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'functional',
    last_tested DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Incident Reports (Complaints/Contaminations) Table
CREATE TABLE IF NOT EXISTS incident_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Emergency Locations Table
CREATE TABLE IF NOT EXISTS emergency_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    details VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
