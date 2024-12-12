import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'replace-vue',
      resolveId(id) {
        if (process.env.NODE_ENV === 'production' && id === 'vue') {
          return '\0replace-vue';
        }
      },
      async load(id) {
        if (id === '\0replace-vue') {
          const utils = await this.resolve('./src/utils.ts');
          return `
            import { requireAsync } from '${utils.id}';
            await requireAsync(['../../swpubapp/newmob/js/resources']);
            export default await requireAsync(['vue']);
          `;
        }
      },
      enforce: 'pre',
    },
    createVuePlugin(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '河南工业职业技术学院宿舍强制签到',
        namespace: 'fachep/hnpi-dorm-checkin',
        match: ['https://xg.hnpi.edu.cn/xsfw/sys/swmzncqapp/*'],
        icon: 'https://xg.hnpi.edu.cn/xsfw/sys/swmzncqapp/*default/public/images/newmob/sdkq_5.png',
      },
      build: {
        externalGlobals: {
          prcoords: cdn.jsdelivrFastly('PRCoords', 'js/PRCoords.min.js'),
          // geolib: cdn.jsdelivrFastly('geolib', 'lib/index.min.js'), // embed cause of requirejs incompatible
        
        },
      },
    }),
  ],
});
