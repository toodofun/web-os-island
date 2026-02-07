import {createBrowserRouter, type RouteObject} from "react-router-dom";
import type {RouteHandle} from "../../types/router.ts";
import BaseLayout from "@/components/Layout/BaseLayout";

type AppRouteObject = RouteObject & {
    handle?: RouteHandle
    children?: AppRouteObject[]
}

export const routerConfig: AppRouteObject[] = [
    {
        path: '/',
        element: <BaseLayout/>,
    }
]

export const router = createBrowserRouter(routerConfig)
