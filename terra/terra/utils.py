def slack_notify(text):
    from django.conf import settings

    if settings.SLACK_HOOK_URL:
        try:
            from requests import post
            post(settings.SLACK_HOOK_URL, json=dict(text=text))
        except Exception as err:
            print(f"An error occured when notifying to Slack: {err}")

