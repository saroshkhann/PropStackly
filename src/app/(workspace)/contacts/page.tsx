import type { Metadata } from "next";
import { ContactsView } from "@/features/contacts/components/contacts-view";
import { getContactsPageData } from "@/features/contacts/data/get-contacts";
import { getWorkspace } from "@/features/workspace/get-workspace";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage() {
  const workspace = await getWorkspace();
  const data = await getContactsPageData(workspace.agency.id);
  return <ContactsView data={data} />;
}
