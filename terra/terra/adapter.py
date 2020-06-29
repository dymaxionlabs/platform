from datetime import date

from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class DefaultAccountAdapterCustom(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        activate_url = '{base_url}/confirm-email?k={key}'.format(
            base_url=settings.WEBCLIENT_URL, key=context['key'])

        context = {
            **context,
            'activate_url': activate_url,
            'preview_text': '',
            'current_year': date.today().year,
            'company_name': settings.COMPANY_NAME,
            'mailing_address': settings.LIST_ADDRESS_HTML,
            'contact_email': settings.CONTACT_EMAIL,
        }

        msg = self.render_mail(template_prefix, email, context)
        msg.send()
