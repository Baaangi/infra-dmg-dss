from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
import jwt
from app.models import User
from app.core.security import SECRET_KEY, ALGORITHM

# This forces the frontend to send tokens here:
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid JWT token")
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User account vanished")
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    """Blocks any user that is not an explicitly authorized Administrator."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Lacking administrative privileges")
    return current_user
