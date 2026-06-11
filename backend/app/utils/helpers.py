from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify

def role_required(*roles):
    """Decorator: restrict endpoint to specific roles."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            if identity.get('role') not in roles:
                return jsonify({'error': 'Access denied'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator