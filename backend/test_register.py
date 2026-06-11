from run import app

with app.app_context():
    client = app.test_client()
    payload = {
        'name': 'Test User2',
        'email': 'testuser2@example.com',
        'phone': '9998887777',
        'password': 'secret123',
        'role': 'villager',
        'village': 'TestVillage',
        'district': 'Hyderabad',
        'state': 'Telangana',
        'age': 25,
        'gender': 'male',
        'prefer_sms': True,
        'prefer_email': True,
    }
    r = client.post('/api/auth/register', json=payload)
    print('STATUS', r.status_code)
    print(r.get_data(as_text=True))
