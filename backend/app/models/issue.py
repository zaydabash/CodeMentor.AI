from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float
from app.models.base import Base


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    file_path = Column(String, nullable=False)
    language = Column(String, nullable=True)
    line_span = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    suggested_fix_summary = Column(Text, nullable=True)

