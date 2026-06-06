import os

import dramatiq
from dramatiq.brokers.redis import RedisBroker
from dramatiq.brokers.stub import StubBroker

redis_url = os.getenv("REDIS_URL")
if redis_url:
    broker = RedisBroker(url=redis_url)
else:
    broker = StubBroker()

# The bundled Prometheus middleware raises on every processed message in this
# dramatiq version, spamming worker logs without affecting results. Drop it.
broker.middleware = [
    m for m in broker.middleware if m.__class__.__name__ != "Prometheus"
]

dramatiq.set_broker(broker)


def is_async_broker() -> bool:
    """True when a real message broker (Redis) is configured.

    With the default in-memory StubBroker there is no separate worker
    process consuming the queue, so callers must run actors inline instead
    of relying on ``.send()``.
    """
    return isinstance(broker, RedisBroker)

