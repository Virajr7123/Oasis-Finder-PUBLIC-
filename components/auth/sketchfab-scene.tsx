"use client"

export default function SketchfabScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <div className="sketchfab-embed-wrapper w-full h-full">
        <iframe
          title="HUNYUAN 2.5 : TROPICAL ISLAND FROM IMAGE 250524"
          className="w-full h-full border-0"
          allowFullScreen
          mozAllowFullScreen={true}
          webkitAllowFullScreen={true}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src="https://sketchfab.com/models/4eea96eacef8404783a0e28210cd9311/embed?autostart=1&preload=1&transparent=1&ui_theme=dark&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&ui_watermark_link=0&ui_hint=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0"
        />
      </div>
    </div>
  )
}
