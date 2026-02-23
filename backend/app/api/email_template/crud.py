import uuid

from sqlmodel import Session, func, select

from app.api.email_template.models import EmailTemplates
from app.api.email_template.schemas import EmailTemplateCreate, EmailTemplateUpdate
from app.api.shared.crud import BaseCRUD


class EmailTemplateCRUD(
    BaseCRUD[EmailTemplates, EmailTemplateCreate, EmailTemplateUpdate]
):
    def __init__(self) -> None:
        super().__init__(EmailTemplates)

    def get_by_popup_and_type(
        self, session: Session, popup_id: uuid.UUID, template_type: str
    ) -> EmailTemplates | None:
        statement = select(EmailTemplates).where(
            EmailTemplates.popup_id == popup_id,
            EmailTemplates.template_type == template_type,
        )
        return session.exec(statement).first()

    def find_by_popup(
        self,
        session: Session,
        popup_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[EmailTemplates], int]:
        statement = select(EmailTemplates).where(EmailTemplates.popup_id == popup_id)

        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total

    def get_active_template(
        self, session: Session, popup_id: uuid.UUID, template_type: str
    ) -> EmailTemplates | None:
        statement = select(EmailTemplates).where(
            EmailTemplates.popup_id == popup_id,
            EmailTemplates.template_type == template_type,
            EmailTemplates.is_active == True,  # noqa: E712
        )
        return session.exec(statement).first()


email_template_crud = EmailTemplateCRUD()
