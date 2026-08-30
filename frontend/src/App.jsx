import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CitizenApp from './components/CitizenApp';
import LoginModal from './components/LoginModal';
import { socket } from './services/socket';
import { fetchVillages, triggerImdPoll } from './services/api';
import './i18n';

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [lastPulsedVillageId, setLastPulsedVillageId] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetchVillages().then(data => setGeoData(data)).catch(err => console.error(err));

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('risk-score-updated', (data) => {
      if (data.tierChanged) {
        setLastPulsedVillageId(data.village_id);
        setTimeout(() => setLastPulsedVillageId(null), 3000);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('risk-score-updated');
    };
  }, []);

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    try {
      await triggerImdPoll();
      const updated = await fetchVillages();
      setGeoData(updated);
    } catch (e) {
      console.error("Simulation error:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-command-bg text-command-text">
      <Navbar
        isConnected={isConnected}
        activeAlerts={activeAlerts}
        activeView={activeView}
        setActiveView={setActiveView}
        onTriggerSimulation={handleTriggerSimulation}
        isSimulating={isSimulating}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <main>
        {activeView === 'dashboard' ? (
          <Dashboard
            socket={socket}
            activeAlerts={activeAlerts}
            setActiveAlerts={setActiveAlerts}
            lastPulsedVillageId={lastPulsedVillageId}
          />
        ) : (
          <CitizenApp
            activeAlerts={activeAlerts}
            geoData={geoData}
          />
        )}
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
