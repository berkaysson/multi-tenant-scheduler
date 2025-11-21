import { getOrganizationBySlug } from "@/actions/get-organization";
import { notFound } from "next/navigation";
import { PublicOrganizationPageClient } from "./public-organization-page-client";
import { auth } from "@/auth";

interface PublicOrganizationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicOrganizationPage({ params }: PublicOrganizationPageProps) {
  const { slug } = await params;
  const session = await auth();

  const result = await getOrganizationBySlug(slug);

  if (!result.success || !result.organization) {
    notFound();
  }

  return (
    <PublicOrganizationPageClient
      organization={result.organization}
      isAuthenticated={!!session?.user}
    />
  );
}
