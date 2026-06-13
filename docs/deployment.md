# 上线闭环说明

这个站点适合采用同域部署：前端静态文件由 Nginx 提供，所有 `/api` 请求反代到 Spring Boot 后端。这样浏览器只看到一个域名，登录 token、接口调用和 CORS 都更简单。

## 业务闭环

- 游客可以直接浏览首页、江苏高校地图、校园经验和问答，降低第一次访问门槛。
- 收藏学校、个人中心、投稿、昵称设置、退出登录都需要账号。
- 注册要求邮箱验证码，能挡掉一部分低质量账号，也为找回密码留入口。
- 投稿先进入后端审核状态，个人页能看到自己的待审核、已通过和未通过记录。
- 个人页右侧保留创建者介绍，用来说明 cuteanzu 对数据、地图、内容和后端的持续维护。

## 前端构建

```bash
cd /path/to/jiangsu
npm ci
npm run lint
npm run build
```

构建产物在 `dist/`。生产环境推荐保持：

```bash
VITE_API_BASE_URL=/api
```

## 后端构建

后端需要 JDK 17。

```bash
cd /path/to/jiangsu-college-guide/backend
mvn clean package -DskipTests
java -jar target/guide-1.5.0.jar
```

生产环境至少配置这些变量：

```bash
JWT_SECRET=换成一段足够长的随机字符串
CORS_ALLOWED_ORIGINS=https://你的域名
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=邮箱账号
MAIL_PASSWORD=邮箱授权码
SPRING_DATASOURCE_URL=jdbc:mysql://127.0.0.1:3306/jiangsu_guide?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
SPRING_DATASOURCE_USERNAME=数据库用户
SPRING_DATASOURCE_PASSWORD=数据库密码
UPLOAD_DIR=/data/jiangsu/uploads
```

开发环境不配置 SMTP 时，后端会把验证码打印到控制台。正式上线必须配置 SMTP，否则用户收不到注册和找回密码验证码。

## Nginx 示例

把 `root` 改成你的前端 `dist` 目录，把 `server_name` 改成你的域名。

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/jiangsu/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:9090/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Authorization $http_authorization;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:9090/uploads/;
        proxy_set_header Host $host;
    }
}
```

配置 HTTPS 后，把 `CORS_ALLOWED_ORIGINS` 改成 `https://你的域名`。

## 上线验收

1. 打开 `/jiangsu`，确认地图和高校数据可浏览。
2. 打开 `/login`，用邮箱获取验证码并注册。
3. 注册后进入 `/me`，确认个人页能显示账号信息。
4. 在个人页提交一条内容，确认后端出现待审核记录。
5. 在地图学校卡片点击收藏，确认收藏学校能出现在个人页。
6. 测试找回密码，确认邮箱能收到验证码。
7. 退出登录后访问 `/me`，应回到登录流程。
