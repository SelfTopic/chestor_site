import json
import logging
import random
from pathlib import Path
from typing import Protocol

from ghoul_quiz import GhoulQuizAPI, GhoulQuizError

from ..errors import QuizUnavailable
from ..models import Question

logger = logging.getLogger(__name__)


class QuestionSource(Protocol):
    name: str

    async def random_question(self) -> tuple[Question, str]: ...

    async def correct_answer(self, question_id: int) -> str: ...

    async def close(self) -> None: ...


class FixtureSource:
    name = "fixture"

    def __init__(self, path: Path, rng: random.Random | None = None) -> None:
        items = json.loads(path.read_text(encoding="utf-8"))
        self._questions = {
            int(item["id"]): Question(
                id=int(item["id"]),
                text=item["question"],
                options=tuple(item["answer_options"]),
                answer=item["answer"],
            )
            for item in items
        }
        self._rng = rng or random.Random()

    def has(self, question_id: int) -> bool:
        return question_id in self._questions

    async def random_question(self) -> tuple[Question, str]:
        return self._rng.choice(list(self._questions.values())), self.name

    async def correct_answer(self, question_id: int) -> str:
        question = self._questions.get(question_id)
        if question is None or question.answer is None:
            raise QuizUnavailable("Вопрос не найден")
        return question.answer

    async def close(self) -> None:
        return None


# Живые вопросы с chestor.site/api через сессию владельца; при сбое API — фикстура.
class GhoulQuizSource:
    name = "live"

    def __init__(self, api: GhoulQuizAPI, fallback: FixtureSource) -> None:
        self._api = api
        self._fallback = fallback
        self._answers: dict[int, str] = {}

    @classmethod
    def connect(
        cls, email: str, base_url: str, fallback: FixtureSource
    ) -> "GhoulQuizSource | None":
        api = GhoulQuizAPI(base_url=base_url)
        if not api.load_saved_token(email):
            logger.warning("Нет сохранённой сессии ghoul_quiz для %s: капча по фикстуре", email)
            return None
        return cls(api, fallback)

    async def random_question(self) -> tuple[Question, str]:
        try:
            raw = await self._api.get_random_question()
        except GhoulQuizError as exc:
            logger.warning("Ghoul Quiz API: %s; вопрос из фикстуры", exc)
            return await self._fallback.random_question()
        question = Question(id=raw.id, text=raw.question, options=tuple(raw.answer_options))
        return question, self.name

    async def correct_answer(self, question_id: int) -> str:
        if self._fallback.has(question_id):
            return await self._fallback.correct_answer(question_id)
        if question_id in self._answers:
            return self._answers[question_id]
        try:
            answer = await self._api.get_answer(question_id=question_id)
        except GhoulQuizError as exc:
            raise QuizUnavailable("Ghoul Quiz API не ответил") from exc
        self._answers[question_id] = answer.answer
        return answer.answer

    async def close(self) -> None:
        await self._api.close()
