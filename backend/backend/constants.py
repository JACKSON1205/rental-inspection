import datetime as dt
from enum import Enum
from re import M

RESPONSE_STATUS = {
    "OK": 200,
    "CREATED": 201,
    "BAD_REQUEST": 400,
    "UNAUTHORIZED": 401,
    "FORBIDDEN": 403,
    "NOT_FOUND": 404,
    "METHOD_NOT_ALLOWED": 405,
    "INTERNAL": 500,
}


class UserStatus(Enum):
    offline = 0
    online_tenant = 1
    online_manager = 2
    online_owner = 3
    inactive = 4


class ArtifactType(Enum):
    report_received = "report_received"
    report_due = "report_due"
    request_repair = "request_repair"
    request_lease_extension = "request_lease_extension"
    request_listing = "request_listing"
    request_unlisting = "request_unlisting"
    notice = "notice"
    notice_eviction = "notice_eviction"
    notice_leave = "notice_leave"
    inspection = "inspection"
    connection_from_tenant = "connection_from_tenant"
    connection_from_manager = "connection_from_manager"
    connection_from_owner = "connection_from_owner"


class ArtifactStatus(Enum):
    approved_by_owner = "approved_by_owner"
    approved_by_manager = "approved_by_manager"
    denied_by_owner = "denied_by_owner"
    denied_by_manager = "denied_by_manager"
    approved_by_tenant = "approved_by_tenant"
    denied_by_tenant = "denied_by_tenant"
    pending = "pending"
    fulfilled = "fulfilled"
    scheduled = "scheduled"
    canceled = "canceled"
    reschedule = "reschedule"
    rescheduled = "rescheduled"
    archived = "archived"


class InspectionStatus(Enum):
    scheduled = "scheduled"
    rescheduled = "rescheduled"
    canceled = "canceled"
    complete = "complete"


class SourceType(Enum):
    tenant = "tenant"
    owner = "owner"
    system = "system"


class ComponentType(Enum):
    text_small = "text_small"
    text_large = "text_large"
    checkbox = "checkbox"
    dropdown = "dropdown"
    datepicker = "datepicker"
    options = "options"
    scale_3 = "scale_3"
    scale_5 = "scale_5"
    scale_7 = "scale_7"


ROLE = {
    "tenant": "tenant",
    "owner": "owner",
    "manager": "manager",
}


PASSWORD_HASH = "sha256"

EXPIRE_TIME = dt.timedelta(days=0, minutes=15)


# properties image path
PROPERTY_IMG_BASE_DIR = "../data/imgs/properties/"
# path for properties thumbnail
PROPERTY_IMG_THUMBNAIL_PATH = "thumbnails/"
# path for properties orginal images
PROPERTY_IMG_ORIGINAL_PATH = "orgins/"
