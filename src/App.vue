<template>
  <div class="root">
    <div class="xg-flex-SC">
      <div class="xg-font-title-3 xg-text-color--title" style="flex: 1 1 0%;">强制签到</div>
    </div>
    <div class="map-box"><Map ref="map" v-model="checkinCoordinate" :maxDistance="selectedPosition?.YXFW ?? 0"
        :center="centerCoordinate" :size=400></Map></div>
    <div class="box">

      <table>
        <tr class="xg-font-maintext">
          <td><span class="xg-text-color--minor" style="margin-right: 8px;">签到点</span></td>
          <td><select class="xg-multi-selectv2" v-model="selected">
            <option class="van-cell" v-for="(item, i) in instance.ddList" :key="item.DDDM" :value="i">{{ item.QDDD }}
            </option>
            </select></td>
        </tr>
        <tr class="xg-font-maintext">
          <td><span class="xg-text-color--minor" style="margin-right: 8px;">经度</span></td>
          <td><span class="xg-text-color--title">{{ selectedPosition?.JDZB }}</span></td>
        </tr>
        <tr class="xg-font-maintext">
          <td><span class="xg-text-color--minor" style="margin-right: 8px;">维度</span></td>
          <td><span class="xg-text-color--title">{{ selectedPosition?.WDZB }}</span></td>
        </tr>
        <tr class="xg-font-maintext">
          <td><span class="xg-text-color--minor" style="margin-right: 8px;">半径</span></td>
          <td><span class="xg-text-color--title">{{ selectedPosition?.YXFW }}</span></td>
        </tr>
      </table>

      <table>
        <tr class="xg-font-maintext">
          <td colspan="2"><span class="xg-text-color--minor" style="margin-right: 8px;">当前位置</span>
            <i class="xg-text-color--primary van-icon van-icon-replay" @click="random"></i></td>
        </tr>
        <tr class="xg-font-maintext">
          <td><span class="xg-text-color--minor" style="margin-right: 8px;">地点</span></td>
          <td><input v-model="address" type="text"></td>
        </tr>
        <tr class="xg-font-maintext">
          <td><span class="xg-text-color--minor" style="margin-right: 8px;">经度</span></td>
          <td><input v-model.number="checkinCoordinate[0]" type="number" max="137.8347" min="72.004"></td>
        </tr>
        <tr class="xg-font-maintext">
          <td><span class="xg-text-color--minor" style="margin-right: 8px;">维度</span></td>
          <td><input v-model.number="checkinCoordinate[1]" type="number" max="55.8271" min="0.8293"></td>
        </tr>
      </table>

      <div style="margin: auto 0 0 auto;">
        <div class="van-button van-button--default van-button--normal"
          :class="selectedPosition ? '' : 'van-button--disabled'" :disabled="!selectedPosition" @click="save">
          <div class="van-button__content"><span class="van-button__text">保存</span></div>
        </div>
        <div class="van-button van-button--default van-button--normal"
          :class="instance.ddList.length ? '' : 'van-button--disabled'" :disabled="!instance.ddList.length"
          @click="load">
          <div class="van-button__content"><span class="van-button__text">加载</span></div>
        </div>
        <div class="van-button van-button--primary van-button--normal" :class="ready ? '' : 'van-button--disabled'"
          :disabled="!ready" @click="checkin">
          <div class="van-button__content"><span class="van-button__text">签到</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { PointData, Instance } from "./checkin";
import { requireAsync } from "./utils";
import Map from "./components/Map.vue";
import { GM_getValue, GM_setValue } from "$";

export default {
  components: {
    Map,
  },
  props: {
    instance: {
      type: Object as () => Instance,
      required: true,
    },
  },
  data() {
    return {
      selected: 0,
      checkinCoordinate: [0, 0] as [number, number],
      address: "",
    };
  },
  computed: {
    ready(): boolean {
      return this.selectedPosition != undefined && this.checkinCoordinate.every(i => i != 0);
    },
    centerCoordinate(): [number, number] {
      return [Number(this.selectedPosition?.JDZB ?? 0), Number(this.selectedPosition?.WDZB ?? 0)];
    },
    selectedPosition(): PointData | undefined {
      return this.instance?.ddList[this.selected];
    },
  },
  methods: {
    async checkin() {
      if (!this.ready) {
        return;
      }
      const params = {
        KQWZXX: this.address,
        JDZB: this.checkinCoordinate[0],
        WDZB: this.checkinCoordinate[1],
      };

      await MOB_UTIL.doPost({
        url: (
          await requireAsync(['api']) as Record<string, string>
        ).addKqInfo,
        params,
      });

      this.instance.dkDialogShow = true;
      this.instance.getKqInfo();
    },
    save() {
      GM_setValue("position", this.selectedPosition!.DDDM);
      GM_setValue("coordinate", this.checkinCoordinate);
      GM_setValue("address", this.address);
    },
    load() {
      const i = this.instance!.ddList.findIndex(p => p.DDDM === GM_getValue("position"));
      if (i) {
        this.selected = i;
        const address: string = GM_getValue("address");
        if (address) {
          this.address = address;
        }
        setTimeout(() => this.checkinCoordinate = GM_getValue("coordinate"));
      }
    },
    random() {
      (this.$refs.map as { random(): void; } | undefined)?.random();
    },
  },
  watch: {
    selectedPosition(newPoint: PointData | undefined, oldPoint: PointData | undefined) {
      if (newPoint) {
        this.checkinCoordinate = [Number(newPoint.JDZB), Number(newPoint.WDZB)];
        if (!oldPoint || !this.address || oldPoint.QDDD === this.address) {
          this.address = newPoint.QDDD;
        }
      }
    }
  },
}

</script>

<style scoped>
.root {
  margin: 0 auto;
  width: calc(100% - 24px);
  padding: 16px;
  background-color: white;
  border-radius: 16px;
}

.box {
  display: flex;
  justify-content: space-between;
}

.box>div {
  margin-right: 16px;
}

.map-box {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.van-button+.van-button {
  margin-left: 12px;
}

tr.xg-font-maintext>td>input {
  width: 100%;
}
</style>
