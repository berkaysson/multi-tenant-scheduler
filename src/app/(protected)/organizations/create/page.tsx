"use client";

import { CreateOrganizationForm } from "@/components/organizations";

const CreateOrganizationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Organization</h1>
      <CreateOrganizationForm />
    </div>
  );
};

export default CreateOrganizationPage;