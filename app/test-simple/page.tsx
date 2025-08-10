"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

export default function SimpleTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDirectConnection = async () => {
    setLoading(true);
    try {
      // Test direct connection
      const supabase = createClient(
        "https://jismdkfjkngwbpddhomx.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A"
      );

      // Try a simple query
      const { data, error } = await supabase
        .from("clients")
        .select("id")
        .limit(1);

      if (error) {
        setResult({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      } else {
        setResult({
          success: true,
          message: "Connection successful!",
          data: data,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Unknown error",
        type: "connection_error",
        stack: error.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  const testBasicFetch = async () => {
    setLoading(true);
    try {
      // Test basic fetch to Supabase
      const response = await fetch(
        "https://jismdkfjkngwbpddhomx.supabase.co/rest/v1/",
        {
          headers: {
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A",
          },
        }
      );

      if (response.ok) {
        setResult({
          success: true,
          message: "Basic fetch successful",
          status: response.status,
          statusText: response.statusText,
        });
      } else {
        setResult({
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Network error",
        type: "fetch_error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Simple Supabase Connection Test
      </h1>

      <div className="space-y-4 mb-6">
        <Button
          onClick={testDirectConnection}
          disabled={loading}
          className="mr-4"
        >
          {loading ? "Testing..." : "Test Direct Connection"}
        </Button>

        <Button onClick={testBasicFetch} disabled={loading} variant="outline">
          {loading ? "Testing..." : "Test Basic Fetch"}
        </Button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <h2 className="font-semibold mb-2">
            {result.success ? "✅ Test Successful" : "❌ Test Failed"}
          </h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check if your Supabase project is active (not paused)</li>
          <li>Verify the URL and API key are correct</li>
          <li>Check your internet connection</li>
          <li>Try disabling any VPN or firewall</li>
          <li>Check browser console for CORS errors</li>
          <li>Ensure the clients table exists in your database</li>
        </ol>
      </div>

      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Current Configuration:</h3>
        <div className="text-sm space-y-1">
          <div>
            <strong>URL:</strong> https://jismdkfjkngwbpddhomx.supabase.co
          </div>
          <div>
            <strong>API Key:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
          </div>
        </div>
      </div>
    </div>
  );
}
