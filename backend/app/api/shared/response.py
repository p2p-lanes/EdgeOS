from typing import Annotated

from fastapi import Query
from pydantic import BaseModel

PaginationSkip = Annotated[int, Query(ge=0, description="Number of items to skip")]
PaginationLimit = Annotated[
    int, Query(ge=1, le=1000, description="Maximum number of items to return")
]


class Paging(BaseModel):
    limit: int
    offset: int
    total: int


class ListModel[T](BaseModel):
    results: list[T]
    paging: Paging


class GetOneModel[T](BaseModel):
    result: T
