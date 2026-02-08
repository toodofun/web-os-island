import React from "react";
import {Outlet} from "react-router-dom";

const BaseLayout: React.FC = () => {
    return (
        <div className="w-full h-full bg-slate-100/20">
            <Outlet/>
        </div>
    )
}

export default BaseLayout;
