# 部署到 GitHub Pages

本项目已经是可发布的静态网站，不需要安装依赖、运行构建或申请密钥。建议新建公开仓库 `jingchu-artifacts`。

## 方法一：直接通过 GitHub 网页上传

1. 登录 GitHub，右上角 **＋ → New repository**。
2. Repository name 填 `jingchu-artifacts`，选择 **Public**，勾选 **Add a README file**，点击 **Create repository**。
3. 进入仓库，点击 **Add file → Upload files**。上传本项目文件夹内的内容，而不是将整个 `jingchu-artifacts` 文件夹再套一层。仓库首页应直接看见 `index.html`、`app.js`、`styles.css`、`collection.json` 和 `assets/`。
4. 可以分两批上传，先上传根目录的网页、JSON 和说明文件，再拖入整个 `assets` 文件夹。保留其内部的 models、posters、references、vendor 层级，每批点击 **Commit changes** 保存。
5. 进入仓库 **Settings → Pages**。
6. 在 **Build and deployment → Source** 选择 **Deploy from a branch**。
7. Branch 选 **main**，Folder 选 **/(root)**，点击 **Save**。
8. 等待 GitHub 完成部署，回到 Pages 页面点击显示的网站地址。地址通常是：

   `https://你的用户名.github.io/jingchu-artifacts/`

9. 打开网站，检查梅瓶是否加载；切换尊盘，确认可旋转；再打开任意参考图与来源链接。之后更新文件并提交，Pages 会重新部署。

不要只上传 ZIP；GitHub Pages 不会自动解压 ZIP。也不要把 ZIP 本身、源 Blend 备份或工作过程文件一并上传到网站。

## 方法二：Git 命令上传

先在 GitHub 创建一个空的公开仓库 `jingchu-artifacts`，不初始化 README。在本项目目录打开终端后执行以下命令，把 `你的用户名` 替换成实际用户名。登录由 GitHub 的正常认证流程完成，不要把令牌写进文件或远程地址。

```sh
git init -b main
git add .
git commit -m "Add Jingchu artifact collection"
git remote add origin https://github.com/你的用户名/jingchu-artifacts.git
git push -u origin main
```

之后仍按方法一第 5—8 步开启 Pages。

## 本地预览

在此项目文件夹打开终端：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

然后访问 `http://127.0.0.1:8000`。Windows 如果 `python` 不可用，可以试 `py -3 -m http.server 8000 --bind 127.0.0.1`。也可用编辑器内已有的本地静态预览服务。结束预览时在终端按 Ctrl+C。

## 常见问题

- **网页显示仓库 README 或 404**：确认根目录有 `index.html`，Pages 选择的是 main 和 /(root)，没有额外套入一层文件夹。查看仓库 Actions 中的 Pages 部署是否完成。
- **页面有文字，模型不出现**：确认 assets/models 与 assets/vendor 都已上传，文件名大小写一致。特别检查 vendor/draco 内的三个解码器文件。使用支持 WebGL 的近期浏览器。
- **直接双击网页提示无法加载清单**：请使用本地预览地址，或部署后的 HTTPS 地址；这是浏览器对本地文件的读取限制。
- **参考照片看起来仍有低清部分**：页面展示的是来源原始像素，没有 AI 增清冒充新证据。可以点击图片查看像素和原文。
- **公开后如何更新**：替换对应模型与图片，更新 collection.json、provenance.json，提交到 main 即可。通常不需要再次配置 Pages。

## 发布前的素材检查

原始参考图片与部分模型纹理来自博物馆、学术图版或媒体。项目保留了来源，但未取得统一的开放授权。请按 [RIGHTS.md](RIGHTS.md) 核实你计划的公开使用方式；署名和放置链接不等于已获得使用许可。可根据权利人要求替换或移除对应参考图和照片纹理。

部署规则依据：[GitHub Pages 发布源设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[GitHub 文件大小限制](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)。本项目采用分支直接发布，避免额外的构建配置。
