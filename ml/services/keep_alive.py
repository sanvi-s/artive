import logging
import os
import threading
import time
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

# Render free tier spins down after ~15 minutes with no inbound HTTP.
# Localhost pings do not count — only requests through the public URL.
PING_INTERVAL_SEC = 8 * 60


def public_base_url() -> str | None:
    explicit = os.getenv("ML_PUBLIC_URL", "").rstrip("/")
    if explicit:
        return explicit

    render_url = os.getenv("RENDER_EXTERNAL_URL", "").rstrip("/")
    if render_url:
        return render_url

    railway = os.getenv("RAILWAY_PUBLIC_DOMAIN", "").strip()
    if railway:
        if railway.startswith("http"):
            return railway.rstrip("/")
        return f"https://{railway.rstrip('/')}"

    return None


def start_keep_alive() -> None:
    base = public_base_url()
    if not base:
        logger.warning(
            "No public URL found (set ML_PUBLIC_URL or rely on RENDER_EXTERNAL_URL). "
            "Idle spin-down keep-alive is disabled."
        )
        return

    url = f"{base}/health"
    logger.info("ML keep-alive enabled → %s every %ss", url, PING_INTERVAL_SEC)

    def _loop() -> None:
        time.sleep(30)
        while True:
            try:
                req = urllib.request.Request(url, method="GET")
                with urllib.request.urlopen(req, timeout=30) as resp:
                    logger.info("Keep-alive ping %s → %s", url, resp.status)
            except urllib.error.URLError as exc:
                logger.warning("Keep-alive ping failed: %s", exc.reason)
            except Exception as exc:
                logger.warning("Keep-alive ping failed: %s", exc)
            time.sleep(PING_INTERVAL_SEC)

    threading.Thread(target=_loop, daemon=True, name="ml-keep-alive").start()
