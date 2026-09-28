class ChatError(Exception):
    code: str = "error"
    status: int = 400

    def __init__(
        self, message: str = "", *, retry_after: float | None = None, field: str | None = None
    ) -> None:
        super().__init__(message or self.code)
        self.message = message or self.code
        self.retry_after = retry_after
        self.field = field


class InvalidInput(ChatError):
    code = "invalid"
    status = 400


class CaptchaRequired(ChatError):
    code = "captcha_required"
    status = 401


class Banned(ChatError):
    code = "banned"
    status = 403


class SiteMuted(ChatError):
    code = "muted"
    status = 423


class RateLimited(ChatError):
    code = "rate_limited"
    status = 429


class QueueFull(ChatError):
    code = "queue_full"
    status = 503


class ChallengeExpired(ChatError):
    code = "challenge_expired"
    status = 410


class QuizUnavailable(ChatError):
    code = "quiz_unavailable"
    status = 503


class MediaNotFound(ChatError):
    code = "media_not_found"
    status = 404
