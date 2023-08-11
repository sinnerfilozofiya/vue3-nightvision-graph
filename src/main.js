import './style.css'
import App from './App.vue'
import {h, createApp } from 'vue'
import singleSpaVue from 'single-spa-vue';

createApp(App).mount('#app')


const vueLifecycles = singleSpaVue({
    createApp,
    appOptions: {
        render() {
            return h(App, {
                props: {
                    // single-spa props are available on the "this" object. Forward them to your component as needed.
                    // https://single-spa.js.org/docs/building-applications#lifecyle-props
                    name: this.name,
                },
            });
        },
    },
});
export const {bootstrap,mount,unmount} = vueLifecycles;