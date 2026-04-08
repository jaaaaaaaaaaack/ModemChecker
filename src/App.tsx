import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Login } from "./components/Login";
import { ModemChecker } from "./components/ModemChecker";
import { SetupGuide } from "./components/SetupGuide";
import { SetupGuideInline } from "./components/SetupGuideInline";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ModemChecker />} />
          <Route path="/setup" element={<SetupGuide />} />
          <Route path="/setup-inline" element={<SetupGuideInline />} />
        </Routes>
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;
