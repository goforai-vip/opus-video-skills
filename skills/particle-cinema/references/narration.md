# Narrated particle films

For a spectacular short film with narration, design a visual story around what the voice explains. A useful
direction is a near-black stage, warm off-white/orange highlights, strong type and a restrained warm halo.
Use particles to ignite the opening, transform an idea or reveal the final brand. Pick the necessary fields;
the bundled seven-effect, silent demo is an engine sample rather than a required final format.

If the film is mostly bold typography, code windows and explanatory diagrams, use `kinetic-reel` when it is
available. This template is a particle renderer; those editorial layouts require implementation, not a palette
setting. Avoid presenting a particle-only export as a recreation of a typography-led showreel.

Prepare fresh, concise speech, synthesize it before finalizing shot lengths, then align `particles/config.js`
to its actual intervals. The bundled `audio/narrate.py` supports sentence-by-sentence synthesis, sample-based
timings, sentence-level captions and optional music ducking. It uses [edge-tts](https://github.com/rany2/edge-tts)
with Chinese baseline `zh-CN-YunxiNeural`, rate `+12%`, pitch `-2Hz`, and default TTS volume. Follow the user's
confirmed preference; explicit voice choices override the baseline.

Create a local `narration.json` with your actual script:

```json
{
  "voice": "zh-CN-YunxiNeural", "rate": "+12%", "pitch": "-2Hz",
  "lead": 0.14, "tail": 0.8,
  "segments": [
    {"text": "画面先聚拢，再揭示主题。", "gap": 0.13},
    {"text": "让每一次变化，都推进这个故事。", "gap": 0.13}
  ]
}
```

```bash
python -m pip install edge-tts
python audio/narrate.py narration.json --out=out/voice-v1
# Optional local music; voice remains the focus:
python audio/narrate.py narration.json --out=out/mix-v1 --music=assets/music.m4a
```

The online TTS service receives the script text, not the reference video. Use a fresh output directory for
each run. The script stops on failure and never substitutes a voice. `timeline.json` records actual sentence
starts, ends and final duration; `captions.srt` is sentence-level, not word-level transcription. The final
48 kHz stereo `track.wav` includes the selected pauses and closing tail; music gain is an adjustable starting
point, not a guarantee of intelligibility for every source.

Use the measured intervals to set cues and `duration`; hold a mark or allow camera travel while the thought
finishes. Add captions in the final layout if useful; generating SRT does not burn it into this template.
Set `audio: 'out/voice-v1/track.wav'` or pass `--audio=out/voice-v1/track.wav` when rendering. The renderer uses
`-shortest`, so a shorter track can truncate the film. Match the timeline duration to the track, or explicitly
pad it for a longer visual landing. Pass the same `--fps` for frame export and encoding; 60 fps is an option
for fluid short reels when the GPU budget permits it.

Review real transitions and a complete audio/video preview. Check pronunciation, intelligibility over music,
readability, clipped glow and the final hold. If listening is unavailable, disclose that limit. Check audio
presence, resolution and duration with ffprobe. Respect any supplied reference's motion character while
redesigning the shots for the new subject; neither its branding nor its exact sequence is a default.
