import {type ComponentType, type ReactNode, Suspense} from "react";
import Loading from "@/components/Common/Loading";

type MaybeProps<T> = T extends Record<string, never> ? void | T : T;

interface LazyLoadProps<T extends Record<string, unknown>> {
    component: ComponentType<T>;
    componentProps?: MaybeProps<T>;
    fallback?: ReactNode;
}

export function LazyLoad<T extends Record<string, unknown>>(
    {
        component: Component,
        componentProps,
        fallback = <Loading/>,
    }: LazyLoadProps<T>) {
    return (
        <Suspense fallback={fallback}>
            <Component {...(componentProps as T)} />
        </Suspense>
    )
}
