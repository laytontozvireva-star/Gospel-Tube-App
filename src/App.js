import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";

import Home from "./pages/Home";
import Videos from "./pages/Videos";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
