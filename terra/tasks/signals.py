import django.dispatch

# Sent when a new task is started
task_started = django.dispatch.Signal(providing_args=["task"])

# Sent when a task finished, either succesfully or not (failed or canceled)
task_finished = django.dispatch.Signal(providing_args=["task"])

# Sent when a task finishes with a FAILED status
task_failed = django.dispatch.Signal(providing_args=["task"])

# Sent when a task finishes with a CANCELED status (i.e. canceled by the user)
task_canceled = django.dispatch.Signal(providing_args=["task"])