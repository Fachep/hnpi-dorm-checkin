import Vue from 'vue';
import './style.css';
import App from './App.vue';

const app = document.createElement('div');
document.body.append(app);

new Vue(App).$mount(app);