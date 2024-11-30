import type { CombinedVueInstance } from "vue/types/vue";
import Vue from "vue";

interface ConfigInfo {
    "IN_TIME": boolean;
    "IN_WG_TIME": boolean;
    "IN_CQ_TIME": boolean;
    "IN_DATE": boolean;
}

interface QdInfo {
    "hasQd": boolean;
    "hasQdhcq": boolean;
}

interface SslInfo {
    "SSLDM": string,
}

export interface PointData {
    "YXFW": number;
    "QDDD": string; // address text
    "WDZB": string;
    "JDZB": string;
    "DDDM": string;
};

interface Data {
    configInfo: ConfigInfo; // 查寝设置信息
    ddList: PointData[]; // 查寝地点
    isQj: boolean; //是否请假
    sslInfo: SslInfo; // 宿舍楼信息
    hasZsxx: boolean; // 是否住宿
    qdInfo: QdInfo; // 签到信息:签到时间、是否签到后出寝等
    jwdList: [string, string][]; // 签到地点经纬度（多个）
    yxfwList: number[]; // 签到地点允许范围（多个）
    //当前地址
    address: string;
};

export type Instance = CombinedVueInstance<Vue, Data, {}, {canSign: boolean}, {}>;

type VueElement = HTMLElement & {__vue__?: Instance};

function getInstance(): Instance | null {
    return (document.getElementById('kqqd-smkq') as VueElement | null)?.__vue__ ?? null;
}

const store = new Vue({
    data() {
        return {
            instance: getInstance(),
        };
    }
})

const timer = setInterval(() => {
    const instance = getInstance();
    if (instance?.ddList.length) {
        clearInterval(timer);
        store.instance = instance;
    }
}, 200);

export function useInstance(): Instance | null {
    return store.instance;
}