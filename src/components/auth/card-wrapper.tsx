"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
  CardTitle,
} from "../ui/card";
import Socials from "./socials";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px] shadow-2xl">
      <CardHeader>
        <CardTitle>
          <p className="text-4xl font-bold">{headerLabel}</p>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardContent>{showSocial && <Socials />}</CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link className="w-full" href={backButtonHref}>
            {backButtonLabel}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
