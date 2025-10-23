"use client";

import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";

const AdminPage = () => {
  const [isPreOn, setIsPreOn] = useState(false);
  const { data: session, status } = useSession();

  const onClick = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
        {status === "authenticated" ? (
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              <strong>Name:</strong> {session.user.name}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Email:</strong> {session.user.email}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Role:</strong> <span className="px-2 py-1 bg-red-100 text-red-800 rounded">{session.user.role}</span>
            </p>

            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Admin Features:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Full system access</li>
                <li>✓ Manage all users</li>
                <li>✓ Access manager features</li>
                <li>✓ System configuration</li>
              </ul>
            </div>

            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setIsPreOn((prev) => !prev)}
              className="w-full mb-4"
            >
              {isPreOn ? "Hide" : "Show"} Session Data
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

export default AdminPage;

