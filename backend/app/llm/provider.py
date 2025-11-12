import os
from abc import ABC, abstractmethod
from openai import OpenAI
from anthropic import Anthropic
import json


class LLMProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, temperature: float = 0.2, max_tokens: int = 6000) -> str:
        pass


class OpenAIProvider(LLMProvider):
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not set")
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4-turbo-preview"

    def complete(self, prompt: str, temperature: float = 0.2, max_tokens: int = 6000) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content


class AnthropicProvider(LLMProvider):
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-3-opus-20240229"

    def complete(self, prompt: str, temperature: float = 0.2, max_tokens: int = 6000) -> str:
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text


class LocalProvider(LLMProvider):
    def complete(self, prompt: str, temperature: float = 0.2, max_tokens: int = 6000) -> str:
        return json.dumps([
            {
                "category": "Code Smell",
                "severity": "med",
                "confidence": 0.7,
                "line_span": "1-10",
                "rationale": "Mock response for local provider",
                "summary": "Potential improvement",
                "suggested_fix_summary": "Refactor for clarity",
            }
        ])


def get_llm_provider() -> LLMProvider:
    provider_name = os.getenv("LLM_PROVIDER", "openai").lower()
    if provider_name == "openai":
        return OpenAIProvider()
    elif provider_name == "anthropic":
        return AnthropicProvider()
    elif provider_name == "local":
        return LocalProvider()
    else:
        raise ValueError(f"Unknown LLM provider: {provider_name}")

