import { wgs_bd, bd_wgs } from "prcoords";

export function bd2wgs(lng: number, lat: number): [number, number] {
    const ret = bd_wgs({ lon: lng, lat: lat });
    return [ret.lon, ret.lat];
}

export function wgs2bd(lng: number, lat: number): [number, number] {
    const ret = wgs_bd({ lon: lng, lat: lat });
    return [ret.lon, ret.lat];
}

export function requireAsync(module: string[]):
    Promise<any>
{
    return new Promise(require.bind(globalThis, module))
}