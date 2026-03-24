import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shell from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import TrackView from './pages/TrackView';
import LessonPage from './pages/LessonPage';
import ChallengePage from './pages/ChallengePage';
import ChallengesPage from './pages/ChallengesPage';
import ReviewPage from './pages/ReviewPage';
import SettingsPage from './pages/SettingsPage';
import ProgressPage from './pages/ProgressPage';
import { ToastProvider } from './components/shared/Toast';

export default function App() {
  return (
    <ToastProvider>
    <BrowserRouter basename="/forge">
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learn/:track" element={<TrackView />} />
          <Route path="/learn/:track/:lessonId" element={<LessonPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/challenge/:id" element={<ChallengePage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}
