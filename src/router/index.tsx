import {createBrowserRouter, type RouteObject} from "react-router-dom";
import type {RouteHandle} from "../../types/router.ts";
import BaseLayout from "@/components/Layout/BaseLayout";
import OperatingSystem from "@/components/System/OperatingSystem";
import {LazyLoad} from "@/components/Common/LazyLoad";
import {lazy} from "react";

type AppRouteObject = RouteObject & {
    handle?: RouteHandle
    children?: AppRouteObject[]
}

export const routerConfig: AppRouteObject[] = [
    {
        path: '/app',
        element: <BaseLayout/>,
        children: [
            {
                path: 'test',
                element: <LazyLoad component={lazy(() => import('@/apps/TestApp'))}/>
            }
        ]
    },
    {
        path: '/',
        element: <OperatingSystem/>
    }
]

export const router = createBrowserRouter(routerConfig)
