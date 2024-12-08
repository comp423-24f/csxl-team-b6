"""Operating Hours API

This API manages the Operating Hours of the XL."""

from datetime import datetime, timedelta, timezone
from typing import Sequence
from fastapi import APIRouter, Depends, Body
from ..authentication import registered_user
from ...models import User
from ...models.coworking import OperatingHours, TimeRange
from ...services.coworking import OperatingHoursService

__authors__ = ["Kris Jordan"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"


api = APIRouter(prefix="/api/coworking/operating_hours")
openapi_tags = {
    "name": "Coworking",
    "description": "The XL's coworking operating hours are managed via these endpoints.",
}


@api.get("", response_model=Sequence[OperatingHours], tags=["Coworking"])
def get_operating_hours(
    start: datetime = datetime.now(),
    end: datetime = datetime.now() + timedelta(weeks=1),
    operating_hours_svc: OperatingHoursService = Depends(),
):
    """List operating hours over a given span of dates."""
    time_range = TimeRange(start=start, end=end)
    return operating_hours_svc.schedule(time_range)


@api.post("", response_model=OperatingHours, tags=["Coworking"])
def new_operating_hours(
    operating_hours: OperatingHours,
    subject: User = Depends(registered_user),
    operating_hours_svc: OperatingHoursService = Depends(),
):
    """Create new opening hours for the XL."""
    return operating_hours_svc.create(subject, operating_hours)


@api.delete("/{id}", tags=["Coworking"])
def delete_operating_hours(
    id: int,
    subject: User = Depends(registered_user),
    operating_hours_svc: OperatingHoursService = Depends(),
):
    """Delete operating hours for the XL."""
    operating_hours = operating_hours_svc.get_by_id(id)
    return operating_hours_svc.delete(subject, operating_hours)


@api.put("", response_model=OperatingHours, tags=["Coworking"])
def edit_operating_hours(
    operating_hours: OperatingHours,
    subject: User = Depends(registered_user),
    operating_hours_svc: OperatingHoursService = Depends(),
):
    """Edit operating hours for the XL."""
    return operating_hours_svc.update(subject, operating_hours)


@api.get("/page", response_model=Sequence[OperatingHours], tags=["Coworking"])
def get_operating_hours_page(
    start_date: datetime,
    page: int,
    page_size: int = 10,
    future: bool = True,
    operating_hours_svc: OperatingHoursService = Depends(),
):
    """List operating hours with pagination."""
    return operating_hours_svc.paginated_schedule(start_date, page, page_size, future)


@api.get("/count", response_model=int, tags=["Coworking"])
def get_operating_hours_count(
    start_date: datetime,
    future: bool,
    operating_hours_svc: OperatingHoursService = Depends(),
):
    """Count the number of operating hours."""
    return operating_hours_svc.count(start_date, future)
