import os
import sys
import importlib

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def verify_redis_switch():
    print("Verifying Redis Configuration...")
    
    # 1. Test Stub Mode (Default)
    if "REDIS_URL" in os.environ:
        del os.environ["REDIS_URL"]
    
    # Force reload queue module to pick up env var content
    if "app.workers.queue" in sys.modules:
        importlib.reload(sys.modules["app.workers.queue"])
    
    from app.workers.queue import broker
    from dramatiq.brokers.stub import StubBroker
    from dramatiq.brokers.redis import RedisBroker
    
    if isinstance(broker, StubBroker):
        print("✅ Default mode uses StubBroker (Correct)")
    else:
        print(f"❌ Default mode failed: Expected StubBroker, got {type(broker)}")
        return False

    # 2. Test Redis Mode
    os.environ["REDIS_URL"] = "redis://localhost:6379/0"
    
    # Force reload again
    importlib.reload(sys.modules["app.workers.queue"])
    from app.workers.queue import broker as redis_broker
    
    if isinstance(redis_broker, RedisBroker):
        print("✅ Production mode uses RedisBroker (Correct)")
    else:
        print(f"❌ Production mode failed: Expected RedisBroker, got {type(redis_broker)}")
        return False
        
    print("All infra checks passed.")
    return True

if __name__ == "__main__":
    if verify_redis_switch():
        sys.exit(0)
    else:
        sys.exit(1)
