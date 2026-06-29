import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedBySlug } from "@/lib/invitations/queries";
import { toInvitationView } from "@/lib/invitations/view-model";
import { pickTemplate } from "@/components/templates/registry";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedBySlug(slug);
  if (!data) return { title: "Undangan tidak ditemukan" };
  const title = `Undangan Pernikahan ${data.invitation.groomName} & ${data.invitation.brideName}`;
  return { title, openGraph: { title }, description: "Kami mengundang Anda di hari bahagia kami." };
}

export default async function PublicInvitation({
  params, searchParams,
}: { params: Promise<{ slug: string }>; searchParams: Promise<{ to?: string }> }) {
  const { slug } = await params;
  const { to } = await searchParams;
  const data = await getPublishedBySlug(slug);
  if (!data) notFound();

  const view = toInvitationView(data.invitation, data.photos);
  const Template = pickTemplate(view.template);
  return <Template view={view} guest={to} />;
}
