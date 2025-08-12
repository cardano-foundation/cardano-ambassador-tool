'use client'

import { useEffect, useState } from "react";
import { initDb, queryDb } from "@/services/dbService";

interface MembershipIntent {
  id: number;
  memberName: string;
  email: string;
  status: string;
  created_at: string;
}

export default function MembershipIntentPage() {
  const [intents, setIntents] = useState<MembershipIntent[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function loadDbAndQuery() {
  //     const storedDb = localStorage.getItem("utxoDb");
  //     console.log({ storedDb });
      
  //     if (storedDb) {
  //       // Load from localStorage
  //       const uint8Array = new Uint8Array(JSON.parse(storedDb));
  //       await initDb(uint8Array);
  //       const rows = queryDb<MembershipIntent>(
  //         "SELECT * FROM membership_intent ORDER BY created_at DESC"
  //       );
  //       setIntents(rows);
  //       setLoading(false);
  //     } else {
 
  //     }
  //   }

  //   loadDbAndQuery();
  // }, []);

  if (loading) {
    return <div className="p-4">Loading membership intents...</div>;
  }

  if (!intents.length) {
    return <div className="p-4">No membership intents found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Membership Intents</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2">ID</th>
            <th className="border border-gray-300 px-3 py-2">Member Name</th>
            <th className="border border-gray-300 px-3 py-2">Email</th>
            <th className="border border-gray-300 px-3 py-2">Status</th>
            <th className="border border-gray-300 px-3 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {intents.map((intent) => (
            <tr key={intent.id}>
              <td className="border border-gray-300 px-3 py-2">{intent.id}</td>
              <td className="border border-gray-300 px-3 py-2">{intent.memberName}</td>
              <td className="border border-gray-300 px-3 py-2">{intent.email}</td>
              <td className="border border-gray-300 px-3 py-2">{intent.status}</td>
              <td className="border border-gray-300 px-3 py-2">{intent.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}