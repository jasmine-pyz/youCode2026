"""
SMS notification via Twilio.

Sends an alert when aggressive language is detected.
Degrades gracefully — if Twilio credentials are not configured,
logs a warning instead of crashing.

Note: Environment variables are loaded by main.py via load_dotenv()
at app startup, so they are already available in os.environ here.
"""

import os
import logging

logger = logging.getLogger(__name__)


def send_sms_alert(original_text: str, english_translation: str) -> None:
    """Send an SMS alert about detected aggressive content.

    Required env vars (set in backend/.env, loaded by main.py at startup):
        TWILIO_ACCOUNT_SID  — Twilio account SID
        TWILIO_AUTH_TOKEN   — Twilio auth token
        TWILIO_FROM_NUMBER  — Twilio phone number (sender)
        ALERT_TO_NUMBER     — Destination phone number for alerts
    """
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN", "")
    from_number = os.environ.get("TWILIO_FROM_NUMBER", "")
    to_number = os.environ.get("ALERT_TO_NUMBER", "")

    if not all([account_sid, auth_token, from_number, to_number]):
        logger.warning(
            "Twilio not configured — skipping SMS alert. "
            "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, "
            "and ALERT_TO_NUMBER in backend/.env to enable."
        )
        return

    # Truncate to keep SMS within limits
    preview = english_translation[:120] + ("…" if len(english_translation) > 120 else "")
    body = f"⚠️ Aggressive language detected in Hearth conversation:\n\"{preview}\""

    try:
        from twilio.rest import Client

        client = Client(account_sid, auth_token)
        client.messages.create(
            body=body,
            from_=from_number,
            to=to_number,
        )
        logger.info("SMS alert sent to %s", to_number)
    except Exception as exc:
        logger.error("Failed to send SMS alert: %s", exc)
