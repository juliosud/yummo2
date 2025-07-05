import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, QrCode } from "lucide-react";
import {
  checkSessionActive,
  getSessionCodeFromUrl,
  getTableIdFromUrl,
} from "@/lib/session-utils";

interface SessionGuardProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

const SessionGuard: React.FC<SessionGuardProps> = ({
  children,
  fallbackComponent,
}) => {
  const [isSessionActive, setIsSessionActive] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);

      const urlSessionCode = getSessionCodeFromUrl();
      const urlTableId = getTableIdFromUrl();

      setSessionCode(urlSessionCode);
      setTableId(urlTableId);

      if (!urlSessionCode) {
        console.log("❌ No session code found in URL");
        setIsSessionActive(false);
        setIsLoading(false);
        return;
      }

      const isActive = await checkSessionActive(urlSessionCode);
      setIsSessionActive(isActive);
      setIsLoading(false);
    };

    checkSession();

    // Check session status every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Checking Session
            </h2>
            <p className="text-gray-600 text-center">
              Please wait while we verify your table session...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSessionActive) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Session Expired
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {!sessionCode
                ? "No valid session found. Please scan the QR code at your table to access the menu."
                : "Your table session has ended. Please ask restaurant staff to start a new session."}
            </p>

            {tableId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Table:</strong> {tableId}
                </p>
                {sessionCode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Session: {sessionCode.slice(-8)}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR Code Again
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-6">
              Need help? Ask your server to start a new session for your table.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionGuard;
