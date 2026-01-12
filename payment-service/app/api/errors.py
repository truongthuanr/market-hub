from starlette.responses import JSONResponse


def problem_detail(status: int, title: str, detail: str, code: str | None = None):
    payload = {
        "type": "about:blank",
        "title": title,
        "status": status,
        "detail": detail,
    }
    if code:
        payload["code"] = code
    return JSONResponse(payload, status_code=status)
