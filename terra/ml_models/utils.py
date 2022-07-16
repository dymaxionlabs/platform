from django.conf import settings
import time
from requests import request


def wait_for_lf_exec(
    execution_id: str
    ):
    '''
    Returns the .

            Parameters:
                    a (int): A decimal integer
                    b (int): Another decimal integer

            Returns:
                    binary_sum (str): Binary string of the sum of a and b
    '''
    exec_completed = False
    while not exec_completed:
        time.sleep(5)
        execution_log_url = f"{settings.LABFUNCTIONS_URL}/v1/history/task/{execution_id}"
        is_completed_response = request.get(execution_log_url)
        exec_completed = is_completed_response.json().get("status") == "complete"
        if exec_completed and is_completed_response.json().get["error"]:
            raise Exception
        return is_completed_response