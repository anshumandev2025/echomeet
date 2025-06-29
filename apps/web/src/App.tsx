import { BrowserRouter, Route, Routes } from "react-router-dom";
import MeetingPage from "./pages/MeetingPage";
const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/meeting" element={<MeetingPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
