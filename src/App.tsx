import { lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ModemChecker } from "./components/ModemChecker";
import { useHashRoute } from "./hooks/useHashRoute";

const OverviewPage = lazy(() => import("./pages/OverviewPage"));
const TechnicalPage = lazy(() => import("./pages/TechnicalPage"));

function App() {
  const route = useHashRoute();

  if (route === "overview" || route === "technical") {
    return (
      <ErrorBoundary>
        <Suspense fallback={null}>
          {route === "overview" ? <OverviewPage /> : <TechnicalPage />}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ModemChecker />
    </ErrorBoundary>
  );
}

export default App;
