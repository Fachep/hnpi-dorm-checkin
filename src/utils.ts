//import { bd09togcj02, gcj02tobd09, gcj02towgs84, wgs84togcj02 } from "./coordtransform";
import { wgs_bd, bd_wgs } from "prcoords";

export function bd2wgs(lng: number, lat: number): [number, number] {
    const ret = bd_wgs({ lon: lng, lat: lat });
    return [ret.lon, ret.lat];
}

export function wgs2bd(lng: number, lat: number): [number, number] {
    const ret = wgs_bd({ lon: lng, lat: lat });
    return [ret.lon, ret.lat];
}
