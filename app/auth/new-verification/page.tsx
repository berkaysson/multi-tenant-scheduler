import NewVerificationForm from "@/components/auth/new-verification-form";
import { Suspense } from "react";

const NewVerificationPage = () => {
  return (
    <div>
      <Suspense>
        <NewVerificationForm />
      </Suspense>
    </div>
  );
};

export default NewVerificationPage;
