from flask import current_app

def send_sms_alert(to_number, village, risk_level,
                   disease_hint='waterborne disease'):
    sid   = current_app.config.get('TWILIO_ACCOUNT_SID')
    token = current_app.config.get('TWILIO_AUTH_TOKEN')
    from_ = current_app.config.get('TWILIO_PHONE_NUMBER')
    if not all([sid, token, from_]):
        print('[SMS] Twilio not configured — skipping.')
        return False
    try:
        from twilio.rest import Client
        msg = (f"HEALTH ALERT [{risk_level} RISK]: Possible {disease_hint} "
               f"outbreak in {village}. Boil water. Visit nearest health centre."
               f" — District Health Office")
        Client(sid, token).messages.create(body=msg, from_=from_, to=to_number)
        return True
    except Exception as e:
        print(f'[SMS] Error: {e}')
        return False