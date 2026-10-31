import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactProfileView } from "@/features/contacts/components/contact-profile-view";
import { getContactDetail, getContactIds } from "@/features/contacts/data/get-contacts";
import { getWorkspace } from "@/features/workspace/get-workspace";
import ContactProfileLoading from "./loading";

export async function generateStaticParams() {
  const workspace = await getWorkspace();
  return getContactIds(workspace.agency.id).map((contactId) => ({ contactId }));
}

export async function generateMetadata({ params }: PageProps<"/contacts/[contactId]">): Promise<Metadata> {
  const { contactId } = await params;
  const workspace = await getWorkspace();
  const detail = await getContactDetail(workspace.agency.id, contactId);
  return { title: detail ? `${detail.contact.name} · Contacts` : "Contact not found" };
}

async function ContactProfileContent({ params }: { params: PageProps<"/contacts/[contactId]">["params"] }) {
  const { contactId } = await params;
  const workspace = await getWorkspace();
  const detail = await getContactDetail(workspace.agency.id, contactId);
  if (!detail) notFound();
  return <ContactProfileView data={detail} currentUserName={workspace.currentUser.name} />;
}

export default function ContactProfilePage({ params }: PageProps<"/contacts/[contactId]">) {
  return (
    <Suspense fallback={<ContactProfileLoading />}>
      <ContactProfileContent params={params} />
    </Suspense>
  );
}
