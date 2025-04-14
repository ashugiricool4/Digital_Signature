import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import SignPage from "@/pages/SignPage";
import VerifyPage from "@/pages/VerifyPage";
import HistoryPage from "@/pages/HistoryPage";
import LearnPage from "@/pages/LearnPage";
import DashboardPage from "@/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import { useEffect } from "react";

function Router() {
  const [location, setLocation] = useLocation();

  // If at root, redirect to /sign
  useEffect(() => {
    if (location === "/") {
      setLocation("/sign");
    }
  }, [location, setLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TabNavigation />
        <Switch>
          <Route path="/sign" component={SignPage} />
          <Route path="/verify" component={VerifyPage} />
          <Route path="/history" component={HistoryPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/learn" component={LearnPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
