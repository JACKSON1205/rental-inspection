DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO admin;

CREATE TYPE user_status AS ENUM ('offline', 'online_tenant', 'online_manager', 'online_owner', 'inactive');

CREATE TYPE artifact_type AS ENUM ( 'report_received', 
									'report_due',
									'request_repair',
									'request_lease_extension',
									'request_listing',
									'request_unlisting',
									'notice',
									'notice_eviction',
									'notice_leave',
									'inspection',
									'connection_from_tenant',
									'connection_from_manager',
									'connection_from_owner');

CREATE TYPE artifact_status AS ENUM ( 'approved_by_owner',
									  'approved_by_manager',
									  'denied_by_owner',
									  'denied_by_manager',
									  'approved_by_tenant',
									  'denied_by_tenant',
									  'pending',
									  'fulfilled',
									  'scheduled',
									  'canceled',
									  'reschedule',
									  'rescheduled',
									  'archived');
									  
CREATE TYPE inspection_status AS ENUM ( 'scheduled',
										'rescheduled',
										'canceled',
										'complete');

CREATE TYPE source_type AS ENUM ('tenant', 'owner', 'system');

CREATE TYPE component_type AS ENUM ( 'text_small',
									 'text_large',
									 'checkbox',
									 'dropdown',
									 'datepicker',
									 'options',
									 'scale_3',
									 'scale_5',
									 'scale_7');

CREATE TYPE secret_question AS ENUM ( 'What is your favorite book?',
									  'What is the name of the road you grew up on?',
									  'What is your mother’s maiden name?',
									  'What was the name of your first/current/favorite pet?',
									  'What was the first company that you worked for?',
									  'Where did you meet your spouse?',
									  'Where did you go to high school/college?',
									  'What is your favorite food?',
									  'What city were you born in?',
									  'Where is your favorite place to vacation?');


-----------------------------DDL---------------------------------
CREATE SEQUENCE o_room INCREMENT BY 1 MINVALUE 1 NO MAXVALUE START WITH 1;
CREATE SEQUENCE t_room INCREMENT BY 1 MINVALUE 1 NO MAXVALUE START WITH 1;
CREATE TABLE abstract_user (
  user_id            SERIAL NOT NULL, 
  first_name         varchar(255) NOT NULL, 
  last_name          varchar(255) NOT NULL, 
  email              varchar(80) NOT NULL, 
  password_hash      char(88) NOT NULL, 
  secret_question    varchar(255) NOT NULL, 
  secret_answer_hash char(88) NOT NULL, 
  tenant             bool DEFAULT 'FALSE' NOT NULL, 
  manager            bool DEFAULT 'FALSE' NOT NULL, 
  owner              bool DEFAULT 'FALSE' NOT NULL, 
  status             user_status DEFAULT 'offline' NOT NULL, 
  PRIMARY KEY (user_id));
CREATE TABLE chat_token_blacklist (
  token_id       SERIAL NOT NULL, 
  token          char(197) NOT NULL, 
  blacklist_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  PRIMARY KEY (token_id));
CREATE TABLE contact (
  contact_id     SERIAL NOT NULL, 
  preferred_name varchar(255) NOT NULL, 
  phone_number   char(10), 
  email          varchar(255) NOT NULL, 
  tenant         bool DEFAULT 'FALSE' NOT NULL, 
  owner          bool DEFAULT 'FALSE' NOT NULL, 
  connected      bool DEFAULT 'FALSE' NOT NULL, 
  user_id        int4 NOT NULL, 
  manager_id     int4 NOT NULL, 
  PRIMARY KEY (contact_id));
CREATE TABLE custom_template (
  template_id     SERIAL NOT NULL, 
  template_json   json NOT NULL, 
  title           varchar(255) NOT NULL, 
  description     varchar(255), 
  template_date   date DEFAULT CURRENT_DATE NOT NULL, 
  parent_template int4 NOT NULL, 
  manager_id      int4 NOT NULL, 
  PRIMARY KEY (template_id));
CREATE TABLE default_template (
  template_id   SERIAL NOT NULL, 
  template_json json NOT NULL, 
  title         varchar(255) NOT NULL, 
  description   varchar(255), 
  PRIMARY KEY (template_id));
CREATE TABLE inspection (
  inspection_id   SERIAL NOT NULL, 
  inspection_date date NOT NULL, 
  from_time       time(6) NOT NULL, 
  to_time         time(6) NOT NULL, 
  status          inspection_status DEFAULT 'scheduled' NOT NULL, 
  property_id     int4 NOT NULL, 
  manager_id      int4 NOT NULL, 
  itinerary_id    int4, 
  PRIMARY KEY (inspection_id), 
  CONSTRAINT inspection_date 
    CHECK (inspection_date >= CURRENT_DATE));
CREATE TABLE itinerary (
  itinerary_id   SERIAL NOT NULL, 
  itinerary_date date NOT NULL, 
  route_json     json NOT NULL, 
  manager_id     int4 NOT NULL, 
  PRIMARY KEY (itinerary_id), 
  CONSTRAINT itinerary_date 
    CHECK (itinerary_date >= CURRENT_DATE));
CREATE TABLE manager (
  manager_id int4 NOT NULL, 
  PRIMARY KEY (manager_id));
CREATE TABLE manager_artifact (
  artifact_id   SERIAL NOT NULL, 
  title         varchar(255) NOT NULL, 
  artifact_json json NOT NULL, 
  artifact_type artifact_type NOT NULL, 
  artifact_date date DEFAULT CURRENT_DATE NOT NULL, 
  status        artifact_status DEFAULT 'archived' NOT NULL, 
  manager_id    int4 NOT NULL, 
  PRIMARY KEY (artifact_id));
COMMENT ON TABLE manager_artifact IS 'report consists of inspection reports and notices';
CREATE TABLE manager_artifact_img (
  img_id    SERIAL NOT NULL, 
  img_dir   varchar(255) NOT NULL, 
  report_id int4 NOT NULL, 
  PRIMARY KEY (img_id));
CREATE TABLE manager_notification (
  notification_id    SERIAL NOT NULL, 
  text               varchar(255) NOT NULL, 
  timestamp          timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  source             source_type DEFAULT 'system' NOT NULL, 
  "read"             bool DEFAULT 'FALSE' NOT NULL, 
  sent               bool DEFAULT 'FALSE' NOT NULL, 
  manager_id         int4 NOT NULL, 
  tenant_artifact_id int4, 
  owner_artifact_id  int4, 
  PRIMARY KEY (notification_id));
CREATE TABLE manager_property_settings (
  property_id int4 NOT NULL, 
  img_dir     varchar(255), 
  manager_id  int4 NOT NULL, 
  PRIMARY KEY (property_id));
CREATE TABLE notice (
  notice_id       SERIAL NOT NULL, 
  message         varchar(500) NOT NULL, 
  recipient_email varchar(255) NOT NULL, 
  tenant          bool DEFAULT 'FALSE' NOT NULL, 
  owner           bool DEFAULT 'FALSE' NOT NULL, 
  notice_date     date NOT NULL, 
  notice_time     time NOT NULL, 
  sent            bool DEFAULT 'FALSE' NOT NULL, 
  manager_id      int4 NOT NULL, 
  contact_id      int4 NOT NULL, 
  PRIMARY KEY (notice_id));
CREATE TABLE owner (
  owner_id   int4 NOT NULL, 
  manager_id int4, 
  PRIMARY KEY (owner_id));
CREATE TABLE owner_artifact (
  artifact_id   SERIAL NOT NULL, 
  title         varchar(255) NOT NULL, 
  artifact_json json NOT NULL, 
  artifact_type artifact_type NOT NULL, 
  artifact_date date DEFAULT CURRENT_DATE NOT NULL, 
  status        artifact_status DEFAULT 'pending' NOT NULL, 
  owner_id      int4, 
  manager_id    int4, 
  inspection_id int4, 
  PRIMARY KEY (artifact_id));
CREATE TABLE owner_artifact_img (
  img_id      SERIAL NOT NULL, 
  title       varchar(255) NOT NULL, 
  img_dir     varchar(255) NOT NULL, 
  artifact_id int4 NOT NULL, 
  PRIMARY KEY (img_id));
CREATE TABLE owner_message (
  message_id  SERIAL NOT NULL, 
  text        varchar(5000) NOT NULL, 
  author_id   int4 NOT NULL, 
  author_name varchar(255) NOT NULL, 
  timestamp   timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  room_id     text NOT NULL, 
  PRIMARY KEY (message_id));
CREATE TABLE owner_notification (
  notification_id SERIAL NOT NULL, 
  text            varchar(255) NOT NULL, 
  timestamp       timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  "read"          bool DEFAULT 'FALSE' NOT NULL, 
  sent            bool DEFAULT 'FALSE' NOT NULL, 
  owner_id        int4 NOT NULL, 
  artifact_id     int4, 
  PRIMARY KEY (notification_id));
CREATE TABLE owner_property_settings (
  property_id int4 NOT NULL, 
  img_dir     varchar(255), 
  owner_id    int4 NOT NULL, 
  PRIMARY KEY (property_id));
CREATE TABLE owner_room (
  room_id    text DEFAULT 'o' || nextval('o_room') NOT NULL CHECK(room_id ~ '^o[0-9]+$'), 
  manager_id int4 NOT NULL, 
  owner_id   int4 NOT NULL, 
  PRIMARY KEY (room_id));
CREATE TABLE property (
  property_id           SERIAL NOT NULL, 
  address               varchar(255) NOT NULL, 
  post_code             numeric(4, 0) NOT NULL, 
  map_lat               numeric(18, 16) NOT NULL, 
  map_long              numeric(18, 15) NOT NULL, 
  leased                bool DEFAULT 'FALSE' NOT NULL, 
  lease_expiration_date date, 
  manager_id            int4, 
  owner_id              int4, 
  tenant_id             int4, 
  PRIMARY KEY (property_id), 
  CONSTRAINT lease_expiration_date 
    CHECK (lease_expiration_date > CURRENT_DATE), 
  CONSTRAINT long_range 
    CHECK (map_long >= -180.0 AND map_long <= 180.0), 
  CONSTRAINT lat_range 
    CHECK (map_lat >= -90.0 AND map_lat <= 90.0), 
  CONSTRAINT post_code_range 
    CHECK (post_code >= 0200 AND post_code <= 9999));
COMMENT ON CONSTRAINT long_range ON property IS 'Longitude must be between -180 and +180';
COMMENT ON CONSTRAINT lat_range ON property IS 'Latitude must be between -90 and +90';
COMMENT ON CONSTRAINT post_code_range ON property IS 'post code must be between 0200 and 9999 for Australia';
COMMENT ON COLUMN property.address IS 'as described in google maps';
CREATE TABLE reset_token_blacklist (
  token_id       SERIAL NOT NULL, 
  token          char(168) NOT NULL, 
  blacklist_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  PRIMARY KEY (token_id));
CREATE TABLE template_component (
  component_id   SERIAL NOT NULL, 
  component_json json NOT NULL, 
  component_type component_type NOT NULL, 
  name           int4 NOT NULL UNIQUE, 
  PRIMARY KEY (component_id));
CREATE TABLE tenant (
  tenant_id  int4 NOT NULL, 
  manager_id int4, 
  PRIMARY KEY (tenant_id));
CREATE TABLE tenant_artifact (
  artifact_id   SERIAL NOT NULL, 
  title         varchar(255) NOT NULL, 
  artifact_json json NOT NULL, 
  artifact_type artifact_type NOT NULL, 
  artifact_date date DEFAULT CURRENT_DATE NOT NULL, 
  status        artifact_status DEFAULT 'pending' NOT NULL, 
  tenant_id     int4, 
  manager_id    int4, 
  inspection_id int4, 
  PRIMARY KEY (artifact_id));
CREATE TABLE tenant_artifact_img (
  img_id      SERIAL NOT NULL, 
  title       varchar(255) NOT NULL, 
  img_dir     varchar(255) NOT NULL, 
  artifact_id int4 NOT NULL, 
  PRIMARY KEY (img_id));
CREATE TABLE tenant_message (
  message_id  SERIAL NOT NULL, 
  text        varchar(5000) NOT NULL, 
  author_id   int4 NOT NULL, 
  author_name varchar(255) NOT NULL, 
  timestamp   timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  room_id     text NOT NULL, 
  PRIMARY KEY (message_id));
CREATE TABLE tenant_notification (
  notification_id SERIAL NOT NULL, 
  text            varchar(255) NOT NULL, 
  timestamp       timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  "read"          bool DEFAULT 'FALSE' NOT NULL, 
  sent            bool DEFAULT 'FALSE' NOT NULL, 
  tenant_id       int4 NOT NULL, 
  artifact_id     int4, 
  PRIMARY KEY (notification_id));
CREATE TABLE tenant_room (
  room_id    text DEFAULT 't' || nextval('t_room') NOT NULL CHECK(room_id ~ '^t[0-9]+$'), 
  manager_id int4 NOT NULL, 
  tenant_id  int4 NOT NULL, 
  PRIMARY KEY (room_id));
CREATE TABLE token_blacklist (
  token_id       SERIAL NOT NULL, 
  token          char(168) NOT NULL, 
  blacklist_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  PRIMARY KEY (token_id));
CREATE UNIQUE INDEX abstract_user_email 
  ON abstract_user (email);
CREATE UNIQUE INDEX chat_token_blacklist_token 
  ON chat_token_blacklist (token);
CREATE INDEX inspection_from_time 
  ON inspection (from_time);
CREATE INDEX itinerary_itinerary_date 
  ON itinerary (itinerary_date);
CREATE INDEX manager_notification_timestamp 
  ON manager_notification (timestamp);
CREATE INDEX owner_artifact_artifact_date 
  ON owner_artifact (artifact_date);
CREATE INDEX owner_message_timestamp 
  ON owner_message (timestamp);
CREATE INDEX owner_notification_timestamp 
  ON owner_notification (timestamp);
CREATE UNIQUE INDEX owner_room_room_id 
  ON owner_room (room_id);
CREATE INDEX property_post_code 
  ON property (post_code);
CREATE UNIQUE INDEX reset_token_blacklist_token 
  ON reset_token_blacklist (token);
CREATE INDEX tenant_artifact_artifact_date 
  ON tenant_artifact (artifact_date);
CREATE INDEX tenant_message_timestamp 
  ON tenant_message (timestamp);
CREATE INDEX tenant_notification_timestamp 
  ON tenant_notification (timestamp);
CREATE UNIQUE INDEX tenant_room_room_id 
  ON tenant_room (room_id);
CREATE UNIQUE INDEX token_blacklist_token 
  ON token_blacklist (token);
ALTER TABLE owner ADD CONSTRAINT associated_with_owner FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Set null;
ALTER TABLE tenant ADD CONSTRAINT associated_with_tenant FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Set null;
ALTER TABLE inspection ADD CONSTRAINT books FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE manager_artifact ADD CONSTRAINT creates_artifact FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE custom_template ADD CONSTRAINT creates_template FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE manager_property_settings ADD CONSTRAINT described_by_manager_settings FOREIGN KEY (property_id) REFERENCES property (property_id) ON DELETE Cascade;
ALTER TABLE owner_property_settings ADD CONSTRAINT described_by_owner_settings FOREIGN KEY (property_id) REFERENCES property (property_id) ON DELETE Cascade;
ALTER TABLE owner_artifact ADD CONSTRAINT files_owner_artifact FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE Set null;
ALTER TABLE tenant_artifact ADD CONSTRAINT files_tenant_artifact FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE Set null;
ALTER TABLE manager_artifact_img ADD CONSTRAINT includes FOREIGN KEY (report_id) REFERENCES manager_artifact (artifact_id) ON DELETE Cascade;
ALTER TABLE owner_artifact_img ADD CONSTRAINT includes_owner_artifact_img FOREIGN KEY (artifact_id) REFERENCES owner_artifact (artifact_id) ON DELETE Cascade;
ALTER TABLE tenant_artifact_img ADD CONSTRAINT includes_tenant_artifact_img FOREIGN KEY (artifact_id) REFERENCES tenant_artifact (artifact_id) ON DELETE Cascade;
ALTER TABLE owner_artifact ADD CONSTRAINT inspection_owner_artifact FOREIGN KEY (inspection_id) REFERENCES inspection (inspection_id) ON DELETE Set null;
ALTER TABLE tenant_artifact ADD CONSTRAINT inspection_tenant_artifact FOREIGN KEY (inspection_id) REFERENCES inspection (inspection_id) ON DELETE Set null;
ALTER TABLE manager ADD CONSTRAINT is_manager FOREIGN KEY (manager_id) REFERENCES abstract_user (user_id) ON DELETE Cascade;
ALTER TABLE owner ADD CONSTRAINT is_owner FOREIGN KEY (owner_id) REFERENCES abstract_user (user_id) ON DELETE Cascade;
ALTER TABLE tenant ADD CONSTRAINT is_tenant FOREIGN KEY (tenant_id) REFERENCES abstract_user (user_id) ON DELETE Cascade;
ALTER TABLE owner_notification ADD CONSTRAINT linked_from_owner_notification FOREIGN KEY (artifact_id) REFERENCES owner_artifact (artifact_id);
ALTER TABLE tenant_notification ADD CONSTRAINT linked_from_tenant_notification FOREIGN KEY (artifact_id) REFERENCES tenant_artifact (artifact_id);
ALTER TABLE contact ADD CONSTRAINT listed_in FOREIGN KEY (user_id) REFERENCES abstract_user (user_id) ON UPDATE Cascade ON DELETE Cascade;
ALTER TABLE owner_room ADD CONSTRAINT manager_owner_room FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE tenant_room ADD CONSTRAINT manager_tenant_room FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE property ADD CONSTRAINT manages FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Set null;
ALTER TABLE contact ADD CONSTRAINT manages_contact_list FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE owner_artifact ADD CONSTRAINT manages_owner_artifact FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Set null;
ALTER TABLE tenant_artifact ADD CONSTRAINT manages_tenant_artifact FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Set null;
ALTER TABLE property ADD CONSTRAINT occupies FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE Set null;
ALTER TABLE inspection ADD CONSTRAINT organizes FOREIGN KEY (itinerary_id) REFERENCES itinerary (itinerary_id);
ALTER TABLE manager_notification ADD CONSTRAINT owner_artifact_manager_notification FOREIGN KEY (owner_artifact_id) REFERENCES owner_artifact (artifact_id);
ALTER TABLE owner_room ADD CONSTRAINT owner_owner_room FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE Cascade;
ALTER TABLE owner_message ADD CONSTRAINT owner_room_message FOREIGN KEY (room_id) REFERENCES owner_room (room_id) ON DELETE Cascade;
ALTER TABLE property ADD CONSTRAINT owns FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE Set null;
ALTER TABLE manager_notification ADD CONSTRAINT receives_manager_notification FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE notice ADD CONSTRAINT receives_notice FOREIGN KEY (contact_id) REFERENCES contact (contact_id) ON DELETE Cascade;
ALTER TABLE owner_notification ADD CONSTRAINT receives_owner_notification FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE Cascade;
ALTER TABLE tenant_notification ADD CONSTRAINT receives_tenant_notification FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE Cascade;
ALTER TABLE itinerary ADD CONSTRAINT schedules_itinerary FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE notice ADD CONSTRAINT schedules_notice FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE manager_property_settings ADD CONSTRAINT sets_manager_settings FOREIGN KEY (manager_id) REFERENCES manager (manager_id) ON DELETE Cascade;
ALTER TABLE owner_property_settings ADD CONSTRAINT sets_owner_settings FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE Cascade;
ALTER TABLE manager_notification ADD CONSTRAINT tenant_artifact_manager_notification FOREIGN KEY (tenant_artifact_id) REFERENCES tenant_artifact (artifact_id);
ALTER TABLE tenant_message ADD CONSTRAINT tenant_room_message FOREIGN KEY (room_id) REFERENCES tenant_room (room_id) ON DELETE Cascade;
ALTER TABLE tenant_room ADD CONSTRAINT tenant_tenant_room FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE Cascade;
ALTER TABLE inspection ADD CONSTRAINT undergoes FOREIGN KEY (property_id) REFERENCES property (property_id);


-----------------------------------------------------------------


---------------------Tenant Artifact Defaults--------------------
CREATE OR REPLACE FUNCTION set_defaults_tenant_artifact()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN
IF NEW.manager_id IS NULL THEN
	NEW.manager_id = (SELECT manager_id FROM tenant WHERE tenant_id = NEW.tenant_id);
END IF;
IF NEW.title IS NULL THEN
	CASE
		WHEN NEW.artifact_type = 'report_received' THEN
			NEW.title = concat('Report(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'report_due' THEN
			NEW.title = concat('Report_Request(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'request_repair' THEN
			NEW.title = concat('Repair_Request(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'notice' THEN
			NEW.title = concat('Notice(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'notice_leave' THEN
			NEW.title = concat('Leave_Notice(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'notice_eviction' THEN
			NEW.title = concat('Eviction_Notice(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'request_lease_extension' THEN
			NEW.title = concat('Lease_Extension(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'inspection' THEN
			NEW.title = concat('Inspection(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'connection_from_manager' OR NEW.artifact_type = 'connection_from_tenant' THEN
			NEW.title = concat('Connection_Request(', CURRENT_DATE, ')');
			--NEW.artifact_json = '{}';
	END CASE;
END IF;
RETURN NEW;
END; 
$$;
CREATE TRIGGER set_defaults_tenant_artifact
	BEFORE INSERT
	ON tenant_artifact
	FOR EACH ROW EXECUTE PROCEDURE set_defaults_tenant_artifact();
-----------------------------------------------------------------


--------------------Manager Artifact Defaults--------------------
CREATE OR REPLACE FUNCTION set_defaults_manager_artifact()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN
IF NEW.title IS NULL THEN
	CASE
		WHEN NEW.artifact_type = 'report_received' THEN
			NEW.title = concat('Report(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'report_due' THEN
			NEW.title = concat('Report_Request(', CURRENT_DATE, ')');
	END CASE;
END IF;
RETURN NEW;
END; 
$$;
CREATE TRIGGER set_defaults_manager_artifact
	BEFORE INSERT
	ON manager_artifact
	FOR EACH ROW EXECUTE PROCEDURE set_defaults_manager_artifact();
-----------------------------------------------------------------


---------------------Owner Artifact Defaults---------------------
CREATE OR REPLACE FUNCTION set_defaults_owner_artifact()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN
IF NEW.manager_id IS NULL THEN
	NEW.manager_id = (SELECT manager_id FROM owner WHERE owner_id = NEW.owner_id);
END IF;
IF NEW.title IS NULL THEN
	CASE
		WHEN NEW.artifact_type = 'report_received' THEN
			NEW.title = concat('Report(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'request_repair' THEN
			NEW.title = concat('Repair_Request(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'notice' THEN
			NEW.title = concat('Notice(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'notice_leave' THEN
			NEW.title = concat('Leave_Notice(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'notice_eviction' THEN
			NEW.title = concat('Eviction_Notice(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'request_listing' THEN
			NEW.title = concat('Listing(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'request_unlisting' THEN
			NEW.title = concat('Unlisting(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'request_lease_extension' THEN
			NEW.title = concat('Lease_Extension(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'inspection' THEN
			NEW.title = concat('Inspection(', CURRENT_DATE, ')');
		WHEN NEW.artifact_type = 'connection_from_manager' OR NEW.artifact_type = 'connection_from_owner' THEN
			NEW.title = concat('Connection_Request(', CURRENT_DATE, ')');
			--NEW.artifact_json = '{}';
	END CASE;
END IF;
RETURN NEW;
END; 
$$;

CREATE TRIGGER set_defaults_owner_artifact
	BEFORE INSERT
	ON owner_artifact
	FOR EACH ROW EXECUTE PROCEDURE set_defaults_owner_artifact();
-----------------------------------------------------------------


-------------------------Contact Defaults------------------------
CREATE OR REPLACE FUNCTION set_defaults_contact()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN
IF NEW.preferred_name IS NULL THEN
	NEW.preferred_name = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.user_id);
END IF;
RETURN NEW;
END; 
$$;
CREATE TRIGGER set_defaults_contact
	BEFORE INSERT
	ON contact
	FOR EACH ROW EXECUTE PROCEDURE set_defaults_contact();
-----------------------------------------------------------------


---------------------------Role INSERT---------------------------
CREATE OR REPLACE FUNCTION role_insert()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN
IF NEW.tenant IS TRUE THEN
	INSERT INTO tenant(tenant_id) VALUES(NEW.user_id);
	INSERT INTO tenant_notification(text, tenant_id) VALUES(FORMAT('Welcome %s! Get started by connecting with your property manager!', NEW.first_name), NEW.user_id);
END IF;
IF NEW.manager IS TRUE THEN
	INSERT INTO manager(manager_id) VALUES(NEW.user_id);
	INSERT INTO manager_notification(text, manager_id) VALUES(FORMAT('Welcome %s! Get started by adding your clients!', NEW.first_name), NEW.user_id);
END IF;
IF NEW.owner IS TRUE THEN
	INSERT INTO owner(owner_id) VALUES(NEW.user_id);
	INSERT INTO owner_notification(text, owner_id) VALUES(FORMAT('Welcome %s! Get started by connecting with your property manager!', NEW.first_name), NEW.user_id);
END IF;
RETURN NEW;
END; 
$$;
CREATE TRIGGER role_insert
	AFTER INSERT
	ON abstract_user
	FOR EACH ROW EXECUTE PROCEDURE role_insert();
-----------------------------------------------------------------


---------------------------Role DELETE---------------------------
CREATE OR REPLACE FUNCTION role_delete()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
DECLARE
	m_id int;
	name text;
BEGIN
name = concat_ws(' ', NEW.first_name, NEW.last_name);

IF NEW.tenant IS FALSE AND OLD.tenant IS TRUE THEN
	m_id = (SELECT manager_id FROM tenant WHERE tenant_id = NEW.user_id);
	IF m_id IS NOT NULL THEN
		INSERT INTO manager_notification(text, manager_id)
			VALUES(FORMAT('Tenant %s has deleted their account.', name),
					m_id);
		UPDATE contact SET tenant=FALSE WHERE user_id=New.user_id;
	END IF;
	DELETE FROM tenant WHERE tenant_id=NEW.user_id;		
END IF;

IF NEW.manager IS FALSE AND OLD.manager IS TRUE THEN
	INSERT INTO tenant_notification(text, tenant_id)
		SELECT FORMAT('Your manager %s has deleted their account.', name) as text, t.tenant_id as tenant_id
		FROM tenant as t WHERE t.manager_id = NEW.user_id;
	INSERT INTO owner_notification(text, owner_id)
		SELECT FORMAT('Your manager %s has deleted their account.', name) as text, o.owner_id as owner_id
		FROM owner as o WHERE o.manager_id = NEW.user_id;
	DELETE FROM manager WHERE manager_id=NEW.user_id;	
END IF;

IF NEW.owner IS FALSE AND OLD.owner IS TRUE THEN
	m_id = (SELECT manager_id FROM owner WHERE owner_id = NEW.user_id);
	IF m_id IS NOT NULL THEN
		INSERT INTO manager_notification(text, manager_id)
			VALUES(FORMAT('Owner %s has deleted their account.', name),
					m_id);
		UPDATE contact SET owner=FALSE WHERE user_id=New.user_id;
	END IF;
	DELETE FROM owner WHERE owner_id=NEW.user_id;
END IF;

RETURN NEW;
END; 
$$;
CREATE TRIGGER role_delete
	AFTER UPDATE
	ON abstract_user
	FOR EACH ROW EXECUTE PROCEDURE role_delete();
-----------------------------------------------------------------


--------------------------Account DELETE-------------------------
CREATE OR REPLACE FUNCTION account_delete()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN
	DELETE FROM abstract_user WHERE user_id = OLD.user_id;
  	RETURN NULL;

--IF NEW.tenant IS FALSE AND NEW.manager IS FALSE AND NEW.owner IS FALSE THEN
--	NEW.status = 'inactive';
--END IF;
--RETURN NEW;

END; 
$$;
CREATE TRIGGER account_delete
	BEFORE UPDATE
	ON abstract_user
	FOR EACH ROW
	WHEN (NEW.tenant IS FALSE AND NEW.manager IS FALSE AND NEW.owner IS FALSE)
	EXECUTE PROCEDURE account_delete();
-----------------------------------------------------------------


--------------------------Contact UPDATE-------------------------
CREATE OR REPLACE FUNCTION contact_update()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN

IF NEW.tenant IS FALSE AND OLD.tenant IS TRUE AND OLD.connected IS TRUE THEN
	DELETE FROM notice WHERE contact_id=NEW.contact_id AND tenant IS TRUE;
	UPDATE tenant SET manager_id = NULL WHERE tenant_id = NEW.user_id AND manager_id = NEW.manager_id;
	DELETE FROM tenant_room WHERE tenant_id = NEW.user_id;
	INSERT INTO tenant_notification(text, tenant_id)
		VALUES('Your manager has disconnected with you.',
				OLD.user_id);
END IF;

IF NEW.owner IS FALSE AND OLD.owner IS TRUE AND OLD.connected IS TRUE THEN
	DELETE FROM notice WHERE contact_id=NEW.contact_id AND owner IS TRUE;
	UPDATE owner SET manager_id = NULL WHERE owner_id = NEW.user_id AND manager_id = NEW.manager_id;
	DELETE FROM owner_rom WHERE owner_id = NEW.user_id;
	INSERT INTO owner_notification(text, owner_id)
		VALUES('Your manager has disconnected with you.',
				OLD.user_id);
END IF;

IF NEW.tenant IS TRUE AND NEW.connected IS TRUE THEN
	INSERT INTO tenant_room(tenant_id, manager_id) VALUES(NEW.user_id, NEW.manager_id);
END IF;

IF NEW.owner IS TRUE AND NEW.connected IS TRUE THEN
	INSERT INTO owner_room(owner_id, manager_id) VALUES(NEW.user_id, NEW.manager_id);
END IF;

RETURN NEW;
END; 
$$;
CREATE TRIGGER contact_update
	AFTER UPDATE
	ON contact
	FOR EACH ROW EXECUTE PROCEDURE contact_update();
-----------------------------------------------------------------


--------------------------Contact DELETE-------------------------
CREATE OR REPLACE FUNCTION contact_delete()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN
	UPDATE tenant SET manager_id = NULL WHERE tenant_id = OLD.user_id AND manager_id = OLD.manager_id;
	UPDATE owner SET manager_id = NULL WHERE owner_id = OLD.user_id AND manager_id = OLD.manager_id;
	DELETE FROM contact WHERE contact_id = OLD.contact_id;
	RETURN NULL;
RETURN NEW;
END; 
$$;
CREATE TRIGGER contact_delete
	BEFORE UPDATE
	ON contact
	FOR EACH ROW
	WHEN (NEW.tenant IS FALSE AND NEW.owner IS FALSE)
	EXECUTE PROCEDURE contact_delete();
-----------------------------------------------------------------


------------Association DELETE AFTER Contact DELETE--------------
CREATE OR REPLACE FUNCTION association_delete()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$ 
BEGIN
	UPDATE tenant SET manager_id = NULL WHERE tenant_id = OLD.user_id AND manager_id = OLD.manager_id;
	UPDATE owner SET manager_id = NULL WHERE owner_id = OLD.user_id AND manager_id = OLD.manager_id;
	IF OLD.tenant IS TRUE THEN
		INSERT INTO tenant_notification(text, tenant_id)
			VALUES('Your manager has disconnected with you.',
					OLD.user_id);
	END IF;
	
	IF OLD.owner IS TRUE THEN
		INSERT INTO owner_notification(text, owner_id)
			VALUES('Your manager has disconnected with you.',
					OLD.user_id);
	END IF;
		
	DELETE FROM tenant_room WHERE tenant_id = OLD.user_id AND manager_id = OLD.manager_id;
	DELETE FROM owner_room WHERE owner_id = OLD.user_id AND manager_id = OLD.manager_id;
RETURN NULL;
END; 
$$;
CREATE TRIGGER association_delete
	AFTER DELETE
	ON contact
	FOR EACH ROW
	EXECUTE PROCEDURE association_delete();
-----------------------------------------------------------------


--------------Tenant Artifact INSERT Notifications---------------
CREATE OR REPLACE FUNCTION tenant_artifact_notificaiton_insert()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$
DECLARE
	tenant text;
	tenant_original_name text;
	manager text;
BEGIN
	tenant = (SELECT preferred_name FROM contact WHERE user_id = NEW.tenant_id);
	tenant_original_name = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.tenant_id);
	manager = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.manager_id);
	CASE
		WHEN NEW.artifact_type = 'report_received' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('You have received a new report.',
					NEW.tenant_id,
					NEW.artifact_id);

		WHEN NEW.artifact_type = 'report_due' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Your property manager has requested you to fill a report.',
					NEW.tenant_id,
					NEW.artifact_id);
					
		WHEN NEW.artifact_type = 'connection_from_manager' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES(FORMAT('You have received a new connection request from %s.', manager),
					NEW.tenant_id,
					NEW.artifact_id);
					
		WHEN NEW.artifact_type = 'connection_from_tenant' THEN
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('You have received a new connection request from %s.', tenant_original_name),
					'tenant',
					NEW.manager_id,
					NEW.artifact_id);
					
		WHEN NEW.artifact_type = 'notice' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Your property manager has sent you a notice.',
					NEW.tenant_id,
					NEW.artifact_id);

		WHEN NEW.artifact_type = 'notice_eviction' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Your property manager has sent you an eviction notice.',
					NEW.tenant_id,
					NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_repair' THEN
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('%s has requested a repair.', tenant),
				   'tenant',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_lease_extension' THEN
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('%s has requested an extension on their lease.', tenant),
				   'tenant',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES(FORMAT('An inspection for the property you currently occupy has been scheduled on %s at %s.', TO_CHAR(CAST(NEW.artifact_json->>'inspection_date' AS DATE), 'DD Mon YYYY'), NEW.artifact_json->>'from_time'),
				   NEW.tenant_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'notice_leave' THEN
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('%s has sent you a notice leave.', tenant),
				   'tenant',
				   NEW.manager_id,
				   NEW.artifact_id);
			UPDATE property SET lease_expiration_date = CAST(NEW.artifact_json->>'leave_date' AS DATE) WHERE tenant_id = NEW.tenant_id;
	END CASE;
RETURN NEW;
END;
$$;
CREATE TRIGGER tenant_artifact_notificaiton_insert
	AFTER INSERT
	ON tenant_artifact
	FOR EACH ROW EXECUTE PROCEDURE tenant_artifact_notificaiton_insert();
-----------------------------------------------------------------


--------------Tenant Artifact UPDATE Notifications---------------
CREATE OR REPLACE FUNCTION tenant_artifact_notificaiton_update()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$
DECLARE
	tenant text;
	tenant_original_name text;
	tenant_email text;
	manager text;
BEGIN
	tenant = (SELECT preferred_name FROM contact WHERE user_id = NEW.tenant_id);
	tenant_original_name = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.tenant_id);
	tenant_email = (SELECT email FROM abstract_user WHERE user_id = NEW.tenant_id);
	manager = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.manager_id);
	CASE
		WHEN NEW.artifact_type = 'report_due' AND NEW.status = 'fulfilled' THEN
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('%s has filled the report you sent them.', tenant),
				   'tenant',
				   NEW.manager_id,
				   NEW.artifact_id);
				   
		WHEN NEW.artifact_type = 'connection_from_manager' AND NEW.status = 'approved_by_tenant' THEN
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('Tenant %s has accepted your connection request. You are now connected', tenant_original_name),
				   'tenant',
				   NEW.manager_id,
				   NEW.artifact_id);
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES(FORMAT('You are now connected with %s.', manager),
				   NEW.tenant_id,
				   NEW.artifact_id);
			UPDATE tenant SET manager_id = NEW.manager_id WHERE tenant_id = NEW.tenant_id;
			UPDATE contact SET connected = TRUE WHERE manager_id = NEW.manager_id AND user_id = NEW.tenant_id;
			
		WHEN NEW.artifact_type = 'connection_from_manager' AND NEW.status = 'denied_by_tenant' THEN
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('Tenant %s has denied your connection request.', tenant_original_name),
				   'tenant',
				   NEW.manager_id,
				   NEW.artifact_id);
			DELETE FROM contact WHERE manager_id = NEW.manager_id AND user_id = NEW.tenant_id AND connected IS FALSE;
			
		WHEN NEW.artifact_type = 'connection_from_tenant' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES(FORMAT('Manager %s has accepted your connection request. You are now connected', manager),
				   NEW.tenant_id,
				   NEW.artifact_id);
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('You are now connected with Tenant %s.', tenant_original_name),
				   'system',
				   NEW.manager_id,
				   NEW.artifact_id);
			UPDATE tenant SET manager_id = NEW.manager_id WHERE tenant_id = NEW.tenant_id;
			
			IF EXISTS (SELECT * FROM contact WHERE manager_id = NEW.manager_id AND user_id = NEW.tenant_id) THEN
				UPDATE contact SET tenant = TRUE, connected = TRUE WHERE manager_id = NEW.manager_id AND user_id = NEW.tenant_id;
			ELSE
				INSERT INTO contact(preferred_name, email, tenant, connected, user_id, manager_id)
					VALUES(FORMAT('%s', tenant_original_name), FORMAT('%s', tenant_email), TRUE, TRUE, NEW.tenant_id, NEW.manager_id);
			END IF;
			
			--UPDATE contact SET tenant = TRUE, connected = TRUE WHERE manager_id = NEW.manager_id AND user_id = NEW.tenant_id;
			--INSERT INTO contact(preferred_name, email, tenant, connected, user_id, manager_id)
			--		VALUES(FORMAT('%s', tenant_original_name), FORMAT('%s', tenant_email), TRUE, TRUE, NEW.tenant_id, NEW.manager_id)
			--		WHERE NOT EXISTS (SELECT contact_id FROM contact WHERE manager_id = NEW.manager_id AND user_id = NEW.tenant_id);
			
		WHEN NEW.artifact_type = 'connection_from_tenant' AND NEW.status = 'denied_by_manager' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES(FORMAT('Manager %s has denied your connection request.', manager),
				   NEW.tenant_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_repair' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Your repair request has been approved.',
				   NEW.tenant_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_repair' AND NEW.status = 'denied_by_manager' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Your repair request has been denied.',
				   NEW.tenant_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_lease_extension' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Your request for lease extension has been approved.',
				   NEW.tenant_id,
				   NEW.artifact_id);
			UPDATE property SET lease_expiration_date = CAST(NEW.artifact_json->>'extension_date' AS DATE) WHERE tenant_id = NEW.tenant_id;
			----------------------------

		WHEN NEW.artifact_type = 'request_lease_extension' AND NEW.status = 'denied_by_manager' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Your request for lease extension has been denied.',
				   NEW.tenant_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'rescheduled' and OLD.status = 'reschedule' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES(FORMAT('Inspection reschedule has been approved and rescheduled to %s at %s.', TO_CHAR(CAST(NEW.artifact_json->>'inspection_date' AS DATE), 'DD Mon YYYY'), NEW.artifact_json->>'from_time'),
				   NEW.tenant_id,
				   NEW.artifact_id);
				   
		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'rescheduled' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES(FORMAT('Inspection rescheduled to %s at %s.', TO_CHAR(CAST(NEW.artifact_json->>'inspection_date' AS DATE), 'DD Mon YYYY'), NEW.artifact_json->>'from_time'),
				   NEW.tenant_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'denied_by_manager' and OLD.status = 'reschedule' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Inspection reschedule has been denied.',
				   NEW.tenant_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'reschedule' THEN
			INSERT INTO manager_notification(text, source, manager_id, tenant_artifact_id)
			VALUES(FORMAT('%s has requested to reschedule an inspection.', tenant),
				   'tenant',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'canceled' THEN
			INSERT INTO tenant_notification(text, tenant_id, artifact_id)
			VALUES('Inspection canceled.',
				   NEW.tenant_id,
				   NEW.artifact_id);

	END CASE;
RETURN NEW;
END;
$$;
CREATE TRIGGER tenant_artifact_notificaiton_update
	AFTER UPDATE OF status
	ON tenant_artifact
	FOR EACH ROW EXECUTE PROCEDURE tenant_artifact_notificaiton_update();
-----------------------------------------------------------------


--------------Owner Artifact INSERT Notifications----------------
CREATE OR REPLACE FUNCTION owner_artifact_notificaiton_insert()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$
DECLARE
	owner text;
	owner_original_name text;
	manager text;
BEGIN
	owner = (SELECT preferred_name FROM contact WHERE user_id = new.owner_id);
	owner_original_name = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.owner_id);
	manager = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.manager_id);
	CASE
		WHEN NEW.artifact_type = 'report_received' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('You have received a new report.',
				   NEW.owner_id,
				   NEW.artifact_id);
				   
		WHEN NEW.artifact_type = 'connection_from_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES(FORMAT('You have received a new connection request from %s.', manager),
					NEW.owner_id,
					NEW.artifact_id);
					
		WHEN NEW.artifact_type = 'connection_from_owner' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('You have received a new connection request from %s.', owner_original_name),
					'owner',
					NEW.manager_id,
					NEW.artifact_id);
					
		WHEN NEW.artifact_type = 'notice' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has sent you a notice.',
					NEW.owner_id,
					NEW.artifact_id);

		WHEN NEW.artifact_type = 'notice_eviction' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('%s has requested an eviction of their property.', owner),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);
			UPDATE property SET lease_expiration_date = CAST(NEW.artifact_json->>'eviction_date' AS DATE) WHERE owner_id = NEW.owner_id AND property_id = CAST(NEW.artifact_json->>'property_id' AS INTEGER);

		WHEN NEW.artifact_type = 'request_listing' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('%s has requested to list a property.', owner),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_unlisting' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('%s has requested to unlist a property.', owner),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_repair' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('You have received a repair request.',
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_lease_extension' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('You have received a lease extension request.',
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'notice_leave' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has forwarded a leave notice.',
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES(FORMAT('An inspection for one of your properties has been scheduled on %s at %s.', TO_CHAR(CAST(NEW.artifact_json->>'inspection_date' AS DATE), 'DD Mon YYYY'), NEW.artifact_json->>'from_time'),
				   NEW.owner_id,
				   NEW.artifact_id);
			
	END CASE;
RETURN NEW;
END;
$$;
CREATE TRIGGER owner_artifact_notificaiton_insert
	AFTER INSERT
	ON owner_artifact
	FOR EACH ROW EXECUTE PROCEDURE owner_artifact_notificaiton_insert();
-----------------------------------------------------------------


--------------Owner Artifact UPDATE Notifications----------------
CREATE OR REPLACE FUNCTION owner_artifact_notificaiton_update()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$
DECLARE
	owner text;
	owner_original_name text;
	owner_email text;
	manager text;
BEGIN
	owner = (SELECT preferred_name FROM contact WHERE user_id = new.owner_id);
	owner_original_name = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.owner_id);
	owner_email = (SELECT email FROM abstract_user WHERE user_id = NEW.owner_id);
	manager = (SELECT concat_ws(' ', first_name, last_name) AS name FROM abstract_user WHERE user_id = NEW.manager_id);
	CASE
		WHEN NEW.artifact_type = 'connection_from_manager' AND NEW.status = 'approved_by_owner' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('Owner %s has accepted your connection request. You are now connected', owner_original_name),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES(FORMAT('You are now connected with %s.', manager),
				   NEW.owner_id,
				   NEW.artifact_id);
			UPDATE owner SET manager_id = NEW.manager_id WHERE owner_id = NEW.owner_id;
			UPDATE contact SET connected = TRUE WHERE manager_id = NEW.manager_id AND user_id = NEW.owner_id;
			
		WHEN NEW.artifact_type = 'connection_from_manager' AND NEW.status = 'denied_by_owner' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('Owner %s has denied your connection request.', owner_original_name),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);
			DELETE FROM contact WHERE manager_id = NEW.manager_id AND user_id = NEW.owner_id AND connected IS FALSE;
			
		WHEN NEW.artifact_type = 'connection_from_owner' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES(FORMAT('Manager %s has accepted your connection request. You are now connected', manager),
				   NEW.owner_id,
				   NEW.artifact_id);
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('You are now connected with Owner %s.', owner_original_name),
				   'system',
				   NEW.manager_id,
				   NEW.artifact_id);
			UPDATE owner SET manager_id = NEW.manager_id WHERE owner_id = NEW.owner_id;
			
			IF EXISTS (SELECT * FROM contact WHERE manager_id = NEW.manager_id AND user_id = NEW.owner_id) THEN
				UPDATE contact SET owner = TRUE, connected = TRUE WHERE manager_id = NEW.manager_id AND user_id = NEW.owner_id;
			ELSE
				INSERT INTO contact(preferred_name, email, owner, connected, user_id, manager_id)
					VALUES(FORMAT('%s', owner_original_name), FORMAT('%s', owner_email), TRUE, TRUE, NEW.owner_id, NEW.manager_id);
			END IF;
			
			--UPDATE contact SET owner = TRUE, connected = TRUE WHERE manager_id = NEW.manager_id AND user_id = NEW.owner_id;
			--INSERT INTO contact(preferred_name, email, owner, connected, user_id, manager_id)
			--	VALUES(FORMAT('%s', owner_original_name), FORMAT('%s', owner_email), TRUE, TRUE, NEW.owner_id, NEW.manager_id)
			--	WHERE NOT EXISTS (SELECT contact_id FROM contact WHERE manager_id = NEW.manager_id AND user_id = NEW.owner_id);
			
		WHEN NEW.artifact_type = 'connection_from_owner' AND NEW.status = 'denied_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES(FORMAT('Manager %s has denied your connection request.', manager),
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'notice_eviction' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has approved and forwarded the eviction notice.',
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_listing' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has listed your property.',
				   NEW.owner_id,
				   NEW.artifact_id);
			UPDATE property
				SET manager_id = NEW.manager_id
				WHERE property.property_id = CAST(NEW.artifact_json->>'property_id' AS INTEGER);
				
			--WITH properties AS (SELECT artifact_json->>'property_id' AS pid FROM owner_artifact WHERE artifact_id = NEW.artifact_id)
				--UPDATE property
					--SET manager_id = NEW.manager_id
				--FROM properties
				--WHERE property.property_id = properties.pid::INTEGER;

		WHEN NEW.artifact_type = 'request_listing' AND NEW.status = 'denied_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has denied your request for property listing.',
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_unlisting' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has unlisted your property.',
				   NEW.owner_id,
				   NEW.artifact_id);
			UPDATE property
				SET manager_id = NULL
				WHERE property.property_id = CAST(NEW.artifact_json->>'property_id' AS INTEGER);	   
				   
			--WITH properties AS (SELECT artifact_json->>'property_id' AS pid FROM owner_artifact WHERE artifact_id = NEW.artifact_id)
				--UPDATE property
					--SET manager_id = NULL
				--FROM properties
				--WHERE property.property_id = properties.pid::INTEGER;
				   
		WHEN NEW.artifact_type = 'request_unlisting' AND NEW.status = 'denied_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has denied your request for property unlisting.',
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_repair' AND NEW.status = 'approved_by_owner' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('%s has approved a repair request.', owner),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_repair' AND NEW.status = 'denied_by_owner' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('%s has denied a repair request.', owner),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_repair' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has approved a repair request for one of your properties.',
				   NEW.owner_id,
				   NEW.artifact_id);
			UPDATE tenant_artifact SET status = 'approved_by_manager' WHERE artifact_id = CAST(NEW.artifact_json->>'tenant_artifact_id' AS INTEGER) AND tenant_id = CAST(NEW.artifact_json->>'tenant_id' AS INTEGER);
			------------------------------------------

		WHEN NEW.artifact_type = 'request_repair' AND NEW.status = 'denied_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has denied a repair request for one of your properties.',
				   NEW.owner_id,
				   NEW.artifact_id);
			UPDATE tenant_artifact SET status = 'denied_by_manager' WHERE artifact_id = CAST(NEW.artifact_json->>'tenant_artifact_id' AS INTEGER) AND tenant_id = CAST(NEW.artifact_json->>'tenant_id' AS INTEGER);
			------------------------------------------

		WHEN NEW.artifact_type = 'request_lease_extension' AND NEW.status = 'approved_by_owner' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('%s has approved lease extension for their property.', owner),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'request_lease_extension' AND NEW.status = 'denied_by_owner' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('%s has denied lease extension for their property.', owner),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);
				   
		WHEN NEW.artifact_type = 'request_lease_extension' AND NEW.status = 'approved_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has approved a lease extension for one of your properties.',
				   NEW.owner_id,
				   NEW.artifact_id);
			UPDATE tenant_artifact SET status = 'approved_by_manager' WHERE artifact_id = CAST(NEW.artifact_json->>'tenant_artifact_id' AS INTEGER) AND tenant_id = CAST(NEW.artifact_json->>'tenant_id' AS INTEGER);
			------------------------------------------

		WHEN NEW.artifact_type = 'request_lease_extension' AND NEW.status = 'denied_by_manager' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Your property manager has denied a lease extension for one of your properties.',
				   NEW.owner_id,
				   NEW.artifact_id);
			UPDATE tenant_artifact SET status = 'denied_by_manager' WHERE artifact_id = CAST(NEW.artifact_json->>'tenant_artifact_id' AS INTEGER) AND tenant_id = CAST(NEW.artifact_json->>'tenant_id' AS INTEGER);
			------------------------------------------
				   
		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'rescheduled' and OLD.status = 'reschedule' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES(FORMAT('Inspection reschedule has been approved and rescheduled to %s at %s.', TO_CHAR(CAST(NEW.artifact_json->>'inspection_date' AS DATE), 'DD Mon YYYY'), NEW.artifact_json->>'from_time'),
				   NEW.owner_id,
				   NEW.artifact_id);
				   
		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'rescheduled' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES(FORMAT('Inspection rescheduled to %s at %s.', TO_CHAR(CAST(NEW.artifact_json->>'inspection_date' AS DATE), 'DD Mon YYYY'), NEW.artifact_json->>'from_time'),
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'denied_by_manager' and OLD.status = 'reschedule' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Inspection reschedule has been denied.',
				   NEW.owner_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'reschedule' THEN
			INSERT INTO manager_notification(text, source, manager_id, owner_artifact_id)
			VALUES(FORMAT('%s has requested to reschedule an inspection.', owner),
				   'owner',
				   NEW.manager_id,
				   NEW.artifact_id);

		WHEN NEW.artifact_type = 'inspection' AND NEW.status = 'canceled' THEN
			INSERT INTO owner_notification(text, owner_id, artifact_id)
			VALUES('Inspection canceled.',
				   NEW.owner_id,
				   NEW.artifact_id);

	END CASE;
RETURN NEW;
END;
$$;
CREATE TRIGGER owner_artifact_notificaiton_update
	AFTER UPDATE OF status
	ON owner_artifact
	FOR EACH ROW EXECUTE PROCEDURE owner_artifact_notificaiton_update();
-----------------------------------------------------------------


--------------Inspection INSERT Notifications--------------------
CREATE OR REPLACE FUNCTION inspection_notification_insert()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$
DECLARE
	o_id int;
	t_id int;
BEGIN
	o_id = (SELECT owner_id FROM property WHERE property_id = NEW.property_id);
	t_id = (SELECT tenant_id FROM property WHERE property_id = NEW.property_id);
	
	INSERT INTO owner_artifact(artifact_json, artifact_type, status, owner_id, manager_id, inspection_id)
	VALUES(FORMAT('{"inspection_date":"%s", "from_time":"%s"}', TO_CHAR(NEW.inspection_date, 'YYYY-MM-DD'), TO_CHAR(NEW.from_time, 'HH12:MI AM'))::json, 'inspection', 'scheduled', o_id, NEW.manager_id, NEW.inspection_id);
	
	IF t_id IS NOT NULL THEN
		INSERT INTO tenant_artifact(artifact_json, artifact_type, status, tenant_id, manager_id, inspection_id)
		VALUES(FORMAT('{"inspection_date":"%s", "from_time":"%s"}', TO_CHAR(NEW.inspection_date, 'YYYY-MM-DD'), TO_CHAR(NEW.from_time, 'HH12:MI AM'))::json, 'inspection', 'scheduled', t_id, NEW.manager_id, NEW.inspection_id);
	END IF;
RETURN NEW;	
END;
$$;
CREATE TRIGGER inspection_notification_insert
	AFTER INSERT
	ON inspection
	FOR EACH ROW EXECUTE PROCEDURE inspection_notification_insert();
-----------------------------------------------------------------


--------------Inspection UPDATE Notifications--------------------
CREATE OR REPLACE FUNCTION inspection_notificaiton_update()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$
BEGIN
	CASE
		WHEN NEW.status = 'canceled' THEN
			UPDATE tenant_artifact
			SET status = 'canceled'
			WHERE tenant_artifact.inspection_id = NEW.inspection_id;
			
			UPDATE owner_artifact
			SET status = 'canceled'
			WHERE owner_artifact.inspection_id = NEW.inspection_id;

		WHEN NEW.status = 'rescheduled' THEN
			UPDATE tenant_artifact
			SET status = 'rescheduled',
			    --artifact_date = NEW.inspection_date
			    artifact_json = FORMAT('{"inspection_date":"%s", "from_time":"%s"}', TO_CHAR(NEW.inspection_date, 'YYYY-MM-DD'), TO_CHAR(NEW.from_time, 'HH12:MI AM'))::json
			WHERE tenant_artifact.inspection_id = NEW.inspection_id;
			
			UPDATE owner_artifact
			SET status = 'rescheduled',
			    --artifact_date = NEW.inspection_date
			    artifact_json = FORMAT('{"inspection_date":"%s", "from_time":"%s"}', TO_CHAR(NEW.inspection_date, 'YYYY-MM-DD'), TO_CHAR(NEW.from_time, 'HH12:MI AM'))::json
			WHERE owner_artifact.inspection_id = NEW.inspection_id;

	END CASE;
RETURN NEW;
END;
$$;
CREATE TRIGGER inspection_notificaiton_update
	AFTER UPDATE OF status
	ON inspection
	FOR EACH ROW EXECUTE PROCEDURE inspection_notificaiton_update();
-----------------------------------------------------------------


---------------Property UPDATE Notifications---------------------
CREATE OR REPLACE FUNCTION property_notificaiton_update()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS $$
BEGIN
	CASE
	
		WHEN NEW.tenant_id != OLD.tenant_id THEN
			INSERT INTO tenant_notification(text, tenant_id)
			VALUES(FORMAT('You are now occupying %s', NEW.address), NEW.tenant_id);
			
		WHEN OLD.tenant_id IS NULL AND NEW.tenant_id IS NOT NULL THEN
			INSERT INTO tenant_notification(text, tenant_id)
			VALUES(FORMAT('You are now occupying %s', NEW.address), NEW.tenant_id);
			
		WHEN NEW.leased IS TRUE AND OLD.leased IS FALSE THEN
			INSERT INTO owner_notification(text, owner_id)
			VALUES(FORMAT('Property: %s is now leased', NEW.address), NEW.owner_id);
			
		WHEN NEW.leased IS FALSE AND OLD.leased IS TRUE THEN
			INSERT INTO owner_notification(text, owner_id)
			VALUES(FORMAT('Property: %s is now unleased', NEW.address), NEW.owner_id);
			
		ELSE NULL;
		
	END CASE;
RETURN NEW;
END;
$$;
CREATE TRIGGER property_notificaiton_update
	AFTER UPDATE
	ON property
	FOR EACH ROW EXECUTE PROCEDURE property_notificaiton_update();
-----------------------------------------------------------------
-----------------------------------------------------------------
-----------------------------------------------------------------
-----------------------------------------------------------------




-------------------------------------------TEST DATA---------------------------------------------------
INSERT INTO abstract_user (first_name, last_name, email, password_hash, tenant, secret_question, secret_answer_hash)
VALUES( 'test',
		'tenant', 
		'tenant@gmail.com', 
		'sha256$yqK7fbcZYzGDxZHs$28d1db3d23406f6aba002889d81a53f90c259808552bb404bd77449082b43b26', 
		TRUE, 
		'What is your favorite book?', 
		'sha256$xjND2x3dCAHSBy0W$d2f50a5991d48664af98d59b83be3058bcc049ec2afeee805071f82358e854d3');
		
INSERT INTO abstract_user (first_name, last_name, email, password_hash, manager, secret_question, secret_answer_hash)
VALUES( 'test', 
		'manager', 
		'manager@gmail.com', 
		'sha256$yDP9xxt2yPh4Yz0U$5000112015cca5e403e70c52290a51d3e17d4a0b7006aa84de624e49ef0a96d4', 
		TRUE, 
		'What is your favorite book?', 
		'sha256$muYBZs4giBUDcaXn$1da6a37a24a24a058114b230dea14c1d3893a27856ac86f01fa2eccf861958ec');
		
INSERT INTO abstract_user (first_name, last_name, email, password_hash, owner, secret_question, secret_answer_hash)
VALUES( 'test', 
		'owner', 
		'owner@gmail.com', 
		'sha256$MZ4C2LXUHLYA5uSC$47c069c9efbe553d264126e68582c841746ee7b698a704e7d523f587ad76e724', 
		TRUE, 
		'What is your favorite book?', 
		'sha256$Rs5btkvq3JjJfE1W$d562bb8322abaa7e4d7d3c7658e76d4dadf6240aff3fd930b2bf91e5676b1913');

INSERT INTO abstract_user (first_name, last_name, email, password_hash, tenant, secret_question, secret_answer_hash)
VALUES( 'Tenant',
		'Two', 
		'tenant2@gmail.com', 
		'sha256$yqK7fbcZYzGDxZHs$28d1db3d23406f6aba002889d81a53f90c259808552bb404bd77449082b43b26', 
		TRUE, 
		'What is your favorite book?', 
		'sha256$xjND2x3dCAHSBy0W$d2f50a5991d48664af98d59b83be3058bcc049ec2afeee805071f82358e854d3');

INSERT INTO abstract_user (first_name, last_name, email, password_hash, tenant, secret_question, secret_answer_hash)
VALUES( 'Tenant',
		'Three', 
		'tenant3@gmail.com', 
		'sha256$yqK7fbcZYzGDxZHs$28d1db3d23406f6aba002889d81a53f90c259808552bb404bd77449082b43b26', 
		TRUE, 
		'What is your favorite book?', 
		'sha256$xjND2x3dCAHSBy0W$d2f50a5991d48664af98d59b83be3058bcc049ec2afeee805071f82358e854d3');

---- ADDED BY DANIEL FOR ITINERARIES TESTING ----
INSERT INTO abstract_user (first_name, last_name, email, password_hash, tenant, owner, manager, secret_question, secret_answer_hash)
VALUES( 'First',
		'Last',
		'user@email.com',
		'sha256$d75MebBYlny3WXh8$47cd75fd9a6d33e7da82050b1c21905bf2153bb266e50af0ed97b50d748bfd82',
		TRUE,
		TRUE,
		TRUE,
		'Q?',
		'sha256$wvuNnRHmhyGjxCRv$51768a6337a6b7d1ea3a2fb0a2d3d26e6a2b1ff1e4c61a8344e940a504288fad');

INSERT INTO abstract_user (first_name, last_name, email, password_hash, tenant, secret_question, secret_answer_hash)
VALUES( 'Tenant',
		'One', 
		'tenant1@gmail.com', 
		'sha256$haYY9366VJ6NhPMs$d2c5959e710a976a3254ed5207c43a100142dd999f7d2644809e9ac20fc2652e', 
		TRUE, 
		'What is your password?', 
		'sha256$haYY9366VJ6NhPMs$d2c5959e710a976a3254ed5207c43a100142dd999f7d2644809e9ac20fc2652e');

INSERT INTO property (address, post_code, map_lat, map_long, leased, manager_id, tenant_id, owner_id) 
VALUES( '55 Church Av, Mascot', 2020, -33.922274, 151.185982, true, 6, 4, 3);

INSERT INTO property (address, post_code, map_lat, map_long, leased, manager_id, tenant_id, owner_id) 
VALUES( 'U24, 34 Barber Av, Eastlakes', 2018, -33.925, 151.213, true, 6, 5, 3);

INSERT INTO property (address, post_code, map_lat, map_long, leased, manager_id, tenant_id, owner_id) 
VALUES( '2-4 Frances St, Randwick', 2031, -33.910074, 151.237167, true, 6, 7, 3);



INSERT INTO abstract_user (first_name, last_name, email, password_hash, owner, secret_question, secret_answer_hash)
VALUES( 'test', 
		'owner', 
		'owner2@gmail.com', 
		'sha256$MZ4C2LXUHLYA5uSC$47c069c9efbe553d264126e68582c841746ee7b698a704e7d523f587ad76e724', 
		TRUE, 
		'What is your favorite book?', 
		'sha256$Rs5btkvq3JjJfE1W$d562bb8322abaa7e4d7d3c7658e76d4dadf6240aff3fd930b2bf91e5676b1913');


INSERT INTO abstract_user (first_name, last_name, email, password_hash, owner, secret_question, secret_answer_hash)
VALUES( 'test', 
		'owner', 
		'owner3@gmail.com', 
		'sha256$MZ4C2LXUHLYA5uSC$47c069c9efbe553d264126e68582c841746ee7b698a704e7d523f587ad76e724', 
		TRUE, 
		'What is your favorite book?', 
		'sha256$Rs5btkvq3JjJfE1W$d562bb8322abaa7e4d7d3c7658e76d4dadf6240aff3fd930b2bf91e5676b1913');


INSERT INTO abstract_user (first_name, last_name, email, password_hash, manager, secret_question, secret_answer_hash)
VALUES( 'test', 
		'manager2', 
		'manager2@gmail.com', 
		'sha256$MZ4C2LXUHLYA5uSC$47c069c9efbe553d264126e68582c841746ee7b698a704e7d523f587ad76e724', 
		TRUE, 
		'What is your favorite book?', 
		'sha256$Rs5btkvq3JjJfE1W$d562bb8322abaa7e4d7d3c7658e76d4dadf6240aff3fd930b2bf91e5676b1913');


INSERT INTO property(address, post_code, map_lat, map_long, owner_id) VALUES('Bennelong Point, Sydney NSW 2000', 2000, -33.85658855314746, 151.21531044468617, 3);

--INSERT INTO contact (connected, preferred_name, tenant, phone_number, email, user_id, manager_id) VALUES(TRUE, 'Margot Robbie', TRUE, '0123456789', 'tenant@gmail.com', 1, 2);
--INSERT INTO contact (connected, preferred_name, owner, phone_number, email, user_id, manager_id) VALUES(TRUE, 'Woolworths', TRUE, '9876543210', 'owner@gmail.com', 3, 2);
--UPDATE tenant SET manager_id = 2 WHERE tenant_id = 1;
--UPDATE owner SET manager_id = 2 WHERE owner_id = 3;
--UPDATE property SET tenant_id = 1, manager_id = 2 WHERE property_id = 4;
--UPDATE property SET leased = TRUE, lease_expiration_date = '2021-12-12' WHERE property_id=4;


-- ADD IN DEFAULT REPORTS
INSERT INTO default_template (template_json, title, description) VALUES (
	'{"components": [{"label": "Tenant Name", "value": {"type": "Title", "props": {"title": "Tenant Name", "disableMgrInput": false}}}, {"label": "Tenant Email (required)", "value": {"type": "SubTitle", "props": {"subtitle": "Tenant email", "disableMgrInput": false}}}, {"label": "Description", "value": {"type": "Paragraph", "props": {"text": "For each room, please indicate the current state as one of Excellent, Good, Poor and Bad.", "disableMgrInput": false}}}, {"label": "Entryway", "value": {"type": "RoomEvaluation", "props": {"room": "Entryway", "disableMgrInput": true}}}, {"label": "Kitchen", "value": {"type": "RoomEvaluation", "props": {"room": "Kitchen", "disableMgrInput": true}}}, {"label": "Kitchen 2", "value": {"type": "RoomEvaluation", "props": {"room": "Kitchen 2", "disableMgrInput": true}}}, {"label": "Bathroom", "value": {"type": "RoomEvaluation", "props": {"room": "Bathroom", "disableMgrInput": true}}}, {"label": "Bathroom 2", "value": {"type": "RoomEvaluation", "props": {"room": "Bathroom 2", "disableMgrInput": true}}}, {"label": "Bathroom 3", "value": {"type": "RoomEvaluation", "props": {"room": "Bathroom 3", "disableMgrInput": true}}}, {"label": "Laundry", "value": {"type": "RoomEvaluation", "props": {"room": "Laundry", "disableMgrInput": true}}}, {"label": "Bedroom", "value": {"type": "RoomEvaluation", "props": {"room": "Bedroom", "disableMgrInput": true}}}, {"label": "Bedroom 2", "value": {"type": "RoomEvaluation", "props": {"room": "Bedroom 2", "disableMgrInput": true}}}, {"label": "Bedroom 3", "value": {"type": "RoomEvaluation", "props": {"room": "Bedroom 3", "disableMgrInput": true}}}, {"label": "Bedroom 4", "value": {"type": "RoomEvaluation", "props": {"room": "Bedroom 4", "disableMgrInput": true}}}, {"label": "Bedroom 5", "value": {"type": "RoomEvaluation", "props": {"room": "Bedroom 5", "disableMgrInput": true}}}, {"label": "Lounge", "value": {"type": "RoomEvaluation", "props": {"room": "Lounge", "disableMgrInput": true}}}, {"label": "Lounge 2", "value": {"type": "RoomEvaluation", "props": {"room": "Lounge 2", "disableMgrInput": true}}}, {"label": "Dining", "value": {"type": "RoomEvaluation", "props": {"room": "Dining", "disableMgrInput": true}}}, {"label": "Dining 2", "value": {"type": "RoomEvaluation", "props": {"room": "Dining 2", "disableMgrInput": true}}}, {"label": "Balcony", "value": {"type": "RoomEvaluation", "props": {"room": "Balcony", "disableMgrInput": true}}}, {"label": "Balcony 2", "value": {"type": "RoomEvaluation", "props": {"room": "Balcony 2", "disableMgrInput": true}}}, {"label": "Yard (Back)", "value": {"type": "RoomEvaluation", "props": {"room": "Yard (Back)", "disableMgrInput": true}}}, {"label": "Yard (Front)", "value": {"type": "RoomEvaluation", "props": {"room": "Yard (Front)", "disableMgrInput": true}}}, {"label": "Garage", "value": {"type": "RoomEvaluation", "props": {"room": "Garage", "disableMgrInput": true}}}, {"label": "Garage 2", "value": {"type": "RoomEvaluation", "props": {"room": "Garage 2", "disableMgrInput": true}}}, {"label": "Shed", "value": {"type": "RoomEvaluation", "props": {"room": "Shed", "disableMgrInput": true}}}, {"label": "Study", "value": {"type": "RoomEvaluation", "props": {"room": "Study", "disableMgrInput": true}}}, {"label": "Study 2", "value": {"type": "RoomEvaluation", "props": {"room": "Study 2", "disableMgrInput": true}}}, {"label": "Ensuite", "value": {"type": "RoomEvaluation", "props": {"room": "Ensuite", "disableMgrInput": true}}}, {"label": "Ensuite 2", "value": {"type": "RoomEvaluation", "props": {"room": "Ensuite 2", "disableMgrInput": true}}}, {"label": "Ensuite 3", "value": {"type": "RoomEvaluation", "props": {"room": "Ensuite 3", "disableMgrInput": true}}}, {"label": "Robe", "value": {"type": "RoomEvaluation", "props": {"room": "Robe", "disableMgrInput": true}}}, {"label": "Robe 2", "value": {"type": "RoomEvaluation", "props": {"room": "Robe 2", "disableMgrInput": true}}}, {"label": "Robe 3", "value": {"type": "RoomEvaluation", "props": {"room": "Robe 3", "disableMgrInput": true}}}, {"label": "Exterior", "value": {"type": "RoomEvaluation", "props": {"room": "Exterior", "disableMgrInput": true}}}, {"label": "Hall", "value": {"type": "RoomEvaluation", "props": {"room": "Hall", "disableMgrInput": true}}}, {"label": "Hall 2", "value": {"type": "RoomEvaluation", "props": {"room": "Hall 2", "disableMgrInput": true}}}, {"label": "Hall 3", "value": {"type": "RoomEvaluation", "props": {"room": "Hall 3", "disableMgrInput": true}}}]}',
	'Self Inspection Report',
	'To create a self-inspection report for one of your tenants to fill out and return.'
);




