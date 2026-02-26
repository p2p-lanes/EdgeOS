import uuid
from typing import Any

from sqlalchemy import or_
from sqlmodel import Session, col, func, select

from app.api.form_field.models import FormFields
from app.api.form_field.schemas import FormFieldCreate, FormFieldType, FormFieldUpdate
from app.api.popup.models import Popups
from app.api.shared.crud import BaseCRUD


class FormFieldsCRUD(BaseCRUD[FormFields, FormFieldCreate, FormFieldUpdate]):
    def __init__(self) -> None:
        super().__init__(FormFields)

    def get_by_name(
        self, session: Session, name: str, popup_id: uuid.UUID
    ) -> FormFields | None:
        statement = select(FormFields).where(
            FormFields.name == name, FormFields.popup_id == popup_id
        )
        return session.exec(statement).first()

    def find_by_popup(
        self,
        session: Session,
        popup_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
    ) -> tuple[list[FormFields], int]:
        statement = (
            select(FormFields)
            .where(FormFields.popup_id == popup_id)
            .order_by(FormFields.section, FormFields.position)  # type: ignore[arg-type]
        )

        # Apply text search if provided
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                or_(
                    col(FormFields.label).ilike(search_term),
                    col(FormFields.name).ilike(search_term),
                    col(FormFields.field_type).ilike(search_term),
                )
            )

        count_statement = select(func.count()).select_from(statement.subquery())
        total = session.exec(count_statement).one()

        statement = statement.offset(skip).limit(limit)
        results = list(session.exec(statement).all())

        return results, total

    def validate_custom_fields(
        self,
        session: Session,
        popup_id: uuid.UUID,
        custom_fields: dict[str, Any] | None,
    ) -> tuple[bool, list[str]]:
        """Validate custom_fields against form field definitions.

        Returns tuple of (is_valid, list_of_errors).
        """
        if custom_fields is None:
            custom_fields = {}

        # Get all form fields for this popup
        fields, _ = self.find_by_popup(session, popup_id, skip=0, limit=1000)
        field_map = {f.name: f for f in fields}

        errors: list[str] = []

        # Check required fields
        for field in fields:
            if field.required and field.name not in custom_fields:
                errors.append(f"Required field '{field.label}' is missing")

        # Validate provided values
        for field_name, value in custom_fields.items():
            if field_name not in field_map:
                # Unknown field - could be from an old schema, skip validation
                continue

            field = field_map[field_name]

            # Skip validation for None/empty values on non-required fields
            if value is None or value == "":
                if field.required:
                    errors.append(f"Required field '{field.label}' cannot be empty")
                continue

            # Type-specific validation
            field_type = field.field_type

            if field_type == FormFieldType.NUMBER.value:
                if not isinstance(value, int | float):
                    try:
                        float(value)
                    except (ValueError, TypeError):
                        errors.append(f"Field '{field.label}' must be a number")

            elif field_type == FormFieldType.BOOLEAN.value:
                if not isinstance(value, bool):
                    errors.append(f"Field '{field.label}' must be a boolean")

            elif field_type == FormFieldType.SELECT.value:
                if field.options and value not in field.options:
                    errors.append(
                        f"Field '{field.label}' must be one of: {', '.join(field.options)}"
                    )

            elif field_type == FormFieldType.MULTISELECT.value:
                if not isinstance(value, list):
                    errors.append(f"Field '{field.label}' must be a list")
                elif field.options:
                    invalid = [v for v in value if v not in field.options]
                    if invalid:
                        errors.append(
                            f"Field '{field.label}' contains invalid options: {', '.join(invalid)}"
                        )

            elif field_type == FormFieldType.EMAIL.value:
                if isinstance(value, str) and "@" not in value:
                    errors.append(f"Field '{field.label}' must be a valid email")

            elif field_type == FormFieldType.URL.value:
                if isinstance(value, str) and not (
                    value.startswith("http://") or value.startswith("https://")
                ):
                    errors.append(f"Field '{field.label}' must be a valid URL")

        return len(errors) == 0, errors

    def build_schema_for_popup(
        self, session: Session, popup_id: uuid.UUID
    ) -> dict[str, Any]:
        """Build a JSON Schema-like structure for a popup's form fields.

        This returns a schema that includes:
        - Base fields: human profile + application-level fields (source of truth)
        - Custom form fields defined for the popup
        Each base field includes a `target` indicating where the data lives:
        - "human": stored on the Human entity
        - "application": stored on the Application entity
        """
        fields, _ = self.find_by_popup(session, popup_id, skip=0, limit=1000)

        # Load popup for interpolating help_text
        popup = session.get(Popups, popup_id)
        popup_name = popup.name if popup else "the event"

        base_fields: dict[str, Any] = {
            # Human profile fields (target: "human")
            "first_name": {
                "type": "text",
                "label": "First name",
                "required": True,
                "section": "profile",
                "position": 0,
                "target": "human",
            },
            "last_name": {
                "type": "text",
                "label": "Last name",
                "required": True,
                "section": "profile",
                "position": 1,
                "target": "human",
            },
            "telegram": {
                "type": "text",
                "label": "Telegram username",
                "required": True,
                "section": "profile",
                "position": 2,
                "target": "human",
                "placeholder": "username",
                "help_text": f"The primary form of communication during {popup_name} will be a Telegram group, so create an account if you don't already have one",
            },
            "residence": {
                "type": "text",
                "label": "Usual location of residence",
                "required": False,
                "section": "profile",
                "position": 3,
                "target": "human",
                "placeholder": "City, State/Region, Country",
                "help_text": "Please format it like [City, State/Region, Country].",
            },
            "gender": {
                "type": "select",
                "label": "Gender",
                "required": True,
                "section": "profile",
                "position": 4,
                "target": "human",
                "options": ["Male", "Female", "Non-binary", "Specify"],
            },
            "age": {
                "type": "select",
                "label": "Age",
                "required": True,
                "section": "profile",
                "position": 5,
                "target": "human",
                "options": ["18-24", "25-34", "35-44", "45-54", "55+"],
            },
            "organization": {
                "type": "text",
                "label": "Organization",
                "required": False,
                "section": "profile",
                "position": 6,
                "target": "human",
            },
            "role": {
                "type": "text",
                "label": "Role",
                "required": False,
                "section": "profile",
                "position": 7,
                "target": "human",
            },
            # Application fields (target: "application")
            "referral": {
                "type": "text",
                "label": "Did anyone refer you?",
                "required": False,
                "section": "profile",
                "position": 8,
                "target": "application",
                "help_text": "List everyone who encouraged you to apply.",
            },
            "info_not_shared": {
                "type": "multiselect",
                "label": "Info I'm NOT willing to share with other attendees",
                "required": False,
                "section": "profile",
                "position": 9,
                "target": "application",
                "help_text": "We will make a directory to make it easier for attendees to coordinate",
                "options": [
                    "Email",
                    "Telegram",
                    "Organization",
                    "Role",
                    "Gender",
                    "Age",
                    "Residence",
                ],
            },
        }

        # Build custom fields schema
        custom_fields = {}
        for field in fields:
            custom_fields[field.name] = {
                "type": field.field_type,
                "label": field.label,
                "required": field.required,
                "section": field.section or None,
                "position": field.position,
            }
            if field.options:
                custom_fields[field.name]["options"] = field.options
            if field.placeholder:
                custom_fields[field.name]["placeholder"] = field.placeholder
            if field.help_text:
                custom_fields[field.name]["help_text"] = field.help_text

        sections = ["profile"]
        for f in custom_fields.values():
            if f["section"] and f["section"] not in sections:
                sections.append(f["section"])

        return {
            "base_fields": base_fields,
            "custom_fields": custom_fields,
            "sections": sections,
        }


form_fields_crud = FormFieldsCRUD()
