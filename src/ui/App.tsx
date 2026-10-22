import { useState } from 'react';
import './index.css';
import Nav from './components/Nav';
import RequirementsScreen from './components/RequirementsScreen';

export default function App() {
  const [active, setActive] = useState('requirements');

  return (
    <div className="app">
      <Nav active={active} onSelect={setActive} />
      <div className="app-body">
        <div className="app-header">
          <h1>BuildProof</h1>
          <p>From requirements to proof.</p>
        </div>
        {active === 'requirements' && <RequirementsScreen />}
        {active === 'scenarios' && <div className="card">Écran Scénarios — en cours de construction</div>}
        {active === 'runs' && <div className="card">Écran Exécutions — en cours de construction</div>}
        {active === 'report' && <div className="card">Écran Rapport — en cours de construction</div>}
      </div>
    </div>
  );
}