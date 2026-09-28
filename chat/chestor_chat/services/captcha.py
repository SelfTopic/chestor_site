import random
import secrets
import time
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from ..errors import Banned, ChallengeExpired, RateLimited
from ..limits import Limits
from ..security import Pass, PassSigner
from ..storage import Storage
from .quiz import QuestionSource


@dataclass(frozen=True)
class Challenge:
    id: str
    question: str
    options: tuple[str, ...]
    source: str
    expires_in: int

    def to_json(self) -> dict[str, Any]:
        return {
            "challenge_id": self.id,
            "question": self.question,
            "options": list(self.options),
            "source": self.source,
            "expires_in": self.expires_in,
        }


@dataclass(frozen=True)
class Verdict:
    correct: bool
    answer: str
    pass_: Pass | None


class CaptchaService:
    def __init__(
        self,
        storage: Storage,
        source: QuestionSource,
        signer: PassSigner,
        limits: Limits,
        clock: Callable[[], float] = time.time,
        rng: random.Random | None = None,
    ) -> None:
        self._storage = storage
        self.source = source
        self._signer = signer
        self._limits = limits
        self._clock = clock
        self._rng = rng or random.Random()

    async def challenge(self, ip_hash: str) -> Challenge:
        # Лимит бережёт квоту Ghoul Quiz API: вопросы тянутся с сервера владельца.
        wait = await self._storage.hit(
            f"captcha_q:{ip_hash}", 3600, self._limits.captcha_questions_hourly, self._clock()
        )
        if wait is not None:
            raise RateLimited("Вопросы на этот час кончились", retry_after=round(wait))
        question, source = await self.source.random_question()
        options = list(question.options)
        self._rng.shuffle(options)
        challenge = Challenge(
            id=secrets.token_urlsafe(16),
            question=question.text,
            options=tuple(options),
            source=source,
            expires_in=self._limits.challenge_ttl,
        )
        await self._storage.put_challenge(
            challenge.id,
            {"question_id": question.id, "options": options},
            self._limits.challenge_ttl,
        )
        return challenge

    async def verify(self, challenge_id: str, choice: str, ip_hash: str) -> Verdict:
        now = self._clock()
        wait = await self._storage.hit(
            f"captcha_a:{ip_hash}",
            self._limits.captcha_attempts_window,
            self._limits.captcha_attempts,
            now,
        )
        if wait is not None:
            raise RateLimited("Слишком много попыток", retry_after=round(wait))
        data = await self._storage.take_challenge(challenge_id)
        if data is None or choice not in data["options"]:
            raise ChallengeExpired("Вопрос устарел, возьми новый")
        answer = await self.source.correct_answer(int(data["question_id"]))
        if choice != answer:
            return Verdict(correct=False, answer=answer, pass_=None)
        if await self._storage.banned([f"ip:{ip_hash}"], now):
            raise Banned("CCG внесла тебя в список")
        return Verdict(
            correct=True, answer=answer, pass_=self._signer.issue(now, self._limits.pass_ttl)
        )
