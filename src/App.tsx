import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ModemChecker } from "./components/ModemChecker";
import { SetupGuide } from "./components/SetupGuide";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModemChecker />} />
          <Route path="/setup" element={<SetupGuide />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
