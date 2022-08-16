# Add any further api configs to the Config class

import os
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from .utils.utils import send_notices, update_lease, send_emails

# MAIL_SERVER = 'smtp-mail.outlook.com'
# MAIL_PORT = 587
# MAIL_USERNAME = 'homemate@outlook.com.au'
# MAIL_PASSWORD = 'comp9900bigai'
# MAIL_USE_TLS = True
# MAIL_USE_SSL = False
# MAIL_DEFAULT_SENDER = 'homemate@outlook.com.au'


class Config:
    """App configuration."""
    SCHEDULER_API_ENABLED = True

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_USERNAME = 'homemate.bigai@gmail.com'
    MAIL_PASSWORD = 'tvwyfejpgyvkfcic'

    SQLALCHEMY_DATABASE_URI = "postgresql://admin:bigai@localhost:5432/pmsdb"
    SECRET_KEY = os.getenv("PMS_SECRET_KEY")
    JOBS = [
        {
            "id": "job_notice",
            "func": send_notices,
            "replace_existing": True,
            "trigger": "cron",
            "minute": "*",  # originally this is supposed to be 1 hour
            "jitter": 10,  # 120
        },
        {
            "id": "job_lease_update",
            "func": update_lease,
            "replace_existing": True,
            "trigger": "cron",
            "minute": "*",  # originally this is supposed to be at 0 (12:00 AM)
            "jitter": 10,  # 120
        },
        {
            "id": "job_email_notification",
            "func": send_emails,
            "replace_existing": True,
            "trigger": "interval",
            "seconds": 30,
        }
    ]
    SCHEDULER_JOBSTORES = {
        "default": SQLAlchemyJobStore(url="postgresql://admin:bigai@localhost:5432/pmsdb")
    }
    SCHEDULER_JOB_DEFAULTS = {"coalesce": False, "max_instances": 15}
