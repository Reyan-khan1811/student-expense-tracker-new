import { AppProvider, useApp } from './AppContext';
import Onboarding from './components/Onboarding';
import Layout from './components/Layout';

function AppContent() {
  const { isOnboarded } = useApp();
  return isOnboarded ? <Layout /> : <Onboarding />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
