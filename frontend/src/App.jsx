import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Offer from "./components/common/Offer";
import Approutes from "./routes/Approutes";

function App() {
    return (
        <div className="w-full min-h-screen bg-[rgba(0,8,20,1)]">
            <BrowserRouter>
                <Offer />
                <Navbar />
                <Approutes />
            </BrowserRouter>

        </div>
    );
}

export default App;