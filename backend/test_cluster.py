import http.client
import json
import time
import random

host = '127.0.0.1'
port = 5000

# We will generate a unique village name to ensure we start with 0 reports in that village
village_name = f'ClusterVillage_{int(time.time())}'
district_name = 'Hyderabad'

print(f'Starting cluster alert test for village: {village_name}...')

def register_and_login_user(index):
    email = f'clustertester_{index}_{int(time.time())}@example.com'
    phone = f'999777{random.randint(1000, 9999)}'
    
    register_payload = {
        'name': f'Tester {index}',
        'email': email,
        'phone': phone,
        'password': 'secret123',
        'role': 'villager',
        'village': village_name,
        'district': district_name,
        'state': 'Telangana',
        'age': 25 + index,
        'gender': 'female',
        'prefer_sms': True,
        'prefer_email': True,
    }
    
    # Register
    conn = http.client.HTTPConnection(host, port, timeout=10)
    conn.request('POST', '/api/auth/register', json.dumps(register_payload), {'Content-Type': 'application/json'})
    res = conn.getresponse()
    res_data = res.read().decode()
    conn.close()
    
    if res.status != 201:
        print(f'User {index} registration failed: {res_data}')
        return None
        
    # Login
    conn = http.client.HTTPConnection(host, port, timeout=10)
    conn.request('POST', '/api/auth/login', json.dumps({'email': email, 'password': 'secret123'}), {'Content-Type': 'application/json'})
    res = conn.getresponse()
    login_data = json.loads(res.read().decode())
    conn.close()
    
    return login_data.get('access_token')

# Submit 3 reports
for i in range(1, 4):
    token = register_and_login_user(i)
    if not token:
        raise SystemExit(f'Failed to get token for user {i}')
        
    report_payload = {
        'diarrhea': 1,
        'vomiting': 1,
        'fever': 0,
        'abdominal_pain': 1,
        'dehydration': 0,
        'diarrhea_severity': 2,
        'fever_severity': 1,
        'water_source': 1,
        'household_affected': 1,
        'age_group': 1,
        'symptom_duration': 2,
    }
    
    conn = http.client.HTTPConnection(host, port, timeout=10)
    conn.request('POST', '/api/reports/submit', json.dumps(report_payload), {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    })
    res = conn.getresponse()
    res_data = json.loads(res.read().decode())
    conn.close()
    
    print(f'REPORT {i} SUBMIT STATUS: {res.status}')
    if i == 3:
        print('RESPONSE FOR 3RD REPORT SUBMISSION:')
        print(json.dumps(res_data, indent=2))
        alert = res_data.get('alert')
        if alert:
            print('SUCCESS: Cluster Warning Triggered!')
            print(f'Alert Message: {alert.get("message")}')
        else:
            print('FAILURE: No Alert Triggered on 3rd report.')
