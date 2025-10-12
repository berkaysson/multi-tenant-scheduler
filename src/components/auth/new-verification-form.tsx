"use client";

import { useSearchParams } from "next/navigation";
import CardWrapper from "./card-wrapper";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";

const NewVerificationForm = () => {
  const [message, setMessage] = useState("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (!token) {
      setMessage("Invalid token");
      return;
    }
    newVerification(token)
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        setMessage("Something went wrong. Please try again later.");
      });
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  //   "There will be two message if confirming successful:
  //   one is "Email verified!" second is "Token does not exist!".
  //   Reason for this, in development react wokes the useEffect twice
  //   and if email is confirmed in first one token will be deleted,
  //   so in second it will give error because of token not exist anymore."

  return (
    <CardWrapper
      headerLabel="Confirm Email"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
      showSocial={false}
    >
      {!message && <p>Confirming your verification...</p>}
      {message && <p>{message}</p>}
    </CardWrapper>
  );
};

export default NewVerificationForm;
