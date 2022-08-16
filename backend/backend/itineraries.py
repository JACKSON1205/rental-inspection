import datetime as dt
from operator import and_

import numpy as np
from dateutil.parser import isoparse
from flask import Blueprint, Response, current_app, json, request
from flask_cors import cross_origin

from . import db
from .constants import RESPONSE_STATUS, InspectionStatus
from .models import Inspection, Itinerary, Property, AbstractUser
from .utils.utils import auth_required

itinerary = Blueprint("itinerary", __name__)


def time_diff_days(date1: dt.date, date2: dt.date) -> int:
    """Return time difference between date1 and date2 in days

    Args:
        date1 (dt.date):
        date2 (dt.date):

    Returns:
        int:
    """
    return np.abs((date2 - date1).days)


@itinerary.route("/admin/itineraries", methods=["POST"])
@cross_origin(origin="*")
@auth_required
def access_properties(token_payload):
    """
    Update inspection and itinerary tables if request is valid; i.e.:
        - Date is given in correct format
        - Date is no less than two weeks from today
        - No property has a currently incomplete inspection in db scheduled for less than 3 months away.
    Inputs:
        - token_payload: fom @auth_required
        - request: contains the following:
            o inspectionDate (str): inspection date in ISO format
            o propertyInspectionTimes (List[Dict[str, Any]]): list of dicts of the form
                x propertyID (str): propertyID in the form of "p" + (integer pID as str) - e.g. "p1" for property ID 1.
                x inspectionTime (str): from-time in ISO format - e.g. "09:00:00"
            o inspectionLength (int): length of each inspection in minutes.
            o routeJSON: json object used by MapboxGL to render a route onto a map.
        }
    """
    manager_id = token_payload.get("user_id")
    # check date format
    inspection_date = request.get_json().get("inspectionDate")
    try:
        insp_date = isoparse(inspection_date).date()
    except ValueError:
        return Response(
            json.dumps({"error": "::ERROR:: Cannot parse selected date"}),
            status=RESPONSE_STATUS["INTERNAL"],
            mimetype="application/json",
        )
    earliest_inspection_date = (dt.datetime.today() + dt.timedelta(days=14)).date()
    if earliest_inspection_date >= insp_date:
        return Response(
            json.dumps({"error": "Inspections cannot be scheduled with less than two weeks notice."}),
            status=RESPONSE_STATUS["BAD_REQUEST"],
            mimetype="application/json",
        )
    property_ids = list(
        int(prop.get("propertyID")[1:])  # in frontend, properties are ID'd as "p1" instead of "1", for example
        for prop in request.get_json().get("propertyInspectionTimes")
    )
    for property_id in property_ids:
        inspection = Inspection.query.filter_by(property_id=property_id)
        for insp in inspection:
            if insp.status != InspectionStatus.complete and time_diff_days(insp_date, insp.inspection_date) < 90:
                property = Property.query.filter_by(property_id=property_id).first()
                return Response(
                    json.dumps(
                        {
                            "error": "Inspections cannot be scheduled less than 90 days apart. "
                            f"Property {property.address} already has an inspection scheduled for {insp.inspection_date} at {insp.from_time}. "
                            "Either change the inspection date or remove the property from the list."
                        }
                    ),
                    status=RESPONSE_STATUS["BAD_REQUEST"],
                    mimetype="application/json",
                )
    property_inspection_times = {
        int(prop.get("propertyID")[1:]): prop.get("inspectionTime")
        for prop in request.get_json().get("propertyInspectionTimes")
    }
    inspection_length = request.get_json().get("inspectionLength")
    route_json = request.get_json().get("routeJSON")

    # add to itineraries db
    new_itinerary = Itinerary(itinerary_date=insp_date, route_json=route_json, manager_id=manager_id)
    db.session.add(new_itinerary)
    db.session.commit()
    itinerary_id = new_itinerary.itinerary_id

    # add each property's inspection
    for property_id in property_ids:
        from_time = dt.datetime.strptime(property_inspection_times[property_id], "%H:%M:%S").time()
        to_time = (
            dt.datetime.combine(dt.datetime.today().date(), from_time) + dt.timedelta(minutes=int(inspection_length))
        ).time()
        new_inspection = Inspection(
            inspection_date=insp_date,
            from_time=from_time,
            to_time=to_time,
            status=InspectionStatus.scheduled,
            property_id=property_id,
            manager_id=manager_id,
            itinerary_id=itinerary_id,
        )
        db.session.add(new_inspection)
        db.session.commit()

    return Response(
        json.dumps({}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )
    
    
@itinerary.route("/admin/itineraries/<int:itinerary_id>", methods=["GET", "PATCH"])
@cross_origin(origin="*")
@auth_required
def update_itineraries(itinerary_id, token_payload):
    """
    If method == "PATCH":
        Update inspection and itinerary tables if request is valid; i.e.:
            - Date is given in correct format
            - Date is no less than two weeks from today
            - No property has a currently incomplete inspection in db scheduled for less than 3 months away.
        Inputs:
            - token_payload: fom @auth_required
            - request: contains the following:
                o inspectionDate (str): inspection date in ISO format
                o propertyInspectionTimes (List[Dict[str, Any]]): list of dicts of the form
                    x propertyID (str): propertyID in the form of "p" + (integer pID as str) - e.g. "p1" for property ID 1.
                    x inspectionTime (str): from-time in ISO format - e.g. "09:00:00"
                o inspectionLength (int): length of each inspection in minutes.
                o routeJSON: json object used by MapboxGL to render a route onto a map.
            }
    If method == "GET":
        get property data from associated itinerary
    """
    manager_id = token_payload.get("user_id")
    this_itinerary = Itinerary.query.filter_by(manager_id=manager_id, itinerary_id=itinerary_id).first()
    if not this_itinerary:
        return Response(
            json.dumps({"error": "::ERROR:: Internal error: itinerary id not found."}),
            status=RESPONSE_STATUS["INTERNAL"],
            mimetype="application/json"
        )
    inspection_date = this_itinerary.itinerary_date.isoformat()
    if request.method == "PATCH":
        # check date format
        try:
            insp_date = isoparse(inspection_date).date()
        except ValueError:
            return Response(
                json.dumps({"error": "::ERROR:: Cannot parse selected date"}),
                status=RESPONSE_STATUS["INTERNAL"],
                mimetype="application/json",
            )

        errors = []
        earliest_inspection_date = (dt.datetime.today() + dt.timedelta(days=14)).date()
        if earliest_inspection_date >= insp_date:
            errors.append("Inspections cannot be scheduled with less than two weeks notice.")            
        if errors:
            return Response(
                json.dumps({"error": errors}),
                status=RESPONSE_STATUS["BAD_REQUEST"],
                mimetype="application/json",
            )
        property_ids = set(
            [
                int(prop.get("propertyID")[1:])  # in frontend, properties are ID'd as "p1" instead of "1", for example
                for prop in request.get_json().get("propertyInspectionTimes")
            ]
        )
        for property_id in property_ids:
            inspection = Inspection.query.filter_by(property_id=property_id).filter(Inspection.itinerary_id!=itinerary_id)
            for insp in inspection:
                if insp.status != InspectionStatus.complete and time_diff_days(insp_date, insp.inspection_date) < 90:
                    property = Property.query.filter_by(property_id=property_id).first()
                    return Response(
                        json.dumps(
                            {
                                "error": "Inspections cannot be scheduled less than 90 days apart. "
                                f"Property {property.address} already has an inspection scheduled for {insp.inspection_date} at {insp.from_time}. "
                                "Either change the inspection date or remove the property from the list."
                            }
                        ),
                        status=RESPONSE_STATUS["BAD_REQUEST"],
                        mimetype="application/json",
                    )
        property_inspection_times = {
            int(prop.get("propertyID")[1:]): prop.get("inspectionTime")
            for prop in request.get_json().get("propertyInspectionTimes")
        }
        inspection_length = request.get_json().get("inspectionLength")
        route_json = request.get_json().get("routeJSON")

        
        Inspections_old  = Inspection.query.filter_by(manager_id=manager_id, itinerary_id=itinerary_id)
        property_ids_old = set([insp.property_id for insp in Inspections_old.distinct()])
        
        # get intersection from two property set
        updated_insp_property_ids = property_ids_old.intersection(property_ids)  
        # get difference from two sets
        canceled_property_ids = property_ids_old.difference(property_ids) 
        new_insp_property_ids = property_ids.difference(property_ids_old)
        
        
        # update itineraries db
        this_itinerary.itinerary_date = insp_date
        this_itinerary.route_json = route_json
        db.session.commit()
        
        # remove all canceld inspections from db
        try:
            canceled_inspections = Inspection.query.filter(
                                    Inspection.itinerary_id==itinerary_id
                                ).\
                                filter(Inspection.property_id.in_(canceled_property_ids))
            canceled_inspections.update({Inspection.status: InspectionStatus.canceled})    
            db.session.commit()
            canceled_inspections.delete()
            db.session.commit()
        except:
            pass
            
        # update each property's inspection
        for property_id in updated_insp_property_ids:
            from_time = dt.datetime.strptime(property_inspection_times[property_id], "%H:%M:%S").time()
            to_time = (
                dt.datetime.combine(dt.datetime.today().date(), from_time) + dt.timedelta(minutes=int(inspection_length))
            ).time()
            insp = Inspection.query.filter_by(itinerary_id=itinerary_id, property_id=property_id).first()
            insp.status = InspectionStatus.rescheduled
            insp.inspection_date=insp_date
            insp.from_time=from_time
            insp.to_time=to_time
            db.session.commit()
            
        # add each property's inspection
        for property_id in new_insp_property_ids:
            from_time = dt.datetime.strptime(property_inspection_times[property_id], "%H:%M:%S").time()
            to_time = (
                dt.datetime.combine(dt.datetime.today().date(), from_time) + dt.timedelta(minutes=int(inspection_length))
            ).time()
            new_inspection = Inspection(
                inspection_date=insp_date,
                from_time=from_time,
                to_time=to_time,
                status=InspectionStatus.scheduled,
                property_id=property_id,
                manager_id=manager_id,
                itinerary_id=itinerary_id,
            )
            db.session.add(new_inspection)
            db.session.commit()

        return Response(
            json.dumps({}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )
    else:
        included_inspections = Inspection.query.filter_by(
                                manager_id=manager_id,
                                itinerary_id=itinerary_id,
                            ).\
                            join(Property, Inspection.property_id==Property.property_id).\
                            join(AbstractUser, Property.tenant_id==AbstractUser.user_id).\
                            with_entities(
                                Property.property_id.label('property_id'),
                                Property.address.label('address'),
                                Property.post_code.label('post_code'),
                                Property.map_lat.label('map_lat'),
                                Property.map_long.label('map_long'),
                                Inspection.from_time.label('from_time'),
                                Inspection.to_time.label('to_time'),
                                AbstractUser.first_name.label('first_name'),
                                AbstractUser.last_name.label('last_name'),
                            ).order_by(Inspection.inspection_date.desc(), Inspection.from_time).all()
        properties_list = [
            {
                "property_id": insp.property_id,
                "address": insp.address,
                "post_code": str(insp.post_code),
                "map_lat": str(insp.map_lat),
                "map_long": str(insp.map_long),
                "start_time": insp.from_time.isoformat(),
                "end_time": insp.to_time.isoformat(),
                "tenant_first_name": insp.first_name,
                "tenant_last_name": insp.last_name,
            }
            for insp in included_inspections
        ]
    
        start_time = min([prop["start_time"] for prop in properties_list])
        start_time = (
            dt.datetime.combine(dt.datetime.today().date(), dt.time.fromisoformat(start_time)) -
            dt.timedelta(minutes=30)
        ).time().isoformat()
        end_time = max([prop["end_time"] for prop in properties_list])
        end_time = (
            dt.datetime.combine(dt.datetime.today().date(), dt.time.fromisoformat(end_time)) +
            dt.timedelta(minutes=30)
        ).time().isoformat()
        inspection_time = (
            dt.datetime.combine(dt.datetime.today().date(), included_inspections[0].to_time) - 
            dt.datetime.combine(dt.datetime.today().date(), included_inspections[0].from_time)
        ).total_seconds() // 60

        return Response(
            json.dumps({
                "property_list": properties_list,
                "start_time": start_time,
                "end_time": end_time,
                "inspection_time": inspection_time,
            }),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )


    
@itinerary.route("/admin/itineraries/get_itinerary_ids", methods=["GET"])
@cross_origin(origin="*")
@auth_required
def get_itineraries_only(token_payload):
    manager_id = token_payload.get("user_id")
    today = dt.date.today()
    itineraries = Itinerary.query.filter_by(manager_id=manager_id).\
                  filter(Itinerary.itinerary_date>=today).all()
    
    itinerary_list = [
        {"itinerary_id": itn.itinerary_id} for itn in itineraries
    ]
    
    return Response(
        json.dumps({"itinerary_list": itinerary_list}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )

@itinerary.route("/admin/itineraries", methods=["GET"])
@cross_origin(origin="*")
@auth_required(access_right=["manager",])
def access_itineraries(token_payload):
    manager_id = token_payload.get("user_id")
    today = dt.date.today()
    
    # access itinerary list
    itineraries = db.session.query(
                    Itinerary,
                    Inspection,
                    Property,
                  ).filter_by(manager_id=manager_id).\
                  filter(Itinerary.itinerary_date>=today).\
                  join(Inspection, Itinerary.itinerary_id==Inspection.itinerary_id).\
                  join(Property, Inspection.property_id==Property.property_id).\
                  with_entities(
                    Itinerary.itinerary_date,
                    Itinerary.itinerary_id,
                    Inspection.inspection_id,
                    Inspection.inspection_date,
                    Inspection.from_time,
                    Inspection.to_time,
                    Inspection.status,
                    Inspection.property_id,
                    Inspection.manager_id,
                    Property.address,
                  ).order_by(Inspection.inspection_date.desc(), Inspection.from_time)
                  
    import itertools
    grouped_itineraries = {k: list(g) for k, g in itertools.groupby(itineraries, lambda t: (t.itinerary_id, t.itinerary_date))}

    itinerary_list = [
        {
            'date': date.strftime('%Y-%m-%d'),
            'itinerary_ty': 0,
            'itinerary_id': it_id,
            'inspection_id':inspections[0]['inspection_id'],
            'inspections': [
                {
                    'from_time': str(inspection.from_time),
                    'to_time': str(inspection.to_time),
                    'inspection_date': inspection.inspection_date.strftime('%Y-%m-%d'),
                    'status': str(inspection.status),
                    'address': inspection.address,
                    'property_id': inspection.property_id,
                    "inspection_id": inspection.inspection_id,
                } for inspection in inspections
            ]
        } for [it_id, date], inspections in grouped_itineraries.items()
    ]
    current_app.logger.info(itinerary_list)
    
    inspections = db.session.query(Inspection, Property).filter(
                        and_(Inspection.manager_id==manager_id,
                             Inspection.itinerary_id==None)
                    ).filter(Inspection.inspection_date>=today).\
                    filter(Inspection.status!=InspectionStatus.canceled).\
                    join(
                        Property, Inspection.property_id==Property.property_id
                    ).add_columns(
                        Inspection.inspection_id,
                        Inspection.inspection_date,
                        Inspection.from_time,
                        Inspection.to_time,
                        Inspection.status,
                        Inspection.property_id,
                        Inspection.manager_id,
                        Property.address,
                    ).order_by(Inspection.inspection_date.desc(), Inspection.from_time).all()
    
    inspection_list = [
        {
            "date": inspection.inspection_date.strftime('%Y-%m-%d'),
            "manager_id": inspection.manager_id,
            "inspection_id":inspection.inspection_id,
            "from_time": str(inspection.from_time),
            "to_time": str(inspection.to_time),
            "property_id": inspection.property_id,
            "address": inspection.address,
            "status": str(inspection.status),
            'itinerary_ty': 1,
            'inspections': "",
        }for inspection in inspections
    ]
    
    itinerary_list += inspection_list
    
    itinerary_list.sort(key=lambda x: x['date'])
    current_app.logger.info(itinerary_list)
    return Response(
        json.dumps({"itinerary_list": itinerary_list}),
        status=RESPONSE_STATUS["OK"],
        mimetype="application/json",
    )
        
    
@itinerary.route("/admin/itineraries/<int:itinerary_id>", methods=["DELETE"])
@cross_origin(origin="*")
@auth_required(access_right=["manager",])
def delete_itinerary(itinerary_id, token_payload) -> Response:
    user_id = token_payload["user_id"]
    itinerary = Itinerary.query.filter_by(manager_id=user_id, itinerary_id=itinerary_id).first()
    
    if not itinerary:
        return Response(
            json.dumps({"success": False, "error": "Itinerary not found."}),
            status=RESPONSE_STATUS["NOT_FOUND"],
            mimetype="application/json",
        )
        
    inspections = Inspection.query.filter_by(manager_id=user_id, itinerary_id=itinerary_id)
    inspections.update({Inspection.status: InspectionStatus.canceled})
    db.session.commit()
    inspections.delete()
    db.session.delete(itinerary)
    db.session.commit()
    
    return Response(
            json.dumps({"success": True, "token": token_payload}),
            status=RESPONSE_STATUS["OK"],
            mimetype="application/json",
        )