import os
import dramatiq
from dramatiq.brokers.stub import StubBroker
from dramatiq.brokers.redis import RedisBroker

redis_url = os.getenv("REDIS_URL")
if redis_url:
    broker = RedisBroker(url=redis_url)
else:
    broker = StubBroker()

dramatiq.set_broker(broker)

