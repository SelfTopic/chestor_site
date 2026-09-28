from chestor_chat.security import PassSigner, hash_ip


def test_pass_roundtrip_and_expiry() -> None:
    signer = PassSigner("secret")
    issued = signer.issue(now=1000, ttl=60)
    assert signer.verify(issued.token, now=1030) == issued
    assert signer.verify(issued.token, now=1060) is None


def test_pass_tampering_is_rejected() -> None:
    signer = PassSigner("secret")
    issued = signer.issue(now=1000, ttl=60)
    pass_id, expires, signature = issued.token.split(".")
    assert signer.verify(f"{pass_id}.{int(expires) + 9999}.{signature}", now=1000) is None
    assert signer.verify(f"other.{expires}.{signature}", now=1000) is None
    assert PassSigner("другой").verify(issued.token, now=1000) is None
    for junk in (None, "", "a.b", "a.b.c.d", "a.xx.c"):
        assert signer.verify(junk, now=1000) is None


def test_ip_is_hashed_with_salt() -> None:
    assert hash_ip("1.2.3.4", "s1") != hash_ip("1.2.3.4", "s2")
    assert "1.2.3.4" not in hash_ip("1.2.3.4", "s1")
