import { Client } from "@hubspot/api-client";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/contacts/models/Filter";
import {
  PropertyCreateTypeEnum,
  PropertyCreateFieldTypeEnum,
} from "@hubspot/api-client/lib/codegen/crm/properties/models/PropertyCreate";
import { ContactInfo } from "@/types";

// The custom contact property that stores which event a contact came from.
const EVENT_PROPERTY = "event_source";

function getClient() {
  return new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
}

// Memoize so we only attempt to create the property once per server instance.
let eventPropertyEnsured = false;

/**
 * Make sure the "Event Source" custom contact property exists in HubSpot.
 * Best-effort: if it already exists HubSpot returns 409, which we ignore.
 */
async function ensureEventProperty(client: Client): Promise<void> {
  if (eventPropertyEnsured) return;
  try {
    await client.crm.properties.coreApi.create("contacts", {
      name: EVENT_PROPERTY,
      label: "Event Source",
      type: PropertyCreateTypeEnum.String,
      fieldType: PropertyCreateFieldTypeEnum.Text,
      groupName: "contactinformation",
      description: "The event where this contact's card was scanned.",
    });
  } catch {
    // Already exists (409) or insufficient scope — ignore and continue.
  }
  eventPropertyEnsured = true;
}

export async function createOrUpdateHubspotContact(
  contact: ContactInfo,
  eventName?: string
): Promise<string> {
  const client = getClient();

  if (eventName) await ensureEventProperty(client);

  const properties: Record<string, string> = {
    firstname: contact.name.split(" ")[0] ?? "",
    lastname: contact.name.split(" ").slice(1).join(" ") ?? "",
    email: contact.email,
    company: contact.company,
  };
  if (contact.phone) properties.phone = contact.phone;
  if (contact.title) properties.jobtitle = contact.title;
  if (eventName) properties[EVENT_PROPERTY] = eventName;

  try {
    // Try to find existing contact by email
    const searchResp = await client.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            { propertyName: "email", operator: FilterOperatorEnum.Eq, value: contact.email },
          ],
        },
      ],
      properties: ["email"],
      limit: 1,
      after: "0",
      sorts: [],
    });

    if (searchResp.results.length > 0) {
      const existingId = searchResp.results[0].id;
      await client.crm.contacts.basicApi.update(existingId, { properties });
      return existingId;
    }
  } catch {
    // Fall through to create
  }

  const created = await client.crm.contacts.basicApi.create({ properties });
  return created.id;
}
