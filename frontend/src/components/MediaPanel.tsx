import { useState } from "react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import { Search, Sticker, PlayCircle, Smile } from "lucide-react";

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY); 

const MediaPanel = ({ onSelect, onClose }: any) => {
  const [tab, setTab] = useState("gifs"); // 'gifs' or 'stickers'
  const [search, setSearch] = useState("");

  const fetchGifs = (offset: number) => 
    search ? gf.search(search, { offset, limit: 10, type: tab as any }) : gf.trending({ offset, limit: 10, type: tab as any });

  return (
    <div className="absolute bottom-20 left-0 w-80 bg-base-100 shadow-2xl rounded-2xl border border-base-300 z-50 flex flex-col h-96 overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Search Bar */}
      <div className="p-3 border-b border-base-300 flex items-center gap-2">
        <Search size={16} className="opacity-40" />
        <input 
          type="text" 
          placeholder={`Search ${tab}...`} 
          className="bg-transparent outline-none text-sm flex-1"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-base-300">
        <button onClick={() => setTab("gifs")} className={`flex-1 p-2 flex justify-center gap-2 text-xs font-bold ${tab === "gifs" ? "border-b-2 border-primary text-primary" : ""}`}>
          <PlayCircle size={14} /> GIFs
        </button>
        <button onClick={() => setTab("stickers")} className={`flex-1 p-2 flex justify-center gap-2 text-xs font-bold ${tab === "stickers" ? "border-b-2 border-primary text-primary" : ""}`}>
          <Sticker size={14} /> Stickers
        </button>
      </div>

      {/* GIF/Sticker Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <Grid
          width={300}
          columns={2}
          fetchGifs={fetchGifs}
          key={`${tab}-${search}`}
          onGifClick={(gif, e) => {
            e.preventDefault();
            onSelect(gif.images.fixed_height.url);
          }}
        />
      </div>
    </div>
  );
};
export default MediaPanel;