<template>
    <canvas :width="size" :height="size" ref="cvs" @mousedown="mouseDown" @mouseup="mouseUp" @mousemove="mouseMove">

    </canvas>
</template>

<script lang="ts">
import { bd2wgs, wgs2bd } from "../utils";
import { computeDestinationPoint, getGreatCircleBearing, getDistance } from "geolib";

function coordinateValidator(value: [number, number]): value is [number, number] {
    return value.length == 2 && value.every<number>((i): i is number => typeof i === 'number');
}

export default {
    props: {
        value: {
            type: Array as unknown as () => [number, number],
            validator: coordinateValidator,
            default: [0, 0],
        },
        center: {
            type: Array as unknown as () => [number, number],
            validator: coordinateValidator,
            required: true,
        },
        maxDistance: {
            type: Number,
            required: true,
        },
        size: {
            type: Number,
            default: 50,
        },
    },
    data() {
        return {
            offset: [0, 0] as [number, number],
            updating: false,
            isDown: false,
        };
    },
    computed: {
        ctx(): CanvasRenderingContext2D {
            return this.cvs.getContext('2d')!;
        },
        cvs(): HTMLCanvasElement {
            return this.$refs.cvs as HTMLCanvasElement;
        },
        drawData() {
            return {
                size: this.size,
                center: this.size >>> 1,
                circleRadius: (this.size >>> 1) * 0.8,
                lineUnit: this.size >>> 6,
            }
        },
        centerWgs(): [number, number] {
            return bd2wgs(...this.center);
        },
    },
    methods: {
        mouseDown(e: MouseEvent) {
            this.isDown = true;
            this.setPoint(e.offsetX, e.offsetY);
        },
        mouseUp(e: MouseEvent) {
            this.isDown = false;
            this.setPoint(e.offsetX, e.offsetY);
        },
        mouseMove(e: MouseEvent) {
            if (this.isDown) {
                this.setPoint(e.offsetX, e.offsetY);
            }
        },
        setPoint(x: number, y: number) {
            const { center, circleRadius } = this.drawData;
            const maxDistance = this.maxDistance;
            
            let offsetX = x - center;
            let offsetY = y - center;
            let distance = Math.hypot(offsetX, offsetY);

            const angle = Math.atan2(offsetY, offsetX);

            if (distance > circleRadius) {
                offsetX = Math.cos(angle) * maxDistance;
                offsetY = Math.sin(angle) * maxDistance;
                distance = maxDistance;
            } else {
                offsetX *= maxDistance / circleRadius;
                offsetY *= maxDistance / circleRadius;
                distance *= maxDistance / circleRadius;
            }

            this.offset = [offsetX, offsetY];

            const [centerLng, centerLat] = this.centerWgs;
            const { latitude, longitude } = computeDestinationPoint(
                {
                    longitude: centerLng,
                    latitude: centerLat,
                },
                distance,  - angle * 180 / Math.PI,
            );
            this.updating = true;
            this.$emit('input', wgs2bd(longitude, latitude));
            this.updating = false;
        },
        setCoordinate(lng: number, lat: number) {
            const [longitude, latitude] = this.centerWgs;
            const centerPoint = {
                longitude, latitude,
            };
            const destPoint = {
                longitude: lng, latitude: lat,
            };
            const angle = - getGreatCircleBearing(centerPoint, destPoint) * Math.PI / 180;
            const distance = Math.min(
                this.maxDistance,
                getDistance(centerPoint, destPoint),
            );

            this.offset = [
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
            ];
        },
        drawBackground() {
            const { size, center, circleRadius, lineUnit } = this.drawData;

            const ctx = this.ctx;

            // ctx.fillStyle = 'white';
            // ctx.fillRect(0, 0, size, size);
            ctx.reset();

            ctx.beginPath();
            ctx.arc(center, center, circleRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = lineUnit;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(center, center, lineUnit, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();

        },
        drawPoint(x: number, y: number) {
            const { lineUnit } = this.drawData;
            const ctx = this.ctx;

            ctx.beginPath();
            ctx.arc(x, y, lineUnit * 0.75, 0, Math.PI * 2);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = lineUnit >>> 1;
            ctx.stroke();
        },
        random() {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.maxDistance;

            this.offset = [
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
            ];

            const [centerLng, centerLat] = this.centerWgs;
            const { latitude, longitude } = computeDestinationPoint(
                {
                    longitude: centerLng,
                    latitude: centerLat,
                },
                distance,  - angle * 180 / Math.PI,
            );
            this.updating = true;
            this.$emit('input', wgs2bd(longitude, latitude));
            this.updating = false;
        }
    },
    watch: {
        offset(offset: [number, number]) {
            this.drawBackground();

            const { center, circleRadius } = this.drawData;
            const distance = this.maxDistance;
            const [offsetX, offsetY] = offset;

            const x = center + offsetX * circleRadius / distance;
            const y = center + offsetY * circleRadius / distance;
            this.drawPoint(x, y);
        },
        value: {
            handler(coordinate: [number, number]) {
                this.updating || this.setCoordinate(...bd2wgs(...coordinate));
            },
            immediate: true,
        }
    }
}
</script>