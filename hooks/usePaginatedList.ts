import { useCallback, useReducer } from "react";

export interface PaginatedResponse<T> {
  items: T[];
  total?: number;
  hasMore?: boolean;
}

export interface UsePaginatedListOptions<T, TFilters> {
  pageSize?: number;
  fetchPage: (page: number, filters: TFilters) => Promise<PaginatedResponse<T>>;
}

interface PaginationState<T> {
  items: T[];
  page: number;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

type PaginationAction<T> =
  | { type: "START_LOAD"; reset?: boolean }
  | { type: "SUCCESS"; items: T[]; total: number; hasMore: boolean; reset?: boolean }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

function paginationReducer<T>(
  state: PaginationState<T>,
  action: PaginationAction<T>,
): PaginationState<T> {
  switch (action.type) {
    case "START_LOAD":
      return {
        ...state,
        isLoading: action.reset ? true : state.isLoading,
        isLoadingMore: !action.reset ? true : state.isLoadingMore,
      };
    case "SUCCESS":
      return {
        ...state,
        items: action.reset ? action.items : [...state.items, ...action.items],
        total: action.total,
        hasMore: action.hasMore,
        page: action.reset ? 1 : state.page + 1,
        isLoading: false,
        isLoadingMore: false,
        error: null,
      };
    case "ERROR":
      return {
        ...state,
        error: action.error,
        isLoading: false,
        isLoadingMore: false,
      };
    case "RESET":
      return {
        items: [],
        page: 1,
        total: 0,
        hasMore: true,
        isLoading: true,
        isLoadingMore: false,
        error: null,
      };
    default:
      return state;
  }
}

export function usePaginatedList<T, TFilters = Record<string, unknown>>({
  pageSize = 12,
  fetchPage,
}: UsePaginatedListOptions<T, TFilters>) {
  const [state, dispatch] = useReducer(paginationReducer<T>, {
    items: [],
    page: 1,
    total: 0,
    hasMore: true,
    isLoading: true,
    isLoadingMore: false,
    error: null,
  });

  const loadPage = useCallback(
    async (pageNum = 1, reset = false, filters: TFilters) => {
      dispatch({ type: "START_LOAD", reset });
      try {
        const result = await fetchPage(pageNum, filters);
        const nextItems = result.items ?? [];
        const totalCount = result.total ?? 0;
        const nextHasMore =
          typeof result.hasMore === "boolean"
            ? result.hasMore
            : pageNum * pageSize < totalCount;

        dispatch({
          type: "SUCCESS",
          items: nextItems,
          total: totalCount,
          hasMore: nextHasMore,
          reset,
        });
      } catch (err: any) {
        console.error("Erreur loadPage:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors du chargement";
        dispatch({ type: "ERROR", error: errorMessage });
      }
    },
    [fetchPage, pageSize],
  );

  const loadMore = useCallback(
    (filters: TFilters) => {
      if (state.isLoadingMore || !state.hasMore) return;
      loadPage(state.page + 1, false, filters);
    },
    [state.page, state.isLoadingMore, state.hasMore, loadPage],
  );

  const reload = useCallback(
    (filters: TFilters, nextPage = 1) => {
      loadPage(nextPage, true, filters);
    },
    [loadPage],
  );

  return {
    items: state.items,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    page: state.page,
    hasMore: state.hasMore,
    total: state.total,
    loadPage,
    loadMore,
    reload,
  };
}
