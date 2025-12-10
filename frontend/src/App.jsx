import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';

// AnimatedRoutes component handles the AnimatePresence logic
// which requires access to the `license` location object, so it must be inside Router
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/interview/:type" element={<InterviewRoom />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
