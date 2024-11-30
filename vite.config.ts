import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        namespace: 'fachep/hnpi-dorm-checkin',
        match: ['https://xg.hnpi.edu.cn/xsfw/sys/swmzncqapp/*'],
        author: 'fachep',
        license: 'MIT',
        description: '河南工业职业技术学院宿舍强制签到',
      },
      build: {
        externalGlobals: {
          vue: ['Vue', 'https://xg.hnpi.edu.cn/xsfw/sys/swpubapp/newmob/public/js/vue/vue.min.js'],
        },
      },
    }),
  ],
});
