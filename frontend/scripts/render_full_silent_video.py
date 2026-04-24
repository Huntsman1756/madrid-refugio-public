from __future__ import annotations

import re
import subprocess
from pathlib import Path
from typing import Iterable

import imageio.v2 as imageio
import imageio_ffmpeg
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "tmp" / "video-capture"
SILENT_OUT = ASSETS / "madrid-refugio-full-silent-v10.mp4"
FINAL_OUT = ASSETS / "madrid-refugio-final-v10.mp4"
AUDIO = ASSETS / "ElevenLabs_2026-04-18T11_24_33_Eva - Natural & Narrative_pvc_sp100_s50_sb75_se0_b_m2.mp3"

WIDTH = 1920
HEIGHT = 1080
FPS = 25

# 132.88 s * 25 fps = 3322 frames
SECTIONS = [
    {
        "key": "home",
        "clips": ["clip-home-hero.webm", "story-hero-live.png"],
        "frames": 180,
    },
    {
        "key": "search",
        "clips": ["clip-search-example-1.webm"],
        "frames": 120,
    },
    {
        "key": "route-result",
        "clips": ["clip-route-main.webm"],
        "frames": 520,
    },
    {
        "key": "metrics",
        "clips": ["clip-route-metrics-live.webm"],
        "frames": 520,
    },
    {
        "key": "simulation",
        "clips": ["clip-dynamic-shadow-live.webm"],
        "frames": 620,
    },
    {
        "key": "methodology",
        "clips": ["clip-methodology-live.webm", "story-metodologia-live.png"],
        "frames": 420,
    },
    {
        "key": "diagnostic",
        "clips": ["clip-diagnostic-live.webm", "story-diagnostic-live.png"],
        "frames": 420,
    },
    {
        "key": "closing",
        "clips": ["clip-route-main.webm", "clip-diagnostic-live.webm"],
        "frames": 522,
    },
]


def get_media_duration_seconds(path: Path) -> float:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    result = subprocess.run([ffmpeg, "-hide_banner", "-i", str(path)], capture_output=True, text=True, check=False)
    match = re.search(r"Duration:\s+(\d+):(\d+):(\d+(?:\.\d+)?)", result.stderr)
    if not match:
        raise RuntimeError(f"No se pudo leer la duracion de {path}")
    hours = int(match.group(1))
    minutes = int(match.group(2))
    seconds = float(match.group(3))
    return hours * 3600 + minutes * 60 + seconds


AUDIO_DURATION_SECONDS = get_media_duration_seconds(AUDIO)
TOTAL_FRAMES = sum(section["frames"] for section in SECTIONS)


def fit_cover(img: Image.Image) -> Image.Image:
    src_w, src_h = img.size
    scale = max(WIDTH / src_w, HEIGHT / src_h)
    new_size = (int(src_w * scale), int(src_h * scale))
    resized = img.resize(new_size, Image.Resampling.LANCZOS)
    left = (resized.width - WIDTH) // 2
    top = (resized.height - HEIGHT) // 2
    return resized.crop((left, top, left + WIDTH, top + HEIGHT))


def load_visual_asset(name: str) -> list[Image.Image]:
    asset_path = ASSETS / name
    if asset_path.suffix.lower() in {".png", ".jpg", ".jpeg"}:
        return [fit_cover(Image.open(asset_path).convert("RGB"))]
    reader = imageio.get_reader(str(asset_path))
    frames = [fit_cover(Image.fromarray(frame).convert("RGB")) for frame in reader]
    reader.close()
    return frames


def make_section_frames(section: dict) -> list[np.ndarray]:
    captured: list[Image.Image] = []
    for clip_name in section["clips"]:
        captured.extend(load_visual_asset(clip_name))

    if not captured:
        raise RuntimeError(f"No se pudieron leer fotogramas de {section['clips']}")

    total_frames = section["frames"]
    max_index = len(captured) - 1
    frames: list[np.ndarray] = []
    for i in range(total_frames):
        source_index = min(int(i * len(captured) / max(total_frames, 1)), max_index)
        frames.append(np.array(captured[source_index]))
    return frames


def iter_section_frames() -> Iterable[np.ndarray]:
    for section in SECTIONS:
        yield from make_section_frames(section)


def render_silent_video(out_path: Path = SILENT_OUT) -> Path:
    writer = imageio.get_writer(
        str(out_path),
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
        macro_block_size=1,
    )
    try:
        for frame in iter_section_frames():
            writer.append_data(frame)
    finally:
        writer.close()
    return out_path


def mux_audio(video_path: Path, audio_path: Path = AUDIO, out_path: Path = FINAL_OUT) -> Path:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(video_path),
        "-i",
        str(audio_path),
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-shortest",
        str(out_path),
    ]
    subprocess.run(cmd, check=True)
    return out_path


def main() -> Path:
    if TOTAL_FRAMES != 3322:
        raise RuntimeError(f"La linea de tiempo suma {TOTAL_FRAMES} frames y debe sumar 3322")
    silent = render_silent_video()
    final = mux_audio(silent)
    print(final)
    return final


if __name__ == "__main__":
    main()
