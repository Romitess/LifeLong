"""
Environment Variable Validator Utility for Python Scripts
Validates and retrieves environment variables with proper error handling
"""

import os
import sys


def get_env(name, required=False, fallback=None, sensitive=False):
    """
    Get environment variable with validation
    
    Args:
        name: Environment variable name
        required: Whether the variable is required
        fallback: Default value if not set
        sensitive: Whether this is a sensitive value (password, secret)
    
    Returns:
        Environment variable value or fallback
    """
    value = os.getenv(name)
    
    if not value:
        if sensitive or required:
            print(f"❌ ERROR: Required environment variable {name} is not set", file=sys.stderr)
            sys.exit(1)
        if fallback is not None:
            print(f"⚠️  WARNING: {name} not set, using fallback: {fallback}")
            return fallback
    
    return value
