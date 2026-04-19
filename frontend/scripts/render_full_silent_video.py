from __future__ import annotations

import re
import subprocess
from pathlib import Path
from typing import Iterable

import imageio.v2 as imageio
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "tmp" / "video-capture"
SILENT_OUT = ASSETS / "madrid-refugio-full-silent-v9.mp4"
FINAL_OUT = ASSETS / "madrid-refugio-final-v9.mp4"
AUDIO = ASSETS / "ElevenLabs_2026-04-18T11_24_33_Eva - Natural & Narrative_pvc_sp100_s50_sb75_se0_b_m2.mp3"

WIDTH = 1920
HEIGHT = 1080
FPS = 25
BEAT_FRAMES = [137, 259, 182, 179, 339, 207, 317, 237, 130, 396, 307, 342, 290]


def load_font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


LABEL_FONT = load_font(28, bold=True)

# Phrase-by-phrase mapping. Only one short search beat at the start; then route, metrics and simulation dominate.
BEATS = [
    {
        "key": "human-problem",
        "clips": ["clip-home-hero.webm", "story-hero-live.png"],
        "frames": 137,
        "label": "Madrid y el calor extremo",
    },
    {
        "key": "unequal-routes",
        "clips": ["clip-search-example-1.webm"],
        "frames": 259,
        "label": "Mismo origen y destino, distinta experiencia t?rmica",
    },
    {
        "key": "vulnerable-person",
        "clips": ["story-how-it-works-live.png", "clip-home-hero.webm"],
        "frames": 182,
        "label": "Para una persona mayor, esa diferencia importa",
    },
    {
        "key": "product-introduction",
        "clips": ["clip-route-main.webm"],
        "frames": 179,
        "label": "Madrid Refugio",
    },
    {
        "key": "real-time-routing",
        "clips": ["clip-route-main.webm", "clip-route-main.webm"],
        "frames": 339,
        "label": "Ruta de confort t?rmico en tiempo real",
    },
    {
        "key": "not-just-a-map",
        "clips": ["clip-route-metrics-live.webm"],
        "frames": 207,
        "label": "No es solo un mapa",
    },
    {
        "key": "dynamic-shadow",
        "clips": ["clip-dynamic-shadow-live.webm"],
        "frames": 317,
        "label": "Sombra din?mica",
    },
    {
        "key": "solar-position",
        "clips": ["clip-dynamic-shadow-live.webm", "clip-route-metrics-live.webm"],
        "frames": 237,
        "label": "Posici?n solar y sombra sobre la calle",
    },
    {
        "key": "better-routing",
        "clips": ["clip-route-metrics-live.webm", "clip-route-main.webm"],
        "frames": 130,
        "label": "Comparativa de rutas y m?tricas",
    },
    {
        "key": "open-data-intro",
        "clips": ["clip-methodology-live.webm", "story-metodologia-live.png"],
        "frames": 396,
        "label": "7 datos abiertos del Ayuntamiento de Madrid",
    },
    {
        "key": "dataset-list",
        "clips": ["clip-methodology-live.webm", "clip-methodology-live.webm"],
        "frames": 307,
        "label": "Alturas, ?rboles, poblaci?n, aire, fuentes, equipamientos y l?mites",
    },
    {
        "key": "public-value",
        "clips": ["clip-diagnostic-live.webm"],
        "frames": 342,
        "label": "Vulnerabilidad y d?ficit de refugio",
    },
    {
        "key": "closing-impact",
        "clips": ["clip-route-main.webm", "clip-diagnostic-live.webm"],
        "frames": 290,
        "label": "Protecci?n clim?tica basada en datos abiertos",
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
TOTAL_BEAT_FRAMES = sum(beat["frames"] for beat in BEATS)


def fit_cover(img: Image.Image) -> Image.Image:
    src_w, src_h = img.size
    scale = max(WIDTH / src_w, HEIGHT / src_h)
    new_size = (int(src_w * scale), int(src_h * scale))
    resized = img.resize(new_size, Image.Resampling.LANCZOS)
    left = (resized.width - WIDTH) // 2
    top = (resized.height - HEIGHT) // 2
    return resized.crop((left, top, left + WIDTH, top + HEIGHT))


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int):
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        bbox = draw.textbbox((0, 0), candidate, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_top_label(draw: ImageDraw.ImageDraw, label: str) -> None:
    lines = wrap_text(draw, label, LABEL_FONT, WIDTH - 240)
    line_height = 42
    box_height = max(84, 44 + (line_height * len(lines)))
    box_right = min(WIDTH - 60, 1380)
    draw.rounded_rectangle((60, 50, box_right, 50 + box_height), radius=24, fill=(255, 255, 255, 228))
    y = 76
    for line in lines:
        draw.text((95, y), line, font=LABEL_FONT, fill=(20, 20, 20, 255))
        y += line_height


def add_overlay(frame: Image.Image, label: str | None = None) -> Image.Image:
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(0, 0, 0, 26))
    if label:
        draw_top_label(draw, label)
    return Image.alpha_composite(frame.convert("RGBA"), overlay)


def load_visual_asset(name: str) -> list[Image.Image]:
    asset_path = ASSETS / name
    if asset_path.suffix.lower() in {".png", ".jpg", ".jpeg"}:
        return [fit_cover(Image.open(asset_path).convert("RGB"))]
    reader = imageio.get_reader(str(asset_path))
    frames = [fit_cover(Image.fromarray(frame).convert("RGB")) for frame in reader]
    reader.close()
    return frames


def make_video_frames(beat: dict) -> list[np.ndarray]:
    captured: list[Image.Image] = []
    for clip_name in beat["clips"]:
        captured.extend(load_visual_asset(clip_name))
    if not captured:
        raise RuntimeError(f"No se pudieron leer fotogramas de {beat['clips']}")
    total_frames = beat["frames"]
    frames = []
    max_index = len(captured) - 1
    for i in range(total_frames):
        source_index = min(int(i * len(captured) / max(total_frames, 1)), max_index)
        composed = add_overlay(captured[source_index], beat.get("label"))
        frames.append(np.array(composed.convert("RGB")))
    return frames


def iter_beat_frames() -> Iterable[np.ndarray]:
    for beat in BEATS:
        yield from make_video_frames(beat)


def render_silent_video(out_path: Path = SILENT_OUT) -> Path:
    writer = imageio.get_writer(str(out_path), fps=FPS, codec="libx264", quality=8, pixelformat="yuv420p", macro_block_size=1)
    try:
        for frame in iter_beat_frames():
            writer.append_data(frame)
    finally:
        writer.close()
    return out_path


def mux_audio(video_path: Path, audio_path: Path = AUDIO, out_path: Path = FINAL_OUT) -> Path:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg, "-y", "-i", str(video_path), "-i", str(audio_path), "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-map", "0:v:0", "-map", "1:a:0", "-shortest", str(out_path)]
    subprocess.run(cmd, check=True)
    return out_path


def main() -> Path:
    if TOTAL_BEAT_FRAMES != 3322:
        raise RuntimeError(f"La linea de tiempo suma {TOTAL_BEAT_FRAMES} frames y debe sumar 3322")
    silent = render_silent_video()
    final = mux_audio(silent)
    print(final)
    return final


if __name__ == "__main__":
    main()
