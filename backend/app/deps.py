import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import Role, Student, Teacher, User
from .security import decode_token
import time
from collections import defaultdict, deque
from typing import Optional, Literal

from fastapi import Request

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(token)
        user = db.get(User, int(payload["sub"]))
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    return user


def require_roles(*roles: Role):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't have permission for this action")
        return user
    return checker


def current_student(user: User = Depends(require_roles(Role.student)), db: Session = Depends(get_db)) -> Student:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        raise HTTPException(404, "Student profile not found")
    return student


def staff_profile(user: User, db: Session) -> Teacher | None:
    return db.query(Teacher).filter(Teacher.user_id == user.id).first()

# ---- tiny in-memory limiter for public forms (use Redis in a real deployment) ----


_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(name: str, limit: int = 20, window: int = 3600):
    def checker(request: Request):
        key = f"{name}:{request.client.host if request.client else 'x'}"
        q, now = _hits[key], time.time()
        while q and now - q[0] > window:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests. Please try again later.")
        q.append(now)
    return checker