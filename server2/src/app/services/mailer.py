from __future__ import annotations

import os
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from typing import Dict, Iterable

from app.core.config import settings


def _load_template(template_name: str) -> str:
    """
    Load HTML email template from disk.
    Equivalent to fs.readFileSync in Node.
    """
    templates_dir = Path(settings.email_templates_dir)
    template_path = templates_dir / f"{template_name}.html"

    if not template_path.exists():
        raise FileNotFoundError(f"Email template not found: {template_path}")

    return template_path.read_text(encoding="utf-8")


def _render_template(template: str, replacements: Dict[str, str]) -> str:
    """
    Replace {{placeholders}} in template.
    Equivalent to the RegExp replacement loop in Node.
    """
    rendered = template
    for key, value in replacements.items():
        rendered = re.sub(rf"{{{{{key}}}}}", str(value), rendered)
    return rendered


def send_email(
    template: str,
    context: Dict[str, str],
    subject: str,
    to_email: str | Iterable[str],
) -> bool:
    """
    Send an HTML email using SMTP.
    Mirrors nodemailer behavior.
    """
    try:
        html_body = _render_template(
            _load_template(template),
            context or {},
        )

        msg = MIMEMultipart("alternative")
        msg["From"] = settings.email_from
        msg["To"] = (
            ", ".join(to_email) if isinstance(to_email, (list, tuple)) else to_email
        )
        msg["Subject"] = subject

        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(settings.email_host, settings.email_port) as server:
            if settings.email_secure:
                server.starttls()

            if settings.email_user and settings.email_password:
                server.login(settings.email_user, settings.email_password)

            server.send_message(msg)

        print(f"Email sent to {msg['To']}")
        return True

    except Exception as exc:
        print("Error sending email:", exc)
        return False
