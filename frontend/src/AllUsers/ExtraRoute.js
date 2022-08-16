import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import EditContact from '../Manager/EditContactMgr';
import TenantConnectionApproval from '../Tenant/TenantConnectionApproval';
import OwnerConnectionApproval from '../Owner/OwnerConnectionApproval';
import CustomizeTemplate from '../Manager/CustomizeTemplate';
import ManagerConnectionApprovalFromTenant from '../Manager/MgrConnectApprovalFromTenant';
import ManagerConnectionApprovalFromOwner from '../Manager/MgrConnectApprovalFromOwner';
import SchdSingleInspect from '../Manager/MgrScheduleInspection';
import UpdateSingleInspect from '../Manager/UpdateSingleInspectionMgr';
import UpdateMultiInspection from '../Manager/UpdateMultiInspection.js';
import PropertyDetailOwner from '../Owner/PropertyDetailOwner';
import PropertyEvictionOwner from '../Owner/PropertyEvictionOwner';
import MgrListingApprovalFromOwner from '../Manager/MgrListingApprovalFromOwner';
import MgrUnlistingApprovalFromOwner from '../Manager/MgrUnlistingApprovalFromOwner';
import MgrRepairApprovalFromTenant from '../Manager/MgrRepairApprovalFromTenant';
import PropertyDetailMgr from '../Manager/PropertyDetailMgr';
import PropertyLeaseMgr from '../Manager/PropertyLeaseMgr';
import TenantRequestRepair from '../Tenant/TenantRequestRepair';
import TenantBreakLease from '../Tenant/TenantBreakLease';
import TenantExtendLease from '../Tenant/TenantExtendLease';
import MgrEvictionNoticeTenant from '../Manager/MgrEvictionNoticeTenant';
import TenantEvictionDetail from '../Tenant/TenantEvictionDetail';
import OwnerMaintenanceApproval from '../Owner/OwnerMaintenanceApproval';
import MgrBreakLeaseNoticeOwner from '../Manager/MgrBreakLeaseNoticeOwner';
import OwnerNoticeLeave from '../Owner/OwnerNoticeLeave';
import MgrLeaseExtensionFromTenant from '../Manager/MgrLeaseExtensionFromTenant';
import OwnerLeaseExtendApproval from '../Owner/OwnerLeaseExtendApproval';
import PropertyLeaseExtensionMgr from '../Manager/PropertyLeaseExtensionMgr';
import TenantNoticeDetail from '../Tenant/TenantNoticeDetail';
import OwnerNoticeDetail from '../Owner/OwnerNoticeDetail';
import MgrRepairApprovalFromOwner from '../Manager/MgrRepairApprovalFromOwner';
import MgrLeaseExtensionFromOwner from '../Manager/MgrLeaseExtensionFromOwner';

// This file aim to generate some URLs which included some enumerate ID
// and linked them to particular file for rendering particular page.

// Backend url
const PORT = require('../config.json').BACKEND_PORT;
const url = 'http://localhost:' + PORT;

export default function AllInfo () {
  const [loading, setLoading] = React.useState(true);
  const [contacts, setContacts] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [defaultTemplates, setDefaultTemplates] = React.useState([]);
  const [customTemplates, setCustomTemplates] = React.useState([]);
  const [properties, setProperties] = React.useState([]);
  const [inspections, setInspections] = React.useState([]);
  const [itineraries, setItineraries] = React.useState([]);
  React.useEffect(() => {
    async function getContacts () {
      console.log('Getting Contacts');
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/contacts', options);
      const data = await res.json(); // token E77o
      console.log(data);
      sessionStorage.setItem('token', data.token);
      setContacts(data.contacts_list);
      getTemplates();
      // setLoading(false);
    }
    async function getTemplates () {
      console.log('Getting Templates');
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/templates', options);
      const data = await res.json();
      console.log(data);
      setNotifications(data.notifications);
      // data.data is undefined
      setDefaultTemplates(data.data.default ? data.data.default : []); // if data.data.default then data.data.default else []
      setCustomTemplates(data.data.custom ? data.data.custom : []);
      sessionStorage.setItem('token', data.token);
      getProperties();
      // setLoading(false);
    }
    async function getProperties () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/properties', options);
      const data = await res.json();
      console.log(data);

      if (res.status === 200) {
        sessionStorage.setItem('token', data.token);
        setProperties(data.property_list);
        getInspections();
        // setLoading(false);
      } else if (res.status === 401) {
        console.log('unauthorized: redirecting to login');
        console.log(data.error)
        alert(res.status + ': ' + data.error);
        window.location = '/Login';
      } else if (res.status === 500) {
        console.log(data.error);
        alert(res.status + ': Internal Error');
      } else {
        console.log(data.error);
        alert(res.status + ': ' + data.error);
      }
      sessionStorage.setItem('token', data.token);
    }
    async function getInspections () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }
      const res = await fetch(url + '/admin/inspections', options);
      const data = await res.json();
      console.log(data);
      sessionStorage.setItem('token', data.token);
      setInspections(data.inspection_list);
      getItineraryIds()
    }
    async function getItineraryIds () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }
      const res = await fetch(url + '/admin/itineraries/get_itinerary_ids', options);
      const data = await res.json();
      console.log(data);
      sessionStorage.setItem('token', data.token);
      setItineraries(data.itinerary_list);
      getNotifications();
    }
    async function getNotifications () {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + sessionStorage.getItem('token'),
        },
      }

      const res = await fetch(url + '/admin/notifications', options);
      const data = await res.json();
      console.log(data);
      setNotifications(data.notifications);
      sessionStorage.setItem('token', data.token);
      setLoading(false);
    }
    getContacts();
  }, []);

  if (loading) {
    return (
      <div>
        Loading data...
      </div>
    )
  } else {
    return (
      <AllInfoRoutes
        contacts={contacts}
        notifications={notifications}
        defaultTemplates={defaultTemplates}
        customTemplates={customTemplates}
        properties={properties}
        inspections={inspections}
        itineraries={itineraries}
      />
    )
  }
}

function AllInfoRoutes (props) {
  const contacts = props.contacts ? props.contacts : [];
  const contactsId = contacts.map(contacts => contacts.contact_id);
  const properties = props.properties;
  const propertiesId = properties.map(properties => properties.property_id);
  const notifications = props.notifications;
  const notificationsId = notifications.map(notifications => notifications.notification_id);
  const artifactId = notifications.map(notifications => notifications.artifact_id);

  const defaultTemplates = props.defaultTemplates;
  const customTemplates = props.customTemplates;

  // const defaultTemplatesID = !(defaultTemplates) ? [] : defaultTemplates.map(def => def.template_id);
  // const customTemplatesID = !(customTemplates) ? [] : customTemplates.map(cust => cust.template_id);
  console.log(props);
  const ownerArtifactId = notifications.map(notifications => notifications.owner_artifact_id);
  const ownerId = notifications.map(notifications => notifications.owner_id);
  const tenantArtifactId = notifications.map(notifications => notifications.tenant_artifact_id);
  const tenantId = notifications.map(notifications => notifications.tenant_id);
  const inspections = props.inspections;
  const inspectionId = inspections ? inspections.map(inspections => inspections.inspection_id) : [];
  const itineraries = props.itineraries;
  const itinerariesId = itineraries ? itineraries.map(itineraries => itineraries.itinerary_id) : [];
  // console.log(`artifactId: ${JSON.stringify(artifactId)}`);
  console.log(`contactsId: ${JSON.stringify(contactsId)}`);
  console.log(`tenantId: ${JSON.stringify(tenantId)}`);
  console.log(`tenantArtifactId: ${JSON.stringify(tenantArtifactId)}`);
  console.log(`notificationsId: ${JSON.stringify(notificationsId)}`);
  console.log(`propertyId: ${JSON.stringify(propertiesId)}`);
  console.log(`inspectionId: ${JSON.stringify(inspectionId)}`);
  console.log(`itinerariesId: ${JSON.stringify(itinerariesId)}`);

  return (
    <div>
      {
        contactsId.map(contactId =>
          <Route path={'/manager/contact_edit/' + contactId} key={contactId}>
            <EditContact contactId={contactId} />
          </Route>)
      }
      {
        propertiesId.map(propertyId =>
          <Route path={'/manager/inspections/schd_single/' + propertyId} key={propertyId}>
            <SchdSingleInspect propertyId={propertyId} />
          </Route>)
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/owner_connection_approval/' + notificationsId} key={index}>
            <ManagerConnectionApprovalFromOwner artifactId={ownerArtifactId} clientId={ownerId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/owner_request_listing_approval/' + notificationsId} key={index}>
            <MgrListingApprovalFromOwner artifactId={ownerArtifactId} clientId={ownerId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/owner_request_unlisting_approval/' + notificationsId} key={index}>
            <MgrUnlistingApprovalFromOwner artifactId={ownerArtifactId} clientId={ownerId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/owner_request_repair_approval/' + notificationsId} key={index}>
            <MgrRepairApprovalFromOwner artifactId={ownerArtifactId} clientId={ownerId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/owner_request_lease_extension_approval/' + notificationsId} key={index}>
            <MgrLeaseExtensionFromOwner artifactId={ownerArtifactId} clientId={ownerId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/tenant_request_repair_approval/' + notificationsId} key={index}>
            <MgrRepairApprovalFromTenant artifactId={tenantArtifactId} clientId={tenantId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/tenant_request_lease_extension/' + notificationsId} key={index}>
            <MgrLeaseExtensionFromTenant artifactId={tenantArtifactId} clientId={tenantId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/tenant_notice_leave/' + notificationsId} key={index}>
            <MgrBreakLeaseNoticeOwner artifactId={tenantArtifactId} clientId={tenantId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/tenant_connection_approval/' + notificationsId} key={index}>
            <ManagerConnectionApprovalFromTenant artifactId={tenantArtifactId} clientId={tenantId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/manager/eviction_notice_to_tenant/' + notificationsId} key={index}>
            <MgrEvictionNoticeTenant artifactId={ownerArtifactId} clientId={ownerId} notificationIndex={index} />
          </Route>
        )
      }
      {
        propertiesId.map((propertyId, index) =>
          <Route path={'/manager/property_detail/' + propertyId} key={propertyId}>
            <PropertyDetailMgr propertyId={propertyId} />
          </Route>
        )
      }
      {
        propertiesId.map((propertyId, index) =>
          <Route path={'/manager/property_lease/' + propertyId} key={propertyId}>
            <PropertyLeaseMgr propertyId={propertyId} />
          </Route>
        )
      }
      {
        propertiesId.map((propertyId, index) =>
          <Route path={'/manager/lease_extend/' + propertyId} key={propertyId}>
            <PropertyLeaseExtensionMgr propertyId={propertyId} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/tenant/connection_approval/' + notificationsId} key={index}>
            <TenantConnectionApproval artifactId={artifactId} notificationIndex={index} />
          </Route>
        )
      }
      {
        propertiesId.map((propertyId, index) =>
          <Route path={'/tenant/request_repair/' + propertyId} key={index}>
            <TenantRequestRepair propertyId={propertyId} />
          </Route>
        )
      }
      {
        propertiesId.map((propertyId, index) =>
          <Route path={'/tenant/request_break_lease/' + propertyId} key={index}>
            <TenantBreakLease propertyId={propertyId} />
          </Route>
        )
      }
      {
        propertiesId.map((propertyId, index) =>
          <Route path={'/tenant/request_extend_lease/' + propertyId} key={index}>
            <TenantExtendLease propertyId={propertyId} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/tenant/eviction_detail/' + notificationsId} key={index}>
            <TenantEvictionDetail artifactId={artifactId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/tenant/notice_detail/' + notificationsId} key={index}>
            <TenantNoticeDetail artifactId={artifactId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/owner/connection_approval/' + notificationsId} key={index}>
            <OwnerConnectionApproval artifactId={artifactId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/owner/notice_detail/' + notificationsId} key={index}>
            <OwnerNoticeDetail artifactId={artifactId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/owner/maintenance_approval/' + notificationsId} key={index}>
            <OwnerMaintenanceApproval artifactId={artifactId} notificationIndex={index} />
          </Route>
        )
      }
      {
        defaultTemplates.map(def =>
          <Route path={'/manager/templates/default/' + def.template_id} key={'default_' + def.template_id}>
            <CustomizeTemplate templateID={def.template_id} templateType="default" templateJSON={def.template_json} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/owner/lease_extension/' + notificationsId} key={index}>
            <OwnerLeaseExtendApproval artifactId={artifactId} notificationIndex={index} />
          </Route>
        )
      }
      {
        notificationsId.map((notificationsId, index) =>
          <Route path={'/owner/notice_leave/' + notificationsId} key={index}>
            <OwnerNoticeLeave artifactId={artifactId} notificationIndex={index} />
          </Route>
        )
      }
      {
        inspectionId.map(inspectionId =>
          <Route path={'/manager/inspections/update_single/' + inspectionId} key={inspectionId}>
            <UpdateSingleInspect inspectionId={inspectionId} />
          </Route>
        )
      }
      {
        propertiesId.map((propertyId, index) =>
          <Route path={'/owner/property_detail/' + propertyId} key={propertyId}>
            <PropertyDetailOwner propertyId={propertyId} />
          </Route>
        )
      }
      {
        customTemplates.map(cust =>
          <Route path={'/manager/templates/custom/' + cust.template_id} key={'custom_' + cust.template_id}>
            {/* <CustomizeTemplate templateID={cust.template_id} templateType="custom" templateJSON={cust.template_json} /> */}
            <CustomizeTemplate templateID={cust.template_id} parentID={defaultTemplates.filter((def) => { return def.title === cust.parent_template }).map((def) => { return def.template_id })[0]} templateType="custom" templateJSON={cust.template_json} />
          </Route>
        )
      }
      {
        itinerariesId.map(itineraryId =>
          <Route path={'/manager/inspections/update_multi/' + itineraryId} key={itineraryId}>
            <UpdateMultiInspection itineraryId={itineraryId} />
          </Route>
        )
      }
      {
        propertiesId.map((propertyId, index) =>
          <Route path={'/owner/request_eviction/' + propertyId} key={propertyId}>
            <PropertyEvictionOwner propertyId={propertyId} />
          </Route>
        )
      }
    </div>
  )
}

AllInfoRoutes.propTypes = {
  contacts: PropTypes.array.isRequired,
  notifications: PropTypes.array.isRequired,
  defaultTemplates: PropTypes.array.isRequired,
  customTemplates: PropTypes.array.isRequired,
  properties: PropTypes.array.isRequired,
  inspections: PropTypes.array.isRequired,
  itineraries: PropTypes.array.isRequired,
}
