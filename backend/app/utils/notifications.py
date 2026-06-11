import os
import smtplib
from email.message import EmailMessage
from typing import List
import os
import re
import smtplib
from email.message import EmailMessage
from email.utils import parseaddr

try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except Exception:
    TWILIO_AVAILABLE = False


def normalize_phone_number(phone: str) -> str:
    if not phone:
        return ''
    digits = re.sub(r'[^0-9+]', '', phone)
    if digits.startswith('00'):
        digits = '+' + digits[2:]
    if digits.startswith('0') and not digits.startswith('+'):
        digits = digits.lstrip('0')
    if digits.startswith('+'):
        return digits
    if len(digits) == 10:
        return f'+91{digits}'
    return digits


def is_valid_email(address: str) -> bool:
    if not address or '@' not in address:
        return False
    name, addr = parseaddr(address)
    return bool(addr and '@' in addr)


def send_sms(to_number: str, body: str) -> bool:
    sid = os.environ.get('TWILIO_ACCOUNT_SID')
    token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = os.environ.get('TWILIO_FROM_NUMBER')

    normalized = normalize_phone_number(to_number)
    if not normalized or not normalized.startswith('+'):
        print(f"[notifications] SMS not sent (invalid phone): {to_number}")
        return False

    if not (sid and token and from_number) or not TWILIO_AVAILABLE:
        print(f"[notifications-mock] SMS Simulated to {normalized}: {body}")
        return True

    try:
        client = Client(sid, token)
        msg = client.messages.create(body=body, from_=from_number, to=normalized)
        print(f"[notifications] SMS sent: {msg.sid} to {normalized}")
        return True
    except Exception as e:
        print(f"[notifications] SMS error: {e}")
        return False


def send_email(to_email: str, subject: str, body: str) -> bool:
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')
    from_email = os.environ.get('FROM_EMAIL') or smtp_user

    if not is_valid_email(to_email):
        print(f"[notifications] Email not sent (invalid email): {to_email}")
        return False

    if not (smtp_host and smtp_user and smtp_pass and from_email):
        print(f"[notifications-mock] Email Simulated to {to_email} | Subject: {subject} | Body: {body}")
        return True

    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        msg.set_content(body)

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        print(f"[notifications] Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"[notifications] Email error: {e}")
        return False


def send_alerts_to_users(users: List[dict], message: str) -> dict:
    results = {
        'sms_sent': 0,
        'email_sent': 0,
        'attempted': len(users),
        'skipped': 0,
        'details': [],
    }
    for u in users:
        user_result = {'user_id': u.get('id'), 'email': u.get('email'), 'phone': u.get('phone'), 'sms': False, 'email': False, 'skipped': False}
        sent = False
        if u.get('prefer_sms') and u.get('phone'):
            ok = send_sms(u['phone'], message)
            user_result['sms'] = ok
            if ok:
                results['sms_sent'] += 1
                sent = True
        if u.get('prefer_email') and u.get('email'):
            ok = send_email(u['email'], 'Health Alert', message)
            user_result['email'] = ok
            if ok:
                results['email_sent'] += 1
                sent = True
        if not sent:
            results['skipped'] += 1
            user_result['skipped'] = True
        results['details'].append(user_result)
    return results
