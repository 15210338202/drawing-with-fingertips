// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '指尖绘迹',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: '用手势把心里的画面画出来，一个安静、低刺激的创作空间。' },
        { name: 'theme-color', content: '#f6f1e7' },
      ],
      // 这个脚本必须在 Nuxt / Pinia / Vue Router 之前执行。
      // Pinia 4 和 Vue Router 5 的运行时都会直接调用 Object.hasOwn，
      // 旧版 Chromium（Chrome 91 及以下、部分微信内置浏览器）没有这个方法。
      script: [
        {
          key: 'compat-es2022',
          tagPriority: -100,
          innerHTML: `(function () {
  if (typeof Object.hasOwn !== 'function') {
    Object.defineProperty(Object, 'hasOwn', {
      configurable: true,
      writable: true,
      value: function (object, property) {
        if (object === null || object === undefined) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        return Object.prototype.hasOwnProperty.call(Object(object), property);
      }
    });
  }
  if (typeof Array.prototype.at !== 'function') {
    Object.defineProperty(Array.prototype, 'at', {
      configurable: true,
      writable: true,
      value: function (index) {
        var length = this.length >>> 0;
        var key = Number(index) || 0;
        key = key < 0 ? length + key : key;
        return key < 0 || key >= length ? undefined : this[key];
      }
    });
  }
  if (typeof String.prototype.replaceAll !== 'function') {
    Object.defineProperty(String.prototype, 'replaceAll', {
      configurable: true,
      writable: true,
      value: function (search, replacement) {
        if (search instanceof RegExp) {
          if (!search.global) {
            throw new TypeError('replaceAll must be called with a global RegExp');
          }
          return this.replace(search, replacement);
        }
        return this.split(String(search)).join(String(replacement));
      }
    });
  }
})();`,
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  experimental: {
    appManifest: false
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  modules: ['@pinia/nuxt'],
  nitro: {
    preset: 'cloudflare-pages',
    prerender: { autoSubfolderIndex: false }, // 避免 Cloudflare 路由匹配问题
  },
})