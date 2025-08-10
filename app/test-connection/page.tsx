"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestConnection() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-supabase");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: "Network error: " + error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>

      <Button onClick={testConnection} disabled={loading} className="mb-6">
        {loading ? "Testing..." : "Test Connection"}
      </Button>

      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <h2 className="font-semibold mb-2">
            {result.success
              ? "✅ Connection Successful"
              : "❌ Connection Failed"}
          </h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Troubleshooting:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Check if your Supabase project is active</li>
          <li>Verify the URL and API key are correct</li>
          <li>Ensure the clients table exists in your database</li>
          <li>Check your internet connection</li>
        </ul>
      </div>
    </div>
  );
}
