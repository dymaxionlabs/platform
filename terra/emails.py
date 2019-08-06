import os
from datetime import date

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import translation
from django.utils.translation import ugettext as _
from mailchimp3 import MailChimp


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
            '*|LIST:COMPANY|*': settings.COMPANY_NAME,
            '*|HTML:LIST_ADDRESS_HTML|*': settings.LIST_ADDRESS_HTML,
            '*|UNSUB|*': '%unsubscribe_url%',
            # Unused variables (for now):
            '*|IFNOT:ARCHIVE_PAGE|*': '',
            '*|LIST:DESCRIPTION|*': '',
            '*|END:IF|*': '',
        }


class EarlyAccessBetaEmail(Email):
    template_name = 'early_access_beta'

    @property
    def signup_url(self):
        return '{base_url}/signup?beta=1&email={email}'.format(
            base_url=settings.WEBCLIENT_URL, email= self.recipients[0])

    @property
    def subject(self):
        with translation.override(self.language_code):
            return _('validate your email')

    @property
    def template_params(self):
        return {**super().template_params, 'signup_url': self.signup_url}

    @property
    def mc_variables(self):
        return {**super().mc_variables, '*|SIGNUP_URL|*': self.signup_url}


class WelcomeEmail(Email):
    template_name = 'welcome'

    link = '{base_url}/login'.format(base_url=settings.WEBCLIENT_URL)

    def __init__(self, user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

    @property
    def subject(self):
        with translation.override(self.language_code):
            return _('your account is ready') % {'name': self.first_name}

    @property
    def template_params(self):
        return {
            **super().template_params,
            'first_name': self.first_name,
            'link': self.link,
        }

    @property
    def mc_variables(self):
        return {
            **super().mc_variables,
            '*|FNAME|*': self.first_name,
            '*|TEXT:LINK|*': self.link,
        }

    @property
    def first_name(self):
        return self.user.first_name or self.user.username


class TrainingStartedEmail(Email):
    template_name = 'training_started'

    def __init__(self, estimator, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.estimator = estimator

    @property
    def subject(self):
        with translation.override(self.language_code):
            return _('training of your model started')

    @property
    def template_params(self):
        return {
            **super().template_params,
            'name': self.estimator_name,
            'num_classes': self.num_classes,
        }

    @property
    def mc_variables(self):
        return {
            **super().mc_variables,
            '*|NAME|*': self.estimator_name,
            '*|NUM_CLASSES|*': self.num_classes,
        }

    @property
    def estimator_name(self):
        return self.estimator.name

    @property
    def num_classes(self):
        return len(self.estimator.classes)


class TrainingCompletedEmail(Email):
    template_name = 'training_completed'

    def __init__(self, estimator, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.estimator = estimator

    @property
    def subject(self):
        with translation.override(self.language_code):
            return _('training of your model completed')

    @property
    def template_params(self):
        return {
            **super().template_params,
            'name': self.estimator_name,
            'num_classes': self.num_classes,
        }

    @property
    def mc_variables(self):
        return {
            **super().mc_variables,
            '*|NAME|*': self.estimator_name,
            '*|NUM_CLASSES|*': self.num_classes,
        }

    @property
    def estimator_name(self):
        return self.estimator.name

    @property
    def num_classes(self):
        return len(self.estimator.classes)


def notify(subject, body='.'):
    send_mail(subject, body, 'damian@dymaxionlabs.com',
              ['monitor@dymaxionlabs.com'])
