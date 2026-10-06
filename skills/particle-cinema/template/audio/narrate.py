"""Sentence TTS, sample-measured timeline, captions, and optional ducked music."""
import argparse
import asyncio
import json
import math
import os
from pathlib import Path
import subprocess
import wave

RATE = 48000
CHANNELS = 2


def run(args):
    subprocess.run(args, check=True)


def seconds(value, label):
    n = float(value)
    if not math.isfinite(n) or n < 0:
        raise ValueError(f"{label} must be a finite nonnegative number")
    return round(n * RATE)


def stamp(value):
    ms = round(value * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


async def build(args):
    import edge_tts

    plan = json.loads(Path(args.plan).read_text(encoding="utf-8-sig"))
    entries = plan.get("segments", [])
    if not entries or any(not isinstance(s, dict) or not isinstance(s.get("text"), str)
                          or not s["text"].strip() for s in entries):
        raise ValueError("segments must contain nonempty text strings")
    lead = seconds(plan.get("lead", 0.14), "lead")
    tail = seconds(plan.get("tail", 0.8), "tail")
    gaps = [seconds(s.get("gap", 0.13), "gap") for s in entries]
    if args.music and not Path(args.music).is_file():
        raise ValueError("Local music file not found")
    if not math.isfinite(args.music_gain) or not 0 <= args.music_gain <= 1:
        raise ValueError("music-gain must be between 0 and 1")
    out = Path(args.out).resolve()
    if out.exists() and any(out.iterdir()):
        raise ValueError("Use an empty output directory for each run")
    out.mkdir(parents=True, exist_ok=True)
    voice = plan.get("voice", "zh-CN-YunxiNeural")
    rate = plan.get("rate", "+12%")
    pitch = plan.get("pitch", "-2Hz")
    segments = []
    paths = []
    cursor = lead
    for i, (entry, gap) in enumerate(zip(entries, gaps)):
        text = entry["text"].strip()
        mp3 = out / f"sentence-{i + 1:03}.mp3"
        pcm = out / f"sentence-{i + 1:03}.wav"
        print(f"Synthesizing sentence {i + 1}/{len(entries)}", flush=True)
        await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(str(mp3))
        if not mp3.is_file() or mp3.stat().st_size == 0:
            raise RuntimeError("TTS returned no audio")
        run([args.ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(mp3),
             "-af", "afade=t=in:d=0.03,areverse,afade=t=in:d=0.03,areverse",
             "-ar", str(RATE), "-ac", str(CHANNELS), "-c:a", "pcm_s16le", str(pcm)])
        with wave.open(str(pcm), "rb") as wav:
            frames = wav.getnframes()
        if frames <= 0:
            raise RuntimeError("Decoded speech has no samples")
        segments.append({"id": i + 1, "text": text, "start": cursor / RATE,
                         "end": (cursor + frames) / RATE, "duration": frames / RATE})
        paths.append((pcm, gap))
        cursor += frames + gap
    total = cursor + tail
    dry = out / "narration.wav"
    silence = lambda n: bytes(n * CHANNELS * 2)
    with wave.open(str(dry), "wb") as target:
        target.setparams((CHANNELS, 2, RATE, 0, "NONE", "not compressed"))
        target.writeframes(silence(lead))
        for pcm, gap in paths:
            with wave.open(str(pcm), "rb") as source:
                target.writeframes(source.readframes(source.getnframes()))
            target.writeframes(silence(gap))
        target.writeframes(silence(tail))
    duration = total / RATE
    track = out / "track.wav"
    normalize = "loudnorm=I=-16:TP=-1.5:LRA=11"
    command = [args.ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(dry)]
    if args.music:
        command += ["-stream_loop", "-1", "-i", str(Path(args.music).resolve()),
                    "-filter_complex",
                    f"[0:a]asplit=2[voice][control];"
                    f"[1:a]atrim=duration={duration:.9f},asetpts=PTS-STARTPTS,"
                    f"volume={args.music_gain},afade=t=out:st={max(0, duration-0.5):.9f}:d=0.5[music];"
                    "[music][control]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=200[bed];"
                    f"[voice][bed]amix=inputs=2:duration=first:normalize=0,{normalize}[mix]",
                    "-map", "[mix]"]
    else:
        command += ["-af", normalize]
    command += ["-ar", str(RATE), "-ac", str(CHANNELS), "-c:a", "pcm_s16le", str(track)]
    run(command)
    with wave.open(str(track), "rb") as wav:
        final_duration = wav.getnframes() / wav.getframerate()
    if abs(final_duration - duration) > 0.05:
        raise RuntimeError("Mix changed the planned duration; inspect the audio before export")
    manifest = {"voice": voice, "rate": rate, "pitch": pitch, "sampleRate": RATE,
                "duration": final_duration, "segments": segments, "audio": str(track)}
    (out / "timeline.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    captions = "\n\n".join(f'{s["id"]}\n{stamp(s["start"])} --> {stamp(s["end"])}\n{s["text"]}'
                           for s in segments)
    (out / "captions.srt").write_text(captions + "\n", encoding="utf-8")
    print(f"Wrote {track} ({final_duration:.3f} s), timeline.json and captions.srt", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", help="JSON containing voice settings and sentence segments")
    parser.add_argument("--out", required=True, help="Empty output directory")
    parser.add_argument("--music", help="Optional local music, looped and ducked under speech")
    parser.add_argument("--music-gain", type=float, default=0.16)
    parser.add_argument("--ffmpeg", default=os.environ.get("FFMPEG_PATH", "ffmpeg"))
    asyncio.run(build(parser.parse_args()))
