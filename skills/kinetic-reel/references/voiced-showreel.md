# Voiced product showreels

Use this direction for short, spectacular product/capability films with narration. Aim for a distinct story
with strong typography, purposeful diagrams and particles supporting the reveal. Adapt the composition,
shot order, palette and runtime to the subject; a reference supplies visual taste, not a shot-for-shot script.

## Visual direction

- Near-black stage, warm off-white display type, orange accents and a restrained warm halo. Brief cyan offsets
  can punctuate a glitch. Approximate starting colours: `#090909`, `#f2eee4`, `#ff6b3d`, `#56ddeb`.
- Big Chinese headlines with a shorter English secondary line work well for a Chinese audience. Keep HUD
  labels, brackets, timecode and progress marks small and quiet. Exact fonts are a design choice.
- Alternate the headline's position with the demonstration: code window, routing diagram, changing language
  tokens, or a progressing task list. Build a mechanism that explains the current topic.
- Use a terminal-like opening, a radial line/particle burst, bold letter arrivals, a stair-step colour wipe,
  an iris through an active node, and short full-frame typography slams as a vocabulary. Choose the transitions
  that connect the actual shots; using all of them is unnecessary.
- At the finale, reduce the motion and let the brand and closing line settle. Sparse sparks/rings can release
  energy around the mark. Keep the mark readable throughout its hold.

The locally inspected reference was a 15.019-second, 1920×1080, 60 fps video. Those are observed format values,
not universal defaults. A title needs time to land and a spoken sentence needs its real duration. Use 60 fps
when matching this motion character and the export budget allows it, passing `--fps=60` to frames and encode.

## Example structure, redesigned per project

| Beat | Purpose | Possible treatment |
|---|---|---|
| Hook | Establish the premise quickly | Typed command → a small ignition → title |
| Demonstrate | Show two or three useful capabilities | Big claim + an animated mechanism or sourced result |
| Accelerate | Expand the range without adding clutter | Short keyword slams, alternating light/dark stages |
| Land | Give the viewer a clear destination | Particle ring/reveal → clean brand + closing sentence |

Write fresh, short narration. Each sentence should explain or advance the visible action. Align scenes to
the measured speech first, then fit music accents around that structure. Shorten copy or extend a shot if
needed; do not squeeze speech to match an arbitrary 15-second target. Supplied reference brands, version
numbers, success badges and performance claims are not facts about the new subject.

## Narration, timings and mix

The bundled `music/narrate.py` synthesizes sentences separately with [edge-tts](https://github.com/rany2/edge-tts),
decodes them to 48 kHz stereo PCM, measures sample counts, and writes a timeline plus sentence-level SRT.
For Chinese narration, its baseline is `zh-CN-YunxiNeural`, rate `+12%`, pitch `-2Hz`, default TTS volume.
Follow the user's confirmed voice preference; explicit choices can override these JSON fields.

Create `narration.json` in the project:

```json
{
  "voice": "zh-CN-YunxiNeural", "rate": "+12%", "pitch": "-2Hz",
  "lead": 0.14, "tail": 0.8,
  "segments": [
    {"text": "第一句与开场的视觉动作对应。", "gap": 0.13},
    {"text": "第二句解释画面正在展示的能力。", "gap": 0.13}
  ]
}
```

Replace those example sentences with the actual script. From the project directory:

```bash
python -m pip install edge-tts
python music/narrate.py narration.json --out=out/voice-v1
# With a local music file; music is reduced further while speech is active:
python music/narrate.py narration.json --out=out/mix-v1 --music=assets/score.m4a
```

The service needs network access and receives the script text. The script does not upload reference media.
Each run requires an empty output directory, so changed text cannot reuse old speech accidentally. A synthesis
failure stops the run; do not silently change voice or report a finished mix. The output `track.wav` is the
narration/final mix, `timeline.json` contains actual sentence intervals and total duration, and `captions.srt`
contains sentence intervals (not word-level transcription).

Use `timeline.json` to update `reel/cues.js`: `S`, `hits`, `CH`, and `dur`. Mux `track.wav` with the render.
Any renderer using `-shortest` can truncate the video when audio is shorter: make the scene timeline match
the measured track, or pad the track intentionally before muxing. Do not synthesize an entire score and voice
independently and hope their lengths agree.

## Quality review

Review the opening, every demonstration, transitions and final brand hold at real resolution. Check Chinese
glyphs, focus, particle cores, contrast and empty-frame flashes. Reserve stable reading time between bursts.
Preview the full film with audio when playback is available: pronunciation, sentence endings, music masking,
and the relation between the spoken idea and its visual event matter more than effect count. If listening is
unavailable, report that limit; waveform or loudness measurements alone do not prove a pleasing voice mix.
Check the exported audio stream and actual duration with ffprobe. Keep the reference video local.
