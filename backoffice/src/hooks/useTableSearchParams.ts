import { useNavigate } from "@tanstack/react-router"
import type { SortingState } from "@tanstack/react-table"
import { useCallback, useMemo } from "react"

export interface TableSearchParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const defaultTableSearch: Required<TableSearchParams> = {
  page: 0,
  pageSize: 25,
  search: "",
  sortBy: "",
  sortOrder: "desc",
}

export function validateTableSearch(
  raw: Record<string, unknown>,
): TableSearchParams {
  return {
    page: typeof raw.page === "number" && raw.page >= 0 ? raw.page : 0,
    pageSize:
      typeof raw.pageSize === "number" &&
      [10, 25, 50, 100].includes(raw.pageSize)
        ? raw.pageSize
        : 25,
    search: typeof raw.search === "string" ? raw.search : "",
    sortBy: typeof raw.sortBy === "string" ? raw.sortBy : "",
    sortOrder:
      raw.sortOrder === "asc" || raw.sortOrder === "desc"
        ? raw.sortOrder
        : "desc",
  }
}

export function useTableSearchParams(params: TableSearchParams, from: string) {
  const navigate = useNavigate()

  const page = params.page ?? 0
  const pageSize = params.pageSize ?? 25
  const search = params.search ?? ""
  const sortBy = params.sortBy ?? ""
  const sortOrder = params.sortOrder ?? "desc"

  const pagination = { pageIndex: page, pageSize }

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []),
    [sortBy, sortOrder],
  )

  const setSearch = useCallback(
    (value: string) => {
      navigate({
        to: from,
        search: (prev: TableSearchParams) => ({
          ...prev,
          search: value || undefined,
          page: 0,
        }),
        replace: true,
      })
    },
    [navigate, from],
  )

  const setPagination = useCallback(
    (pag: { pageIndex: number; pageSize: number }) => {
      navigate({
        to: from,
        search: (prev: TableSearchParams) => ({
          ...prev,
          page: pag.pageIndex || undefined,
          pageSize: pag.pageSize === 25 ? undefined : pag.pageSize,
        }),
        replace: true,
      })
    },
    [navigate, from],
  )

  const setSorting = useCallback(
    (sortingState: SortingState) => {
      const col = sortingState[0]
      navigate({
        to: from,
        search: (prev: TableSearchParams) => ({
          ...prev,
          sortBy: col?.id || undefined,
          sortOrder: col
            ? col.desc
              ? ("desc" as const)
              : ("asc" as const)
            : undefined,
          page: 0,
        }),
        replace: true,
      })
    },
    [navigate, from],
  )

  return {
    search,
    pagination,
    sorting,
    sortBy,
    sortOrder,
    setSearch,
    setPagination,
    setSorting,
  }
}
