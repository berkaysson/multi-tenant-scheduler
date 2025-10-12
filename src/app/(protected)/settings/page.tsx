"use client";

import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";

const SettingsPage = () => {
  const [isPreOn, setIsPreOn] = useState(false);
  const { data: session, status } = useSession();
  console.log("🚀 ~ file: page.tsx:8 ~ SettingsPage ~ data:", session);

  const onClick = () => {
    logout().then(() => {
      setIsPreOn(false);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4">User Settings</h2>
        {status === "authenticated" ? (
          <div className="mb-4">
            <p className="text-gray-700">
              <strong>Name:</strong> {session.user.name}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {session.user.email}
            </p>
            <p className="text-gray-700">
              <strong>Role:</strong> {session.user.role}
            </p>

            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setIsPreOn((prev) => !prev)}
              className="w-full mt-4"
            >
              {isPreOn ? "Hide" : "Show"} JSON
            </Button>
            {isPreOn && (
              <pre className="text-xs bg-gray-100 p-2 rounded m-4 overflow-x-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <p className="text-gray-700">You are not authenticated.</p>
        )}

        <Button variant={"destructive"} size={"default"} onClick={onClick}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
