"use client";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const Socials = () => {
  const onClick = (provider: "google" | "github") => {
    // For OAuth, redirect to dashboard initially
    // The middleware will handle role-based redirects after authentication
    signIn(provider, { callbackUrl: "/dashboard" });
  };
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        or continue with these social providers
      </p>
      <div className="flex gap-4 mt-2">
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => onClick("google")}
        >
          Google
        </Button>
        {/* <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => onClick("github")}
        >
          Github
        </Button> */}
      </div>
    </div>
  );
};

export default Socials;
