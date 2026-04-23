import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import GetStarted from './pages/GetStarted';
import CommandCenter from './pages/CommandCenter';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<GetStarted />} />
          <Route path="/chat" element={<CommandCenter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
