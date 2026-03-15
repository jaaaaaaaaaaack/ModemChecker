import { ErrorBoundary } from "./components/ErrorBoundary";
import { ModemChecker } from "./components/ModemChecker";

function App() {
  return (
    <ErrorBoundary>
      <ModemChecker />
    </ErrorBoundary>
  );
}

export default App;
