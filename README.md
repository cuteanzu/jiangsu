# Scholarium | 江苏高校生活指北

一个面向高考毕业生、准大学生和在校大学生的江苏高校探索网站。项目用 3D 江苏地图、校园经验、问答和个人中心，把“学校在哪里、生活怎么样、适不适合我”变成可浏览、可筛选、可扩展的产品体验。

## 技术栈

- React 19 + TypeScript
- Vite 8
- styled-components
- Three.js / React Three Fiber / drei
- react-router-dom
- lucide-react

## 本地运行

```bash
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`。

## 连接后端

后端默认是 Spring Boot 服务，端口 `9090`。开发时前端请求 `/api`，由 Vite 代理到后端。
后端需要 JDK 17；如果 `java -version` 显示 `1.8`，先安装或切换 JDK。

```bash
cp .env.example .env.local
npm run dev
```

`.env.local` 可配置：

```bash
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:9090
```

详细接口说明见 [docs/backend-integration.md](docs/backend-integration.md)。

## 当前页面

- `/`、`/home`：首页
- `/jiangsu`、`/map`：江苏 3D 高校地图
- `/jiangsu/:citySlug`、`/map/:citySlug`：城市视角
- `/experiences`：校园经验
- `/qa`：问答
- `/me`：个人中心
- `/login`：登录页

## 数据策略

目前地图和内容页保留了静态数据，适合作为后端未启动时的展示兜底。正式上线时，CSV 数据应导入后端数据库，再通过 `/api/schools`、`/api/experiences`、`/api/qa` 等接口提供给前端。

## 构建

```bash
npm run lint
npm run build
```
