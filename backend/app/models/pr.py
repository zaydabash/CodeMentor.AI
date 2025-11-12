from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.models.base import Base


class PR(Base):
    __tablename__ = "prs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    title = Column(String, nullable=False)
    description_md = Column(Text, nullable=False)
    risk_notes_md = Column(Text, nullable=True)
    test_plan_md = Column(Text, nullable=True)


class PRFileChange(Base):
    __tablename__ = "pr_file_changes"

    id = Column(Integer, primary_key=True, index=True)
    pr_id = Column(Integer, ForeignKey("prs.id"), nullable=False)
    file_path = Column(String, nullable=False)
    diff_unified = Column(Text, nullable=False)

