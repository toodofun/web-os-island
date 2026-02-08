import {createBrowserRouter, type RouteObject} from "react-router-dom";
import type {RouteHandle} from "../../types/router.ts";
import BaseLayout from "@/components/Layout/BaseLayout";
import OperatingSystem from "@/components/System/OperatingSystem";

type AppRouteObject = RouteObject & {
    handle?: RouteHandle
    children?: AppRouteObject[]
}

export const routerConfig: AppRouteObject[] = [
    {
        path: '/test',
        element: <BaseLayout/>,
    },
    {
        path: '/',
        element: <OperatingSystem/>
    }
]

export const router = createBrowserRouter(routerConfig)
