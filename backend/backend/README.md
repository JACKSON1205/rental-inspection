# API Endpoints:

- REGISTER
  - /admin/auth/register [POST]
  - Data = {
    - first_name:\<string\>
    - last_name:\<string\>
    - email:\<string\>
    - password:\<string\>
    - secret_question:\<string\>
    - secret_answer:\<string\>
    - tenant:\<boolean\>
    - manager:\<boolean\>
    - owner:\<boolean\>
  }

- LOGIN (ACCESSED BY ALL)
  - /admin/auth/login [POST]
  - Data = {
    - email:\<string\>
    - password:\<string\>
    - role:\<string\>
  }

- LOGOUT (ACCESSED BY ALL)
  - /admin/auth/logout [POST]

- FIRST STEP IN PASSWORD RESET (ACCESSED BY ALL)
  - /admin/auth/reset [POST]
  - Data = {
    - email:\<string\>
  }

- SECOND STEP IN PASSWORD RESET (ACCESSED BY ALL)
  - /admin/auth/reset/sec [POST]
  - Data = {
    - secret_answer:\<string\>
  }

- UPDATE USER PASSWORD (ACCESSED BY ALL)
  - /admin/auth/reset [PATCH]
  - Data = {
    - new_password:\<string\>
  }
  
- UPDATE PROFILE (ACCESSED BY ALL)
  - /admin/profile [GET, PATCH]
    - Data = {
        - [first_name:\<string\>]
        - [last_name:\<string\>]
    }
    
- DELETE ACCOUNT (ACCESSED BY ALL)
  - /admin/profile [POST]
    - Data = {
        - password:\<string\>
    }

- HOME PAGE AUTHENTICATION (ACCESSED BY ALL, NEEDS REVIEW)
  - /admin/<string:role>/home [GET]

- GET LIST OF SAVED REPORTS AND POST A REPORT (ACCESSED BY MANAGER)
  - /admin/archive [GET, POST]
  - Data = {
    - artifact_json:\<json\>
    - [title:\<string\>]
    - artifact_type:\<ArtifactType\>
    - [artifact_date:\<date\>]
  }

- GET UPDATE DELETE SPECIFIC SAVED REPORT (ACCESSED BY MANAGER)
  - /admin/archive/<artifact_id> [GET, PATCH, DELETE]

- GET LIST OF SAVED DUE REPORTS (ACCESSED BY MANAGER)
  - /admin/archive/reports/due [GET]

- GET LIST OF SAVED REPORTS (ACCESSED BY MANAGER)
  - /admin/archive/reports/received [GET]

- GET SPECIFIC ARTIFACT (ACCESSED BY TENANT/OWNER)
  - /admin/artifacts/<artifact_id> [GET]

- GET LIST OF TENANT ARTIFACTS OR POST TENANT ARTIFACT USING TENANT ID (ACCESSED BY MANAGER)
  - /admin/tenant/<tenant_id>/artifacts [GET, POST]
  - Data = {
    - [title:\<string\>]
    - artifact_json:\<json\>
    - artifact_type:\<ArtifactType\>
  }
  
- POST TENANT ARTIFACT USING TENANT EMAIL (ACCESSED BY MANAGER)
  - /admin/tenant/artifacts [POST]
  - Data = {
    - [title:\<string\>]
    - artifact_json:\<json\>
    - artifact_type:\<ArtifactType\>
    - email:\<string\>
  }

- GET AND UPDATE SPECIFIC TENANT ARTIFACT (ACCESSED BY MANAGER)
  - /admin/tenant/<tenant_id>/artifacts/<artifact_id> [GET, PATCH]
  - Data = {
    - status:\<ArtifactStatus\>
  }

- GET LIST OF OWNER ARTIFACTS OR POST OWNER ARTIFACT USING OWNER ID (ACCESSED BY MANAGER)
  - /admin/owner/<owner_id>/artifacts [GET, POST]
  - Data = {
    - artifact_json:\<json\>
    - [title:\<string\>]
    - artifact_type:\<ArtifactType\>
    - [artifact_date:\<date\>]
  }

- POST OWNER ARTIFACT USING OWNER EMAIL (ACCESSED BY MANAGER)
  - /admin/owner/artifacts [POST]
  - Data = {
    - [title:\<string\>]
    - artifact_json:\<json\>
    - artifact_type:\<ArtifactType\>
    - email:\<string\>
  }

- GET AND UPDATE SPECIFIC OWNER ARTIFACT (ACCESSED BY MANAGER)
  - /admin/owner/<owner_id>/artifacts/<artifact_id> [GET, PATCH]
  - Data = {
    - status:\<ArtifactStatus\>
  }

- GET LIST OF CONTACTS OR POST CONTACT (ACCESSED BY ALL)
  - /admin/contacts [GET, POST]
  - Data(TENANT/OWNER) = {
    - email:\<string\>
  }
  - Data(MANAGER) = {
    - email:\<string\>
    - [preferred_name:\<string\>]
    - [phone_number:\<string\>]
    - tenant:\<boolean\>
    - owner:\<boolean\>
  }

- GET UPDATE DELETE SPECIFIC CONTACT (ACCESSED BY MANAGER)
  - /admin/contacts/<contact_id> [GET, PATCH, DELETE]
  - Data(MANAGER) = {
    - [preferred_name:\<string\>]
    - [phone_number:\<string\>]
    - [tenant:\<boolean\>]
    - [owner:\<boolean\>]
  }

- GET LIST OF INSPECTIONS (ACCESSED BY ALL) OR POST INSPECTION (ACCESSED BY MANAGER)
  - /admin/inspections [GET, POST]
  - Data = {
    - inspection_date:\<date\>
    - from_time:\<datetime\>
    - to_time:\<datetime\>
    - property_id:\<integer\>
    - [itinerary_id:\<integer\>]
  }

- GET AND UDPATE INSPECTION (ACCESSED BY ALL)
  - /admin/inspections/<inspection_id> [GET, PATCH]
  - Data(TENANT/OWNER) = {
    - request_date:\<string\>
    - request_time:\<string\>
  }
  - Data(MANAGER) = {
    - [inspection_date:\<date\>]
    - [from_time:\<datetime\>]
    - [to_time:\<datetime\>]
    - [status:\<string\>]
    - [itinerary_id\:<integer\>]
  }
  
 - DELETE INSPECTION (ACCESSED BY MANAGER)
   - /admin/inspections/<inspection_id> [DELETE]

 - POST ITINERARY AND ALL ASSOCIATED INSPECTIONS (ACCESSED BY MANAGER)
   - /admin/itineraries [POST]
   - Data = {
      - [inspectionDate \<string\>]
      - [propertyInspectionTimes \<dict/object\>] containing
        - [propertyID \<string\>]
        - [inspectionTime \<string\>]
      - [inspectionLength \<integer\>]
      - [routeJSON: \<json\>]
  }

- GET LIST OF NOTICES OR POST NOTICE (ACCESSED BY TENANT AND OWNER)
  - /admin/notices [GET, POST]
  - Data = {
    - [title:\<string\>]
    - artifact_json:\<json\>
    - artifact_type:\<string\>
  }

- GET LIST OF NOTIFICATIONS (ACCESSED BY ALL)
  - /admin/notifications [GET]

- MARK NOTIFICATION AS READ/UNREAD (ACCESSED BY ALL)
  - /admin/notifications/<notification_id> [PATCH]

- GET LIST OF RECEIVED REPORTS (ACCESSED BY ALL)
  - /admin/reports [GET]

- GET LIST OF DUE REPORTS (ACCESSED BY TENANT)
  - /admin/reports/due [GET]

- GET AND FILL DUE REPORT (ACCESSED BY TENANT)
  - /admin/reports/due/<artifact_id> [GET, PATCH]
  - Data = {\*:\<string\>} (depends on template)

- GET LIST OF REQUESTS AND POST REQUEST (ACCESSED BY TENANT AND OWNER)
  - /admin/requests [GET, POST]
  - Data = {
    - [title:\<string\>]
    - artifact_json:\<json\>
    - artifact_type:\<string\>
  }

- ACCEPT/DECLINE CONNECTION REQUEST (ACCESSED BY TENANT AND OWNER)
  - /admin/requests/<artifact_id> [PATCH]

- ACCESS PROPERTY LIST (ACCESSED BY ALL)
  - /admin/properties [GET, PATCH]
    - Data = {
      - [leased:\<boolean\>]
      - [manager_email:\<string\>]
      - [owner_email:\<string\>]
      - [tenant_email:\<string\>]
      - [post_code:\<string\>]
    }

- GET PROPERTY DETAIL (ACCESSED BY ALL)
  - /admin/property/<int:property_id>[GET]
  
- UPDATE PROPERTY DETAIL (ACCESSED BY MANAGER AND OWNER)
  - /admin/property/<int:property_id>[PATCH]
    - Manager:
      - Data = {
        - [leased:\<boolean\>]
        - [tenant_email:\<string\>]
        - [image:\<image\>]
      }
      - mimetype = multipart/form-data
      
    - Owner:
      - Data = {
        - [image:\<image\>]
      }
      - mimetype = multipart/form-data
      
- ADD NEW PROPERTY (ACCESSED BY OWNER)
  - /admin/properties ["POST]
    - Data = {
      - address:\<string\>
      - post_code:\<string\>
      - leased:\<boolean\>
      - [image:\<image\>]
    }
    - mimetype = multipart/form-data
    
- GET LIST OF SCHEDULED NOTICES OR SCHEDULE (POST) NOTICE (ACCESSED BY MANAGER)
  - /admin/schedule [GET, POST]
  - AT LEAST ONE OF [recipient_email, contact_id] MUST BE PASSED.
  - Data = {
    - message:\<string\>
    - [recipient_email:\<string\>]
    - tenant:\<boolean\>
    - owner:\<boolean\>
    - notice_date:\<date\>
    - notice_time:\<time\>
    - [contact_id:\<integer\>]
  }

- GET UPDATE DELETE SPECIFIC SCHEDULED NOTICE (ACCESSED BY MANAGER)
  - /admin/schedule/<int:notice_id> [GET, PATCH, DELETE]
  - NOTICE MUST BE NOT SENT OUT YET IN ORDER TO UPDATE/DELETE.
  - Data = {
    - message:\<string\>
    - notice_date:\<date\>
    - notice_time:\<time\>
  }
  
- GET LIST OF ALL TEMPLATES OR POST TEMPLATE (ACCESSED BY MANAGER)
  - /admin/templates [GET, POST]
  - Data = {
    - template_json:\<json\>
    - title:\<string\>
    - description:\<string\>
  }
  
- GET DEFAULT TEMPLATE (ACCESSED BY MANAGER)
  - /admin/templates/default/<int:template_id> [GET]
  

- GET UPDATE DELETE SPECIFIC CUSTOM TEMPLATE (ACCESSED BY MANAGER)
  - /admin/templates/custom/<int:template_id> [GET, PATCH, DELETE]
  - Data = {
    - [template_json:\<json\>]
    - [title:\<string\>]
    - [description:\<string\>]
  }
  
  

