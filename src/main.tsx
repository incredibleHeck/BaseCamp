import {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import { LazyMotion } from 'motion/react';
import App from './App.tsx';
import {StudentPortalApp} from './features/students/StudentPortalApp.tsx';
import {HeadteacherSignUp} from './components/auth/HeadteacherSignUp.tsx';
import {ParentDigestPortal} from './features/parent/ParentDigestPortal.tsx';
import './index.css';
import { registerLiveClassroomRtdbBypass } from './services/liveClassroom/registerLiveClassroomRtdbBypass';

registerLiveClassroomRtdbBypass();

function Root() {
  const [hash, setHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (hash.startsWith('#/portal')) {
    return <StudentPortalApp />;
  }

  if (hash.startsWith('#/parent')) {
    return <ParentDigestPortal />;
  }

  if (hash.startsWith('#/headteacher-signup')) {
    return <HeadteacherSignUp />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion
      strict
      features={() => import('motion/react').then((mod) => mod.domAnimation)}
    >
      <Root />
    </LazyMotion>
  </StrictMode>,
);
