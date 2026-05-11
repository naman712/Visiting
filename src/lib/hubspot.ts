import { Client } from "@hubspot/api-client";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/contacts/models/Filter";
import { ContactInfo } from "@/types";

function getClient() {
  return new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
}

export async function createOrUpdateHubspotContact(
  contact: ContactInfo
): Promise<string> {
  const client = getClient();

  const properties: Record<string, string> = {
    firstname: contact.name.split(" ")[0] ?? "",
    lastname: contact.name.split(" ").slice(1).join(" ") ?? "",
    email: contact.email,
    company: contact.company,
  };
  if (contact.phone) properties.phone = contact.phone;
  if (contact.title) properties.jobtitle = contact.title;

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
