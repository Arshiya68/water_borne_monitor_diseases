import http.client
import json
import time

host = '127.0.0.1'
port = 5000
import random
email = f'testreport_{int(time.time())}@example.com'
phone = f'999888{random.randint(1000, 9999)}'

register_payload = {
    'name': 'Report Tester',
    'email': email,
    'phone': phone,
    'password': 'secret123',
    'role': 'villager',
    'village': 'TestVillage',
    'district': 'Hyderabad',
    'state': 'Telangana',
    'age': 30,
    'gender': 'male',
    'prefer_sms': True,
    'prefer_email': True,
}

conn = http.client.HTTPConnection(host, port, timeout=10)
conn.request('POST', '/api/auth/register', json.dumps(register_payload), {'Content-Type': 'application/json'})
res = conn.getresponse()
print('REGISTER', res.status)
print(res.read().decode())
conn.close()

conn = http.client.HTTPConnection(host, port, timeout=10)
conn.request('POST', '/api/auth/login', json.dumps({'email': email, 'password': 'secret123'}), {'Content-Type': 'application/json'})
res = conn.getresponse()
login_data = res.read().decode()
print('LOGIN', res.status)
print(login_data)
conn.close()

if res.status != 200:
    raise SystemExit('Login failed')

token = json.loads(login_data).get('access_token')
if not token:
    raise SystemExit('No token returned')

report_payload = {
    'diarrhea': 1,
    'vomiting': 0,
    'fever': 1,
    'abdominal_pain': 0,
    'dehydration': 0,
    'diarrhea_severity': 2,
    'fever_severity': 2,
    'water_source': 0,
    'household_affected': 2,
    'age_group': 1,
    'symptom_duration': 3,
    'turbidity': 5,
    'ph': 7.2,
    'nitrates': 8,
    'dissolved_oxygen': 7,
    'chlorophyll_a': 4,
    'sulphates': 80,
    'total_suspended_solids': 15,
}

conn = http.client.HTTPConnection(host, port, timeout=10)
conn.request('POST', '/api/reports/submit', json.dumps(report_payload), {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
})
res = conn.getresponse()
print('REPORT SUBMIT', res.status)
print(res.read().decode())
conn.close()
