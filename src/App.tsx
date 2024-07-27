// src/App.tsx

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/pages/Home";
import FirstTimeSetup from "./components/pages/FirstTimeSetup";
import { DownloadProvider } from "./contexts/DownloadContext";
import { Packages } from "./interfaces";
import { getPackages } from "./utils/utils";

function App() {
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    const firstTime = localStorage.getItem("isFirstTime");
    if (firstTime === "false") {
      setIsFirstTime(false);
    }
  }, []);

  const handleSetupComplete = () => {
    setIsFirstTime(false);
  };

  const [packages, setPackages] = useState<Packages>({});

    useEffect(() => {
        getPackages(setPackages);
    }, []);

  return (
    <DownloadProvider packages={packages}>
      <Router>
        <Routes>
          {isFirstTime ? (
            <Route path="/" element={<FirstTimeSetup onComplete={handleSetupComplete} />} />
          ) : (
            <>
              <Route path="/" element={<Home />} />
              {/* Add more routes here */}
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </DownloadProvider>
  );
}

export default App;
