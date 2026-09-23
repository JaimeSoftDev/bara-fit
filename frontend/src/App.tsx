import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InviteAccept from "./pages/InviteAccept";
import { RequireRole } from "./components/RequireRole";
import { SessionBoot } from "./components/SessionBoot";
import TrainerLayout from "./layouts/TrainerLayout";
import ClientLayout from "./layouts/ClientLayout";

import TrainerDashboard from "./pages/trainer/Dashboard";
import TrainerClients from "./pages/trainer/Clients";
import TrainerClientProfile from "./pages/trainer/ClientProfile";
import TrainerExercises from "./pages/trainer/Exercises";
import TrainerCalendar from "./pages/trainer/Calendar";
import TrainerPayments from "./pages/trainer/Payments";
import TrainerChatList from "./pages/trainer/ChatList";
import TrainerChatThread from "./pages/trainer/ChatThread";

import ClientDashboard from "./pages/client/Dashboard";
import ClientWorkout from "./pages/client/Workout";
import ClientNutrition from "./pages/client/Nutrition";
import ClientCalendar from "./pages/client/Calendar";
import ClientProgress from "./pages/client/Progress";
import ClientChat from "./pages/client/Chat";
import ClientPayments from "./pages/client/Payments";

function App() {
  return (
    <BrowserRouter>
      <SessionBoot>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/:token" element={<InviteAccept />} />

        <Route
          path="/trainer"
          element={
            <RequireRole role="trainer">
              <TrainerLayout />
            </RequireRole>
          }
        >
          <Route index element={<TrainerDashboard />} />
          <Route path="clients" element={<TrainerClients />} />
          <Route path="clients/:clientId" element={<TrainerClientProfile />} />
          <Route path="exercises" element={<TrainerExercises />} />
          <Route path="calendar" element={<TrainerCalendar />} />
          <Route path="payments" element={<TrainerPayments />} />
          <Route path="chat" element={<TrainerChatList />} />
          <Route path="chat/:clientId" element={<TrainerChatThread />} />
        </Route>

        <Route
          path="/client"
          element={
            <RequireRole role="client">
              <ClientLayout />
            </RequireRole>
          }
        >
          <Route index element={<ClientDashboard />} />
          <Route path="workout" element={<ClientWorkout />} />
          <Route path="nutrition" element={<ClientNutrition />} />
          <Route path="calendar" element={<ClientCalendar />} />
          <Route path="progress" element={<ClientProgress />} />
          <Route path="chat" element={<ClientChat />} />
          <Route path="payments" element={<ClientPayments />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </SessionBoot>
    </BrowserRouter>
  );
}

export default App;
