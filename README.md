# 高等数学交互课件

**让数学概念可观察，让推导过程可探索。**

这是一套为高等数学课堂设计的交互式课件。课件从问题出发，通过动态图像、逐步推导和例题练习，帮助学生在观察与思考中理解数学概念。

**[在线打开课件目录 →](https://broadenzeng.github.io/higher-math-interactive/)**

当前版本：**v0.1.1** · [更新记录](CHANGELOG.md)

## 课件目录

| 章节 | 内容 |
| :--- | :--- |
| 3.3 | [洛必达法则](https://broadenzeng.github.io/higher-math-interactive/3.3%20%E6%B4%9B%E5%BF%85%E8%BE%BE%E6%B3%95%E5%88%99/3.3%20%E6%B4%9B%E5%BF%85%E8%BE%BE%E6%B3%95%E5%88%99.html) |
| 3.4 | [函数的单调性与曲线的凹凸性](https://broadenzeng.github.io/higher-math-interactive/3.4%20%E5%87%BD%E6%95%B0%E7%9A%84%E5%8D%95%E8%B0%83%E6%80%A7%E4%B8%8E%E6%9B%B2%E7%BA%BF%E7%9A%84%E5%87%B9%E5%87%B8%E6%80%A7/3.4%20%E5%87%BD%E6%95%B0%E7%9A%84%E5%8D%95%E8%B0%83%E6%80%A7%E4%B8%8E%E6%9B%B2%E7%BA%BF%E7%9A%84%E5%87%B9%E5%87%B8%E6%80%A7.html) |

| 3.5 | [函数的极值与最值](https://broadenzeng.github.io/higher-math-interactive/3.5%20%E5%87%BD%E6%95%B0%E7%9A%84%E6%9E%81%E5%80%BC%E4%B8%8E%E6%9C%80%E5%80%BC/3.5%20%E5%87%BD%E6%95%B0%E7%9A%84%E6%9E%81%E5%80%BC%E4%B8%8E%E6%9C%80%E5%80%BC.html) |

其他章节持续建设中。

## 课件特点

- **动态观察**：通过可操作的图像，观察函数和曲线的变化。
- **逐步讲解**：按课堂节奏呈现问题、推导和结论。
- **课堂书写**：支持画笔批注、白板、撤销及笔迹保存与读取。
- **例题练习**：按需展开解答，方便课堂讲解和课后回顾。

## 使用方式

可以通过上方链接在线使用，也可以下载整个项目，打开相应章节的 HTML 文件。建议使用 Microsoft Edge；笔迹保存的位置可能受浏览器文件访问权限影响。

## 使用与授权

欢迎教师和学生免费将课件用于非商业教学与学习。商业使用请事先联系作者并获得授权。

项目使用 [MathJax](https://www.mathjax.org/) 渲染公式；MathJax 等第三方资源遵循各自的许可证。

## 源码维护

课件共用的样式和放映工具位于 `公共资源`，各章节的图像脚本保存在对应章节目录中。修改公共资源后，请检查各章节和新课件模板。

项目使用 `.editorconfig` 和 Prettier 统一源码格式。安装 Node.js 后，在项目目录运行以下命令即可检查格式（不检查第三方 MathJax 文件）：

```sh
npx prettier@3.6.2 --check "**/*.{html,js,css}"
```

将 `--check` 改为 `--write` 可自动整理格式。课堂放映和交互功能仍需实际测试。

## 联系与交流

作者：曾展宽 · 嘉应学院  
邮箱：[broadenzeng@gmail.com](mailto:broadenzeng@gmail.com)

欢迎交流数学教学、交互课件的想法与使用建议。
