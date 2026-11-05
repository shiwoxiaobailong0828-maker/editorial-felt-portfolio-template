# AI 模板复用规范 (GEMINI.md / CLAUDE.md)

当用户要求基于本仓库创建新网站或添加新作品时，请遵循以下规范：

1. **视觉体系保留**：
   - 保持 `--paper: #f4f1ea` 暖白特种纸底色、`2px solid #111` 墨线分栏、`#ff4d2e` 朱砂红强调色与 `#ffe14d` 柠檬黄印章的杂志大字画册风。
2. **3D 羊毛毡互动剧场 (`#mascot3d`)**：
   - 直接复用 `assets/mascot3d.js`（源码位于 `src/mascot3d/mascot.js`）。如需更换角色形象，只需替换 `assets/duo_interact.jpg`（默认姿态）与 `assets/duo_sunglasses.jpg`（点击切换姿态）。
3. **作品列表 (`WORKS`) 与真实截图封面**：
   - 每件作品封面必须使用 `1280×800` 的真实作品运行画面截图，保存为 `posters/<slug>-shot.jpg`（可使用 `scripts/shoot_works.mjs` 自动截取），严禁使用 Emoji 占位图。
   - 修改 `index.html` 中的 `WORKS` 数组后，右上角印章、统计栏和筛选标签的作品数量会自动根据 `WORKS.length` 更新。
