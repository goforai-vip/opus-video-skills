# painted-animation

**[中文](#中文) · [English](#english)**

A Claude Code skill that turns **Claude Opus 5.5** into a hand-painted animation studio: watercolour and ink cartoons, music videos and lyric videos, painted frame by frame **in code**.

一个 Claude Code 技能，让 **Claude Opus 5.5** 变成一间手绘动画工作室：水彩加墨线风格的卡通短片、音乐 MV、歌词 MV，每一帧都**用代码**画出来。

![小镇姑娘 · contact sheet](docs/xiaozhen-sheet.jpg)

<p align="center"><img src="docs/koi-gag.gif" width="560" alt="大经理 → 大锦鲤"></p>

---

## 中文

### 这是什么

大多数 AI 视频是"生成"出来的。这个技能走的是另一条路：**Claude Opus 5.5 自己当导演、编剧和动画师**。它先读懂你的需求和歌词的上下文，写出分镜，再用代码把每个镜头画出来：角色、表情、镜头运动、转场、卡拉 OK 字幕都在代码里。然后渲染成 MP4，并把音乐合进去。

这套方法来自 Claude Opus 5.5 发布时 [JohnHeibel](https://github.com/JohnHeibel) 的两个项目。一个是 [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo)，由 Opus 5.5 独立完成的 156 秒 MV；另一个是 [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase)，由它整理成的通用动画引擎。本技能把两者的方法打包成了开箱即用的工作流，并补上了做中文歌词 MV 的完整流程。

### 为什么用 Opus 5.5 做视频特别厉害

整条流程需要一个模型同时做到这些事：理解剧情和情绪、写出几百到几千行结构清晰的绘图代码、看渲染图挑出自己的毛病、按节拍精确排时间。Opus 5.5 能把整条流程一个人走完：

- **角色始终如一。** 每个角色都是同一段代码画的，从第一帧到最后一帧不会"换脸"。示例里姑娘头上的小花出现在站台、车窗、锦鲤和星星上，始终是同一朵。
- **精确到帧。** 每一帧都只由时间 t 算出来，所以梗可以卡在歌词的某个字上。示例里唱到"经理"的那一刻，电视里的人变成锦鲤，字幕里的"经理"同时被划掉换成"锦鲤"。
- **哪里不对改哪里。** 发现一个图层 bug，只改几行代码、重新渲染那一段，其他画面一个像素都不变。
- **会自我检查。** 它会渲染关键帧拼图、逐帧拼图和局部特写，自己看图找问题，比如角色太小、表情跳变、道具没拿在手上、转场生硬，改完再看。
- **懂动画规律。** 起跳前先下蹲、落地压扁、动作跟随、表情先眯眼再切换，这些都写进了引擎，每个动作都用得上。

### 示例：陶喆《小镇姑娘》歌词 MV（31 秒）

输入只有：一段歌词、"要参考上下文"、"歌迷会把'大经理'玩梗成'大锦鲤'，要体现出来"，以及原曲和 LRC 歌词时间。Opus 5.5 做了这些：

- 把全片放在同一个小镇车站，开头和结尾互相呼应：一年前她坐火车离开，如今"我"也坐火车离开。
- 用姑娘头上的小花串起她的每个形态。
- 测出原曲是 154 BPM、每句 8 拍，所有动作都卡在节拍上。
- 锦鲤梗落在唱到"经理"的那一刻，接着锦鲤跃出电视，化成下一句里"闪亮的星星"。

分镜和完整代码见 [examples/xiaozhen/](examples/xiaozhen/)。原曲有版权，没有放进仓库。

### 安装

```bash
git clone https://github.com/tuzhechen2005/painted-animation ~/.claude/skills/painted-animation
```

需要 Node.js、Google Chrome 和 ffmpeg。测节拍脚本另外需要 Python 和 numpy。

### 使用

在 Claude Code 里用 Opus 5.5 直接说需求就行，例如：

> 做一个 15 秒的动画：Clawd 想抓一只蝴蝶
>
> 给这首歌做一个歌词 MV（附上 mp3 和 LRC 歌词）

也可以输入 `/painted-animation`。它会先建项目、写分镜，再逐个镜头制作、自己看图检查，最后导出 `out/video.mp4`。

### 仓库结构

| 路径 | 内容 |
|---|---|
| `SKILL.md` | 技能主文件：工作流程、核心规则、常见坑 |
| `template/` | 动画引擎：Clawd 角色（31 种情绪）、水彩笔刷、摄像机、转场、卡拉 OK、渲染器 |
| `scripts/new_project.sh` | 一键新建项目并检查环境 |
| `scripts/beat_grid.py` | 测歌曲 BPM 和节拍相位，并标出每句歌词落在第几拍 |
| `references/music-video.md` | 做 MV 和长视频的方法：对节拍、剪辑、双行字幕、分章节并行 |
| `examples/xiaozhen/` | 《小镇姑娘》分镜和全部场景代码 |

---

## English

### What it is

Most AI video is *generated*. This skill works differently: **Claude Opus 5.5 is the director, writer and animator.** It reads your idea (and the song's context), writes a storyboard, and then paints every shot in code: characters, acting, camera moves, transitions and karaoke. It renders the result to an MP4 with your music muxed in.

The method comes from two projects [JohnHeibel](https://github.com/JohnHeibel) made around the Claude Opus 5.5 launch. [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) is a 156 s music video made by Opus 5.5 on its own, and [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) is the general animation kit it grew into. This skill packages both into a ready-to-use workflow and adds a complete pipeline for lyric videos in Chinese (or any language).

### Why Opus 5.5 is so good at this

The pipeline needs one model to do several things at once: understand story and emotion, write hundreds to thousands of lines of well-structured drawing code, critique its own renders, and time everything to the beat. Opus 5.5 carries the whole pipeline end to end:

- **Characters stay on model.** Each character is one piece of code, so it never drifts between shots. In the example, her flower is the same flower on the platform, at the train window, on the koi and on the star.
- **Frame-exact control.** Every frame is a pure function of time, so a gag can land on a single sung word. In the example, the TV turns her into a koi on the word "经理" while the lyric is struck through and becomes "锦鲤".
- **Surgical fixes.** A layering bug is a few lines of code and a re-render of one stretch; nothing else changes by a single pixel.
- **It checks its own work.** It renders contact sheets, frame strips and close-up crops, looks at them, and fixes what's off (scale, stiff motion, snapping faces, props not touching hands, abrupt cuts) before rendering the final video.
- **Real animation principles.** Anticipation, squash and stretch, follow-through and acted emotion changes are built into the engine, so every move can use them.

### Example: 小镇姑娘 (David Tao), a 31 s lyric video

The input was one verse of lyrics, "use the song's context", "fans joke that 大经理 (big manager) is 大锦鲤 (big lucky koi), so show it", and later the song file and its LRC timings. Opus 5.5:

- set everything in one small-town station, with an ending that rhymes with the opening: she left by train a year ago, and now I leave by train;
- used her flower to link each of her forms;
- measured the song (154 BPM, 8 beats per line) and cut every action to the beat;
- landed the koi gag on the sung word, then had the koi leap out of the TV to become the next line's "shining star".

Storyboard and full scene code: [examples/xiaozhen/](examples/xiaozhen/). The song is copyrighted and isn't included.

### Install

```bash
git clone https://github.com/tuzhechen2005/painted-animation ~/.claude/skills/painted-animation
```

Requires Node.js, Google Chrome and ffmpeg. The tempo script also needs Python and numpy.

### Use

In Claude Code with Opus 5.5, just ask:

> Make a 15-second video of Clawd trying to catch a butterfly.
>
> Make a lyric video for this song (mp3 + LRC attached).

Or type `/painted-animation`. It scaffolds a project, storyboards, builds shot by shot while reviewing its own renders, and writes `out/video.mp4`.

### Layout

| Path | What |
|---|---|
| `SKILL.md` | The skill: workflow, core rules, gotchas |
| `template/` | The engine: Clawd (31 emotions), watercolour brushes, camera, transitions, karaoke, renderer |
| `scripts/new_project.sh` | Scaffold a project and check the toolchain |
| `scripts/beat_grid.py` | Tempo and beat phase of a song, and which beat each LRC line falls on |
| `references/music-video.md` | Music and long videos: beat grid, clipping, two-row karaoke, parallel chapters |
| `examples/xiaozhen/` | The 小镇姑娘 storyboard and full scene code |

---

## Credits · 致谢

- Engine and animation guide: [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) by John Heibel (MIT, see [template/LICENSE](template/LICENSE)).
- Method: [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) by John Heibel.
- Libraries: [p5.js](https://p5js.org), [p5.brush](https://github.com/acamposuribe/p5.brush), Puppeteer, ffmpeg. Fonts: Permanent Marker, Shantell Sans, Ma Shan Zheng (Google Fonts).
- The skill, the lyric-video pipeline and the example were made with Claude Opus 5.5 in Claude Code.

License: MIT.
