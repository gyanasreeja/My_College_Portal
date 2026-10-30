from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Registration, User
from ..schemas import LoginResponse
from ..security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username.lower()).first()
    if not user:
        reg = (db.query(Registration).filter(Registration.email == form.username.lower())
               .order_by(Registration.created_at.desc()).first())
        if reg and verify_password(form.password, reg.hashed_password):
            if reg.status == "pending":
                raise HTTPException(status.HTTP_403_FORBIDDEN, "Your registration is waiting for approval. Please check back later.")
            if reg.status == "rejected":
                raise HTTPException(status.HTTP_403_FORBIDDEN, "Your registration was not approved. Please contact the college office.")
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong email or password")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account is disabled")
    return LoginResponse(access_token=create_access_token(user.id, user.role.value), role=user.role)


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}