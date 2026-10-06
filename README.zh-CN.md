<div align="center">

# opus-video-skills

<a href="README.md"><img src="https://img.shields.io/badge/English-0E0F0E?style=for-the-badge" alt="English"></a>
<a href="README.zh-CN.md"><img src="https://img.shields.io/badge/简体中文-DDF53D?style=for-the-badge" alt="简体中文"></a>

视频制作技能合集：手绘动画、动态排版与电影感 GPU 粒子，每种视觉风格对应一个技能。

</div>

## GoForAI 扩展版

本仓库维护于 [goforai-vip/opus-video-skills](https://github.com/goforai-vip/opus-video-skills)，Fork 自 [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills)。新增 **particle-cinema**：七类 GPU 粒子效果、文字/Logo 聚合变形、辉光、解析拖尾、本地预览播放器和 21 秒可运行示例。新 skill 可用于 Codex 和 Claude Code，原有两个 skill 保留上游工作流。

## 概述

各技能引导编程 Agent 完成分镜、动画、画面审查与最终编码。画面由代码程序化生成，音乐工作流随风格而异；particle-cinema 默认无声，可合入本地音轨。每一帧都由时间唯一确定，在无头 Chrome 中渲染，并由 ffmpeg 编码输出。

## 风格

| 技能 | 风格 | 典型用途 |
|---|---|---|
| [painted-animation](skills/painted-animation/) | 手绘水彩与墨线卡通，带角色表演 | 动画短片、音乐视频、带卡拉 OK 字幕的歌词 MV |
| [particle-cinema](skills/particle-cinema/) | 电影感 GPU 粒子、辉光、拖尾与连续变形 | 品牌揭幕、科幻片头、音乐视觉 |
| [kinetic-reel](skills/kinetic-reel/) | 动态排版：窄体大字、HUD 式小字标注、WebGL 图层 | 作品集短片、Showreel、产品片与片头 |

### painted-animation

![painted-animation](skills/painted-animation/docs/xiaozhen-sheet.jpg)

使用 p5.js 与水彩笔刷库 p5.brush 绘制每个镜头。角色依托一套表情库与动画原理进行表演，音乐视频按测得的节拍剪辑，歌词 MV 配有逐字卡拉 OK 字幕。示例为陶喆《小镇姑娘》的 31 秒歌词 MV。[说明文档](skills/painted-animation/README.zh-CN.md)。

### kinetic-reel

![kinetic-reel](skills/kinetic-reel/docs/work-reel-sheet.jpg)

在二维排版画布之上叠加 three.js 图层（粒子地形、流体大理石纹、铬金属扭结、可聚合成特定形状的粒子云），并经过 WebGL 后期处理。镜头之间采用形状连贯的转场，配乐与画面由同一条时间轴合成。示例为 84 秒的作品集短片《Work Reel ’26》。[说明文档](skills/kinetic-reel/README.zh-CN.md)。

### particle-cinema

![Particle Cinema](skills/particle-cinema/docs/nova-sheet.jpg)

星系、编织流场、双螺旋、粒子文字/Logo、能量爆散、星际隧道和能量球。使用 Three.js / GLSL，逐帧确定性渲染，无需生成式 API。[说明文档](skills/particle-cinema/README.zh-CN.md)。

## 环境要求

- 原有技能使用 Claude Code 及 Claude Opus 5.5；particle-cinema 可使用 Codex 或 Claude Code
- particle-cinema 需要 Node.js 20.19+ 或 22.12+
- Node.js、Google Chrome、ffmpeg
- Python 3 及 numpy（仅 painted-animation 的节拍检测需要）

## 安装

**以插件方式安装（推荐）。** 在 Claude Code 中执行：

```
/plugin marketplace add goforai-vip/opus-video-skills
/plugin install painted-animation@opus-video-skills
/plugin install kinetic-reel@opus-video-skills
/plugin install particle-cinema@opus-video-skills
```

按需安装所需的技能。之后用 `/plugin update` 获取新版本。

**以个人技能方式安装。** 克隆仓库一次，再链接所需的技能：

```bash
git clone https://github.com/goforai-vip/opus-video-skills ~/opus-video-skills
ln -s ~/opus-video-skills/skills/painted-animation ~/.claude/skills/painted-animation
ln -s ~/opus-video-skills/skills/kinetic-reel ~/.claude/skills/kinetic-reel
ln -s ~/opus-video-skills/skills/particle-cinema ~/.claude/skills/particle-cinema
```

之后在 `~/opus-video-skills` 中执行 `git pull` 即可更新。

> **从 `painted-animation` 升级。** 本仓库原先是单一的 `painted-animation` 技能，安装方式是直接克隆到 `~/.claude/skills/painted-animation`。该技能现已移至 `skills/painted-animation/`，原有安装方式不再有效。请删除旧的克隆，再按上述任一方式重新安装。

Codex 用户：将 `skills/particle-cinema` 复制到个人 `~/.codex/skills` 目录（Windows 为 `%USERPROFILE%\.codex\skills`）。

## 使用方法

在 Claude Code 中描述所需视频，系统会自动选用匹配的技能，也可以按名称直接调用：

> 制作一段 15 秒的动画：Clawd 试图抓住一只蝴蝶。

> 根据这份简历，把我的三个项目做成一支 60 秒的动态排版短片。

技能会创建项目、提交分镜、逐个镜头制作并审查，最终将 MP4 输出到项目的 `out/` 目录。

试试粒子风格：『做一段电影感粒子动画：星系收束成我的 Logo，再爆散成光，穿过星际隧道。』

## 目录结构

| 路径 | 说明 |
|---|---|
| `.claude-plugin/marketplace.json` | 插件市场清单（每个技能对应一个插件） |
| `skills/painted-animation/` | 水彩动画技能：引擎、指南与示例 |
| `skills/particle-cinema/` | GPU 粒子技能、本地预览、引擎、项目脚手架与完整示例 |
| `skills/kinetic-reel/` | 动态排版短片技能：引擎、指南与示例 |

## 新增风格

新增一种风格，即在 `skills/` 下新建一个目录，包含 `SKILL.md`、可直接运行的 `template/` 以及至少一个完整示例，并在 `.claude-plugin/marketplace.json` 中添加对应条目。各技能遵循同一套约定：每一帧都是时间的纯函数；`render.mjs` 负责生成关键帧拼图和并行渲染全部帧；最终编码之前，每个镜头都要依据渲染出的画面审查。

## 致谢

painted-animation 的动画引擎与指南改编自 John Heibel 的 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)（MIT 协议），整体方法参照其 [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)；kinetic-reel 的渲染器同样由该工具包改编而来。上游技能及示例由 Claude Opus 5.5 在 Claude Code 中完成，本 fork 新增独立的粒子引擎与渲染器。本项目使用了 p5.js、p5.brush、three.js、Puppeteer 与 ffmpeg。

## 许可协议

MIT，见 [LICENSE](LICENSE)。
