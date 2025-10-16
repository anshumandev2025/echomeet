import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import MeetingPage from "./pages/MeetingPage";
import { MessageProvider } from "./context/MessageProvider";
import { useEffect } from "react";
const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname == "/") {
      navigate("/meeting");
    }
  }, []);
  return (
    <>
      <MessageProvider>
        <Routes>
          <Route path="/meeting" element={<MeetingPage />} />
        </Routes>
      </MessageProvider>
    </>
  );
};

export default App;
