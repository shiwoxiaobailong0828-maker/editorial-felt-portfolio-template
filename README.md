# Editorial Felt Portfolio Template（杂志大字画册风 × 3D 羊毛毡实时互动网站模板）

这是一套**开箱即用、零框架依赖（单页 HTML + 预编译 Three.js 互动引擎）**的高级个人作品集 / 产品画册网站模板。

---

## ✨ 模板三大核心特色

1. **杂志大字画册风排版（Editorial Brutalist Magazine）**
   - 暖白特种纸底色（`#f4f1ea`）+ `2px` 纯黑墨线分栏 + 朱砂红（`#ff4d2e`）点睛色 + 右上角柠檬黄旋转印章（`#ffe14d`）。
   - 首屏巨幅衬线/黑体报头 + 动态跑马灯报栏（Ticker）+ 奇偶行左右交错的巨型编号（`01`, `02`, `03`...）画册排版。
2. **Three.js 3D 羊毛毡实时互动形象剧场（`src/mascot3d/mascot.js`）**
   - 自动边缘洪泛羽化抠图 + 摄影棚底色向 `#f4f1ea` 纸张底色无痕白平衡对齐。
   - **瞳孔级无扭曲眼神追踪**：移动鼠标时，角色眼珠内的瞳孔与高光平滑追踪鼠标，动态暖色体积光影与 3D 羊毛毡漂浮道具（红心 `♥`、四角星 `✦`）同步响应，同时保证面部、五官与眼镜框 **100% 端正不拉扯变形**。
   - **双姿态互动切换**：支持自然呼吸、摸摸头微动、独立眨眼；点击角色时触发 Q 弹跳跃、飘出粒子与对话气泡，并在 `assets/duo_interact.jpg`（常态互动）与 `assets/duo_sunglasses.jpg`（点击切换酷炫姿态）之间丝滑切换。
3. **浏览器画框 + 作品内部真实实机截图封面（`scripts/shoot_works.mjs`）**
   - 告别简陋的 Emoji 图标封面，每件作品均由复古浏览器窗口画框包裹 `1280×800` 真实运行画面截图（`posters/<slug>-shot.jpg`），自带硬边偏移阴影与悬停动效。

---

## 📁 目录结构

```text
├── index.html                  # 主页面（直接修改顶部的文案与底部的 WORKS / VIDEOS 数组即可复用）
├── assets/
│   ├── mascot3d.js             # 预打包好的 Three.js 3D 羊毛毡实时互动引擎（开箱即用）
│   ├── duo_interact.jpg        # 姿态一：默认羊毛毡角色互动贴图
│   └── duo_sunglasses.jpg      # 姿态二：点击切换后的羊毛毡角色贴图
├── posters/
│   └── <slug>-shot.jpg         # 各作品 1280×800 真实实机运行截图封面
├── src/
│   └── mascot3d/
│       └── mascot.js           # 3D 羊毛毡互动引擎完整源码（含 GLSL 顶点/片段着色器与自动抠图算法）
├── scripts/
│   └── shoot_works.mjs         # 无头浏览器自动批量截取作品实机封面的脚本
├── vite.config.js              # 重新打包 mascot3d.js 的 Vite 配置
└── package.json                # 源码编译与自动截图脚本配置
```

---

## 🚀 快速复用指南（3 分钟建出新网站）

### 方式一：直接让 AI 帮你基于此模板改出新站（最推荐）

把下面这段话直接发给任何 AI 编程助手（Antigravity / Claude Code / Cursor）：

> 请克隆我的模板仓库 `https://github.com/shiwoxiaobailong0828-maker/editorial-felt-portfolio-template`：
> 1. 保持这套「杂志大字画册风 + 3D 羊毛毡互动形象 + 真实实机截图画框」的视觉风格不变；
> 2. 把首屏大标题改为「XXX」，副标题改为「XXX」；
> 3. 把我的这些新项目更新到 `index.html` 的 `WORKS` 数组里，并截取每个项目的真实页面保存为 `posters/<slug>-shot.jpg`。

### 方式二：手动修改

1. **修改主标题与个人简介**：打开 `index.html`，搜索 `.hero-title` 与 `.hero-sub` 修改文字。
2. **更换你的 3D 羊毛毡形象**：
   - 将浅米色纯底（约 `#eee7d5` ~ `#f4f1ea`）的羊毛毡形象图替换为 `assets/duo_interact.jpg` 和 `assets/duo_sunglasses.jpg`，引擎会在加载时自动完成边缘羽化抠图与纸张底色融合。
   - 如需微调眼球坐标或着色器参数，编辑 `src/mascot3d/mascot.js` 后运行 `npm run build:mascot` 即可重新生成 `assets/mascot3d.js`。
3. **增删作品列表**：
   - 编辑 `index.html` 底部的 `const WORKS = [...]` 数组，页面会自动重排 `01 / 02 / 03` 编号并自动统计作品总数。
