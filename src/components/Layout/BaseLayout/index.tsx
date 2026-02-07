import React from "react";
import {Outlet} from "react-router-dom";

const BaseLayout: React.FC = () => {
    return (
        <div className="w-full h-full bg-amber-200">
            <Outlet/>
        </div>
    )
}

export default BaseLayout;
