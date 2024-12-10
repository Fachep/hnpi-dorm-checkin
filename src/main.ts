import Vue from 'vue';
import './style.css';
import App from './App.vue';
import type { Instance, Component } from './checkin';

if (location.pathname.endsWith("*default/index.do")) {

    const el = document.createElement('div');
    document.body.append(el);

    const app = new Vue({
        render(h) {
            return this.instance?.ddList.length ? h(App, {
                props: {
                    instance: this.instance,
                },
            }) : h();
        },
        data: {
            instance: null as Instance | null,
        },
        el
    });

    const modulePath = 'newmob/xscq/kqqd/dwdk/dwdk';
    require(
        [modulePath],
        function (_module: (...args: any[]) => Component) {
            require.undef(modulePath);
            unsafeWindow.define(
                modulePath,
                () => function (this: any) {
                    const component = _module.apply(
                        this,
                        arguments as IArguments & any[]
                    );
                    component.mounted = function (this: Instance) {
                        if (this.$route.path === '/xscq/kqqdx') {
                            app.instance = this;
                            this.$watch('ddList', () => app.$forceUpdate());
                        }
                    };
                    component.destroyed = () => app.instance = null;
                    return component;
                }
            );
        }
    );
}