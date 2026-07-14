# -*- coding: utf-8 -*-
from app.core.database import SessionLocal, engine
from app.models.models import Base, User, UserRole
from app.core.security import get_password_hash
import uuid

Base.metadata.create_all(bind=engine)
db = SessionLocal()
u = User(id=str(uuid.uuid4()), email='admin@tb.ng', full_name='Super Admin',
hashed_password=get_password_hash('Admin1234!'),
role=UserRole.SUPER_ADMIN, is_active=True)
db.add(u)
db.commit()
print('Admin created - email: admin@tb.ng  password: Admin1234!')
db.close()
