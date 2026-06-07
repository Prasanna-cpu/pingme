import React from 'react';
import "./App.css"
import {Routes} from "react-router"
import {Route} from "react-router-dom";
import ChatPage from "./pages/ChatPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";

const App : React.FunctionComponent = () => {

    return (
        <div className={"min-h-screen bg-emerald-900 relative flex items-center justify-center p-4 overflow-hidden"}>

            <div className="absolute inset-0 bg-[size:14px_24px]" />
            <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
            <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

            <Routes>
                <Route
                    path = {"/"}
                    element = {<ChatPage/>}
                />
                <Route
                    path = {"/login"}
                    element = {<LoginPage/>}
                />
                <Route
                    path = {"/signup"}
                    element = {<SignUpPage/>}
                />
            </Routes>
        </div>
    );
};

export default App;