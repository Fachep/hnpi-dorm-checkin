/// <reference types="@types/requirejs" />

declare module globalThis {
    declare const MOB_UTIL: {
        doPost(param: {url: string, params: Record<string, any>}): Promise<unknown>;
    };
}