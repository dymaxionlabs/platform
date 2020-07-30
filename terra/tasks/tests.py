from unittest.mock import patch

from django.test import TestCase

from projects.tests import create_some_project
from tasks import states
from tasks.models import Task
from terra.tests import create_some_user


class TaskTestCase(TestCase):
    def setUp(self):
        self.user = create_some_user()
        self.project = create_some_project(owner=self.user)

    def test_new_tasks_are_pending(self):
        task = Task.objects.create(project=self.project)
        self.assertIsInstance(task, Task)
        self.assertEqual(task.state, states.PENDING)
        self.assertIsNotNone(task.created_at)
        self.assertIsNone(task.finished_at)

    def test_artifacts_url_returns_gcs_path(self):
        task = Task.objects.create(project=self.project)
        self.assertTrue(task.artifacts_url.startswith('gs://'))

    @patch("tasks.models.signals")
    @patch("tasks.models.django_rq")
    def test_start_enqueues_job(self, django_rq_mock, signals_mock):
        task = Task.objects.create(project=self.project)
        self.assertTrue(task.start())
        self.assertEqual(task.state, states.STARTED)
        django_rq_mock.enqueue.assert_called_once_with(task.name, task.id,
                                                       task.args, task.kwargs)
        signals_mock.task_started.send.assert_called_once_with(sender=Task,
                                                               task=task)

    def test_cant_start_task_if_not_pending(self):
        task = Task.objects.create(project=self.project)
        task.state = states.STARTED
        self.assertFalse(task.start())

    def test_update_status(self):
        task = Task.objects.create(project=self.project)
        self.assertIsNone(task.status)

        task.update_status('foobar')
        self.assertEqual(task.status, 'foobar')

    @patch("tasks.models.signals")
    @patch("tasks.models.django_rq")
    def test_mark_as_finished(self, django_rq_mock, signals_mock):
        task = Task.objects.create(project=self.project)
        task.start()
        self.assertEqual(task.state, states.STARTED)
        self.assertIsNone(task.finished_at)

        task.mark_as_finished()
        self.assertEqual(task.state, states.FINISHED)
        self.assertIsNotNone(task.finished_at)
        signals_mock.task_finished.send.assert_called_once_with(sender=Task,
                                                                task=task)

    @patch("tasks.models.signals")
    @patch("tasks.models.django_rq")
    def test_mark_as_failed(self, django_rq_mock, signals_mock):
        task = Task.objects.create(project=self.project)
        task.start()
        self.assertEqual(task.state, states.STARTED)
        self.assertIsNone(task.finished_at)

        task.mark_as_failed()
        self.assertEqual(task.state, states.FAILED)
        self.assertIsNotNone(task.finished_at)
        signals_mock.task_failed.send.assert_called_once_with(sender=Task,
                                                              task=task)

    @patch("tasks.models.signals")
    @patch("tasks.models.django_rq")
    def test_mark_as_canceled(self, django_rq_mock, signals_mock):
        task = Task.objects.create(project=self.project)
        task.start()
        self.assertEqual(task.state, states.STARTED)
        self.assertIsNone(task.finished_at)

        task.mark_as_canceled()
        self.assertEqual(task.state, states.CANCELED)
        self.assertIsNotNone(task.finished_at)
        signals_mock.task_canceled.send.assert_called_once_with(sender=Task,
                                                                task=task)
