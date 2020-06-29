import os

import sentry_sdk
from sentry_sdk.integrations.rq import RqIntegration

if os.environ['SENTRY_DNS']:
    sentry_sdk.init(
        dsn=os.environ['SENTRY_DNS'], integrations=[RqIntegration()])
