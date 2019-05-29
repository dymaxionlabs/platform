import os

from django.core.mail import send_mail
from django.template.loader import render_to_string
from datetime import date
from django.utils.translation import ugettext_lazy as _
from mailchimp3 import MailChimp

from terra import settings


class Email:
    from_email = settings.DEFAULT_FROM_EMAIL
    subject = None
    template_name = 'basic'
    preview_text = ''

    templates_basedir = os.path.join(settings.BASE_DIR, 'templates')

    def __init__(self, recipients, language_code='en'):
        self.recipients = recipients
        self.language_code = language_code

    def send_mail(self):
        send_mail(self.subject,
                  self.body,
                  self.from_email,
                  self.recipients,
                  html_message=self.html_body)

    @property
    def body(self):
        return render_to_string(self.body_template, self.template_params)

    @property
    def html_body(self):
        return self._reformat_mailchimp_template(
            render_to_string(self.htmlbody_template, self.template_params))

    @property
    def body_template(self):
        return os.path.join(
            self.templates_basedir,
            '{name}.{lc}.txt'.format(name=self.template_name,
                                     lc=self.language_code))

    @property
    def htmlbody_template(self):
        return os.path.join(
            self.templates_basedir,
            '{name}.{lc}.html'.format(name=self.template_name,
                                      lc=self.language_code))

    @property
    def template_params(self):
        return {}

    def _reformat_mailchimp_template(self, html):
        """
        Replaces MailChimp variables for Django template variables, and do
        some post-processing.

        """
        for var, newvar in self.mc_variables.items():
            html = html.replace(str(var), str(newvar))
        return html

    @property
    def mc_variables(self):
        return {
            '*|MC:SUBJECT|*': self.subject,
            '*|MC_PREVIEW_TEXT|*': self.preview_text,
            '*|CURRENT_YEAR|*': date.today().year,
            '*|LIST:COMPANY|*': 'Dymaxion Labs',
            '*|UNSUB|*': '%unsubscribe_url%',
        }


class EarlyAccessBetaEmail(Email):
    template_name = 'early_access_beta'
    subject = _('Validá tu correo')

    signup_url = '{base_url}/signup?beta=1'.format(
        base_url=settings.WEBCLIENT_URL)

    @property
    def mc_variables(self):
        return {**super().mc_variables, '*|SIGNUP_URL|*': self.signup_url}
