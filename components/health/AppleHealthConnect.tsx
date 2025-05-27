import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface AppleHealthConnectProps {
  onConnect?: (success: boolean) => void;
}

export default function AppleHealthConnect({ onConnect }: AppleHealthConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    // Reset states
    setIsConnecting(true);
    setError(null);

    try {
      // In a real implementation, this would use the Apple HealthKit API
      // This is a mock implementation for demonstration purposes
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful connection
      setIsConnected(true);
      if (onConnect) onConnect(true);
    } catch (err) {
      console.error('Error connecting to Apple Health:', err);
      setError('Failed to connect to Apple Health. Please try again.');
      if (onConnect) onConnect(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(false);
    } catch (err) {
      console.error('Error disconnecting from Apple Health:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <AppleIcon className="mr-2 h-5 w-5" />
              Apple Health
            </CardTitle>
            <CardDescription>
              Connect your Apple Health data to share health metrics with your healthcare provider
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {!isConnected ? (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect to Apple Health to share your health data securely with your healthcare providers.
                This allows them to monitor your health metrics and provide better care.
              </p>
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full sm:w-auto"
              >
                <AppleIcon className="mr-2 h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect to Apple Health'}
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm font-medium">Steps</div>
                  <div className="text-2xl font-semibold">8,742</div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm font-medium">Heart Rate</div>
                  <div className="text-2xl font-semibold">72 bpm</div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm font-medium">Sleep</div>
                  <div className="text-2xl font-semibold">7.5 hrs</div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm font-medium">Blood Pressure</div>
                  <div className="text-2xl font-semibold">120/80</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={isConnecting}
                className="w-full sm:w-auto"
              >
                {isConnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
