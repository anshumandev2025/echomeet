import { BrowserRouter, Route, Routes } from "react-router-dom";
import MeetingPage from "./pages/MeetingPage";
import { MessageProvider } from "./context/MessageProvider";
const App = () => {
  return (
    <>
      <MessageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/meeting" element={<MeetingPage />} />
          </Routes>
        </BrowserRouter>
      </MessageProvider>
    </>
  );
};

export default App;
