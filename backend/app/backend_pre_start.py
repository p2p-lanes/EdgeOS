from loguru import logger
from sqlalchemy import Engine
from sqlmodel import Session, select
from tenacity import retry, stop_after_attempt, wait_fixed

from app.core.db import engine

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=lambda retry_state: logger.info(
        "Starting call to '{}', attempt #{}",
        retry_state.fn.__name__,
        retry_state.attempt_number,
    ),
    after=lambda retry_state: logger.warning(
        "Finished call to '{}' after {} attempt(s)",
        retry_state.fn.__name__,
        retry_state.attempt_number,
    ),
)
def init(db_engine: Engine) -> None:
    try:
        with Session(db_engine) as session:
            # Try to create session to check if DB is awake
            session.exec(select(1))
    except Exception as e:
        logger.error(e)
        raise e


def main() -> None:
    logger.info("Initializing service")
    init(engine)
    logger.info("Service finished initializing")


if __name__ == "__main__":
    main()
