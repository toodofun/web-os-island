import {HeroUIProvider, ToastProvider} from "@heroui/react"
import './App.css'
import {RouterProvider} from "react-router-dom";
import {router} from "@/router";

function App() {
    return (
        <HeroUIProvider>
            <ToastProvider/>
            <div className="h-screen w-screen">
                <RouterProvider router={router}/>
            </div>
        </HeroUIProvider>
    )
}

export default App
