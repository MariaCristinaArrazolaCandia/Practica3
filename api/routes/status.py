from fastapi import APIRouter
from celery import Celery
from fastapi.responses import JSONResponse

router = APIRouter(tags=["status"])

# Tiene que coincidir con la config Celery del backend
celery_app = Celery(
    "backend_producer",
    broker="amqp://guest:guest@rabbitmq:5672//",
    backend="rpc://"
)

@router.get("/task-status/{task_id}")
def get_task_status(task_id: str):
    """
    Devuelve el estado de la tarea Celery y (si terminó)
    el resultado que devolvió el worker.
    """
    async_result = celery_app.AsyncResult(task_id)

    # async_result.state puede ser:
    # PENDING, STARTED, RETRY, FAILURE, SUCCESS
    state = async_result.state

    # async_result.result es:
    # - None si todavía no terminó
    # - dict con 'status': 'ok' ... si tu tarea retorna eso
    result_value = async_result.result if async_result.successful() else None

    return JSONResponse({
        "task_id": task_id,
        "state": state,
        "result": result_value
    })
