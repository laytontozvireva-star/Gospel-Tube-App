import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Videos from "./pages/Videos";
import About from "./pages/About";
import Explore from "./pages/Explore";
import History from "./pages/History";
import Apostles from "./pages/Apostles";
import ApostleProfile from "./pages/ApostleProfile";
import Live from "./pages/Live";
import Playlists from "./pages/Playlists";
import LikedVideos from "./pages/LikedVideos";
import SearchResults from "./pages/SearchResults";
import UploadVideo from "./pages/UploadVideo";
import ImportCsv from "./pages/ImportCsv";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/apostles" element={<Apostles />} />
        <Route path="/apostles/:name" element={<ApostleProfile />} />
        <Route path="/live" element={<Live />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        <Route path="/history" element={<History />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/upload" element={<UploadVideo />} />
        <Route path="/import" element={<ImportCsv />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
