import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Navbar from "../components/Navbar"; // Fixed: Added missing Navbar import

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();
  const isChatActive = !!(selectedUser || selectedGroup);

  return (
    <div className="h-screen w-full flex flex-col bg-base-100 overflow-hidden">
      
      {/* Navbar Handler: Mobile par hide ho jayega jab koi chat selected ho */}
      <div className={`${isChatActive ? "hidden md:block" : "block"} shrink-0`}>
        <Navbar />
      </div>

      {/* Main Layout Workspace Content Frame */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Sidebar Frame: Mobile view par full width aur hide jab chat active ho */}
        <div 
          className={`${
            isChatActive ? "hidden" : "block"
          } w-full md:w-[350px] lg:w-[400px] h-full border-r border-base-300 md:block shrink-0`}
        >
          <Sidebar />
        </div>

        {/* Chat Feed Workspace Container: Mobile view par absolute coverage setup */}
        <div 
          className={`${
            !isChatActive ? "hidden" : "flex"
          } flex-1 h-full flex-col bg-base-100 md:flex`}
        >
          {!isChatActive ? <NoChatSelected /> : <ChatContainer />}
        </div>

      </div>
    </div>
  );
};

export default HomePage;