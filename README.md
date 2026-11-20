# 荆楚 · 十一器

十一件文物当前数字复原版本的交互展馆。访客可旋转、缩放、查看背面与俯视，放大参考图，并追溯资料来源。

纯静态网站，无构建步骤、账号、数据库或 API 密钥。网页查看器、Draco 解码器、模型与参考图均在项目内，运行不依赖第三方 CDN。适合直接部署到 GitHub Pages。

## 开始

1. **本地查看**：在此文件夹打开终端，执行 `python -m http.server 8000 --bind 127.0.0.1`，浏览器访问 `http://127.0.0.1:8000`。不要直接双击 `index.html`，浏览器会限制本地文件读取。
2. **发布网站**：按 [DEPLOY.md](DEPLOY.md) 创建 `jingchu-artifacts` 公开仓库，上传项目内容，开启 GitHub Pages 即可。

## 展示内容

| 编号 | 文物 | 当前版本 |
|---|---|---|
| A01 | 曾侯乙编钟 | v3 |
| A02 | 越王勾践剑 | v3 |
| A03 | 曾侯乙尊盘 | v4 |
| A04 | 云梦睡虎地秦简 | v3 |
| A05 | 虎座鸟架鼓 | v3 |
| A06 | 郧县人头骨化石 | v3 |
| A07 | 元青花四爱图梅瓶 | v4 |
| A08 | 彩绘人物车马出行图 | v4 |
| A09 | 石家河玉人像 | v3 |
| A10 | 崇阳铜鼓 | v4 |
| A11 | 黑夫木牍 | v3 |

共 11 个 GLB 模型、11 张模型预览、32 张参考图及各自缩略图。GLB 总计约 35 MB，按当前选中文物加载，每次只展示一件。尊盘使用 Draco 几何压缩，其余保留未压缩网格。所有单个文件均低于 GitHub 浏览器上传的 25 MiB 限制。

## 复原边界

这些模型是以照片和公开资料为依据的自主复原，**并非馆方扫描或科学测量模型**。网站逐件列出待补与近似部分：例如头骨是形态研究稿，虎座鸟架鼓的侧厚和背面仍近似，梅瓶四幅人物的环向邻接次序尚未得到证实。可旋转查看，不意味着每一面都有完整实物依据。

网页模型从已有 Blend 造型导出，应用修改器，将曲线转换为网格并合并。照片贴图保留；不能在 glTF 中直接表现的程序化材质转换为 PBR 代表色。网页环境光与 Blender 渲染可能有差异。源 Blend 没有在此过程中覆盖保存，未作为网站资源重复上传。

## 文件结构

```text
index.html                 页面
styles.css                 样式与移动端布局
app.js                     查看器、筛选、资料面板、图片放大
collection.json            逐件名称、模型、说明、参考图与来源
provenance.json             原图哈希、来源、源 Blend 哈希与排除记录
assets/models/             十一件 GLB
assets/posters/            网格加载前与索引中使用的预览
assets/references/         原始参考图片与独立缩略图
assets/vendor/             model-viewer 4.4.0、Draco 1.5.7 及其许可
DEPLOY.md                  GitHub Pages 部署步骤
RIGHTS.md                  图像、纹理和代码权利说明
VALIDATION.md              本次检查结果
```

更新某件文物时，替换对应 `assets/models/Axx.glb` 和预览，修改 `collection.json` 中该件的版本、大小、哈希、复原说明与参考记录；同时更新 `provenance.json`。文件名大小写须保持一致。所有资源采用相对路径，支持 `用户名.github.io/jingchu-artifacts/` 子目录部署。

## 技术与资料

- 查看器：[Google model-viewer](https://modelviewer.dev/)，Apache-2.0。
- 几何解码：[Google Draco](https://github.com/google/draco)，Apache-2.0。
- 每件文物的参考资料见页面“资料来源”和 [provenance.json](provenance.json)。
- 图像与照片纹理未被统一声明为开放授权，详见 [RIGHTS.md](RIGHTS.md)。

最后整理：2026-11-20。本站为自主展示项目，非博物馆官方网站。
