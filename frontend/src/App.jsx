import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Offer from "./components/common/Offer";
import Approutes from "./routes/Approutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <div className="w-full min-h-screen bg-[rgba(0,8,20,1)] no-scrollbar overflow-y-auto">
            <BrowserRouter>
                <Offer />
                <Navbar />
                <Approutes />
            </BrowserRouter>

            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
                draggable
                theme="dark"
            />

        </div>
    );
}

export default App;