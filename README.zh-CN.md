<div align="center">

# painted-animation

<a href="README.md"><img src="https://img.shields.io/badge/English-2B2233?style=for-the-badge" alt="English"></a>
<a href="README.zh-CN.md"><img src="https://img.shields.io/badge/简体中文-D97757?style=for-the-badge" alt="简体中文"></a>

让 Claude Opus 5.5 用代码画手绘动画、做歌词 MV 的 Claude Code 技能。

</div>

![小镇姑娘](docs/xiaozhen-sheet.jpg)

上面这些画面没有一张是生图模型生成的。每个镜头都是 JavaScript 画的：用 p5.js 和水彩笔刷库 [p5.brush](https://github.com/acamposuribe/p5.brush)，在无头 Chrome 里一帧一帧渲染，最后用 ffmpeg 合成视频。分镜是 Claude 写的，角色是它用代码画的，时间是它对着歌卡的。它还会自己出截图、看截图，哪里不满意就改。

这个做法来自 John Heibel 的 [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)。那是一支两分半的 MV，几乎全程由 Opus 5.5 独立完成。他之后又整理出了 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) 这套通用工具。我把两者打包成了一个技能，并补上了做中文歌词 MV 需要的东西：测节拍、剪歌、卡拉 OK 字幕。

## 为什么用代码画？

论单张图好不好看，生图模型多半更强。但视频要的是另外几样东西，这些恰好是代码擅长的：

- 角色前后一致。每个角色每次都由同一个函数画出来，不会换一个镜头就变个样。
- 时间精确。每一帧都由时间算出来，笑点可以卡在歌词的某一个字上。
- 改哪里就只动哪里。我发现角色从车门两边露出来的图层 bug，改几行代码、重新渲染就好了，片子别的地方一点没变。
- Claude 能自己检查。它会渲染截图和逐帧拼图，自己看，然后接着改。

Opus 5.5 厉害的地方在于整个流程都能接得住：读懂歌词的前后文，写出真有笑点的分镜，写几千行不散架的绘图代码，再回头挑自己作品的毛病。

## 示例：陶喆《小镇姑娘》

<p align="center"><img src="docs/koi-gag.gif" width="520" alt="大经理 → 大锦鲤"></p>

我只给了一段歌词，外加两句话：要参考整首歌的上下文；歌迷爱把"大经理"听成"大锦鲤"，想办法用上。后来又补了 mp3 和 LRC 歌词时间。

它把整支片子放在同一个小镇车站：开头是一年前她坐火车离开，结尾是"我"也登上了火车。她头上戴一朵小花，不管变成什么都戴着，观众一看就知道是她。它测出这首歌是 154 BPM、每句 8 拍，动作都照这个剪。唱到"经理"时，电视里的她"噗"地变成一条锦鲤，字幕上的"经理"同时被划掉，改成"锦鲤"。接着锦鲤跳出电视，化成下一句里那颗"闪亮的星星"。

分镜和场景代码在 [examples/xiaozhen](examples/xiaozhen/)。原曲有版权，没有放进仓库。

## 安装

```bash
git clone https://github.com/tuzhechen2005/painted-animation ~/.claude/skills/painted-animation
```

需要 Node.js、Google Chrome 和 ffmpeg。测节拍的脚本另外需要装了 numpy 的 Python。

## 使用

在 Claude Code 里直接说要什么视频：

> 做一个 15 秒的动画，Clawd 想抓一只蝴蝶。

> 给这首歌做个歌词 MV。（附上 mp3 和 LRC 文件）

也可以输入 `/painted-animation`。它会建好项目、先给你看分镜，然后一个镜头一个镜头地做、边做边检查，最后输出 `out/video.mp4`。短片在 Mac 上渲染几分钟就好。没有独立显卡的话，水彩填色会比较慢。

## 目录

| 路径 | |
|---|---|
| `SKILL.md` | Claude 遵循的流程和规则 |
| `template/` | 动画引擎：Clawd 角色、笔刷、镜头、转场、卡拉 OK、渲染器 |
| `scripts/new_project.sh` | 新建项目 |
| `scripts/beat_grid.py` | 测歌曲速度，算出每句歌词落在第几拍 |
| `references/music-video.md` | 做 MV 和长视频的笔记 |
| `examples/xiaozhen/` | 上面这个例子 |

## 致谢

引擎和动画指南来自 John Heibel 的 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)（MIT 协议，见 [template/LICENSE](template/LICENSE)），方法来自他的 [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)。用到了 p5.js、p5.brush、Puppeteer 和 ffmpeg。技能本身和示例由 Claude Opus 5.5 在 Claude Code 里完成。

MIT 协议。
