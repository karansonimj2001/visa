"""Live frontend preview for Django Admin.

Shows a "View on site" link plus a live iframe of the actual frontend page,
so the owner can see exactly where each saved detail appears. Static
screenshots are deliberately NOT used — they go stale the moment content or
design changes, while this preview always shows the current site.
"""
from django.conf import settings
from django.utils.html import format_html


def preview_url_for(obj):
    """Return the frontend URL where this object is visible, or None."""
    get_url = getattr(obj, 'get_absolute_url', None)
    if callable(get_url):
        try:
            return get_url()
        except Exception:
            return None
    return None


def preview_iframe(url):
    """Link + live iframe HTML for any frontend URL."""
    return format_html(
        '<div style="margin:8px 0">'
        '<a href="{}" target="_blank" rel="noopener">Live page naye tab me kholo &#8599;</a>'
        '<br><span style="color:#666">Neeche LIVE website dikh rahi hai — jo save karoge wahi dikhega. Refresh karo agar purana dikhe.</span>'
        '<iframe src="{}" loading="lazy" title="Frontend live preview" '
        'style="width:100%;height:560px;border:1px solid #ddd;border-radius:8px;margin-top:8px;background:#fff"></iframe>'
        '</div>',
        url, url,
    )


def preview_field(obj, fallback_path='/'):
    """Readonly admin field: link + live iframe. Save the object first."""
    if not obj.pk:
        return 'Save karke phir ye preview dikhega. (Save first to see the live preview.)'
    url = preview_url_for(obj) or (settings.FRONTEND_URL + fallback_path)
    return preview_iframe(url)


def preview_fieldset():
    return ('Frontend Live Preview (yeh site pe kahan dikhega)', {'fields': ('frontend_preview',)})
