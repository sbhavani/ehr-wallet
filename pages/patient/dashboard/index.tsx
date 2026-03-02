
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatientLayout from '@/components/layout/PatientLayout';
import { useMetaMask } from '@/components/web3/MetaMaskProvider';
import AppleHealthConnect from '@/components/health/AppleHealthConnect';
import AppointmentsDashboard from '@/components/appointments/AppointmentsDashboard';
import SharedDataDashboard from '@/components/web3/SharedDataDashboard';

export default function PatientDashboardPage() {
  const { data: session } = useSession();
  const { currentAccount } = useMetaMask();
  const [patientSession, setPatientSession] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const refreshDashboard = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPatientSession = localStorage.getItem('patientSession');
      if (storedPatientSession) {
        try {
          setPatientSession(JSON.parse(storedPatientSession));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  const userSession = session || patientSession;
  const userName = userSession?.user?.name || 'Patient';
  const ethereumAddress = userSession?.user?.ethereumAddress || currentAccount;

  const [activeTab, setActiveTab] = useState('shared-data');

  useEffect(() => {
    const { tab, refresh } = router.query;

    if (tab && typeof tab === 'string') {
      setActiveTab(tab);
    }

    if (refresh === 'true') {
      refreshDashboard();
      const newQuery = { ...router.query };
      delete newQuery.refresh;
      router.replace(
        { pathname: router.pathname, query: newQuery },
        undefined,
        { shallow: true }
      );
    }
  }, [router.query, router.pathname, refreshDashboard]);

  return (
    <PatientLayout>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Patient Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back, {userName}
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="shared-data">Shared Data</TabsTrigger>
            <TabsTrigger value="health-data">Health Data</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medical-records">Medical Records</TabsTrigger>
          </TabsList>

          <TabsContent value="shared-data" className="mt-0">
            <SharedDataDashboard
              key={`shared-data-${refreshKey}`}
              ethereumAddress={ethereumAddress}
            />
          </TabsContent>

          <TabsContent value="health-data" className="mt-0">
            <AppleHealthConnect />
          </TabsContent>

          <TabsContent value="appointments" className="mt-0">
            <AppointmentsDashboard
              key={`appointments-${refreshKey}`}
              patientId={userSession?.user?.id || 'default-patient-id'}
            />
          </TabsContent>

          <TabsContent value="medical-records" className="mt-0">
            <div className="bg-muted p-8 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Medical Records Coming Soon</h3>
              <p className="text-muted-foreground">
                This feature is under development. You&apos;ll be able to view your medical records here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}
