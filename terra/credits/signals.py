from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# from tasks.models import Task
# from tasks.signals import task_finished

from .models import LogEntry


@receiver(post_save, sender=User)
def add_initial_credit(sender, instance, created, **kwargs):
    if created:
        LogEntry.objects.create(user=instance,
                                kind='credit',
                                description='Initial credit',
                                value=10000)


# @receiver(task_finished, sender=Task)
# def add_training_prediction_entry(sender, task, **kwargs):
#     if task.name in [
#             Estimator.TRAINING_JOB_TASK, Estimator.PREDICTION_JOB_TASK
#     ]:
#         if task.name == Estimator.TRAINING_JOB_TASK:
#             kind = 'training-task'
#             description = 'Training task'
#         elif task.name == Estimator.PREDICTION_JOB_TASK:
#             kind = 'prediction-task'
#             description = 'Prediction task'
#         else:
#             kind = 'task'
#             description = 'Task'

#         user = task.project.owner

#         # Use real task duration to calculate cost
#         cost = LogEntry.calculate_task_cost(duration=task.duration)

#         LogEntry.objects.create(user=user,
#                                 kind=kind,
#                                 description=description,
#                                 value=-cost)
