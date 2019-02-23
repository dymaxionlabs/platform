from django import template
from terra import settings

register = template.Library()


@register.simple_tag
def webclient_url():
    return settings.WEBCLIENT_URL