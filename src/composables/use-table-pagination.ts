import { nextTick, ref } from 'vue';

interface UseTablePaginationOptions {
  /**
   * Called after `currentPage` is updated — use it to fetch the page from the
   * server. Omit for client-side pagination where a computed slice reacts to
   * `currentPage` on its own.
   */
  onPageChange?: (page: number) => Promise<void> | void;
  /**
   * Extra "already on this page" condition, combined (AND) with the built-in
   * `page === currentPage` check. Server-side tables use this to also compare
   * the fetched page so a pending fetch is not skipped.
   */
  isSamePage?: (page: number) => boolean;
}

/**
 * Shared pagination behavior for the admin manager tables: tracks the current
 * page, keeps the pagination control anchored in the viewport while the rows
 * change, and exposes a single `handlePageChange` handler for `BasePagination`.
 *
 * Client-side example: `useTablePagination()` — the paginated computed reacts
 * to `currentPage`.
 *
 * Server-side example:
 * `useTablePagination({ onPageChange: load, isSamePage: (p) => p === currentPage.value && p === pagination.value.page })`
 */
export function useTablePagination(options: UseTablePaginationOptions = {}) {
  const currentPage = ref(1);
  const paginationRef = ref<HTMLElement | null>(null);

  async function preservePaginationPosition(update: () => Promise<void> | void): Promise<void> {
    const anchorTop =
      typeof window !== 'undefined' ? paginationRef.value?.getBoundingClientRect().top : undefined;

    await update();
    await nextTick();

    if (typeof window === 'undefined' || anchorTop === undefined || !paginationRef.value) {
      return;
    }

    const nextTop = paginationRef.value.getBoundingClientRect().top;
    if (Math.abs(nextTop - anchorTop) < 1) {
      return;
    }

    window.scrollBy({ top: nextTop - anchorTop, behavior: 'auto' });
  }

  async function handlePageChange(page: number): Promise<void> {
    const samePage =
      page === currentPage.value && (options.isSamePage ? options.isSamePage(page) : true);
    if (samePage) {
      return;
    }

    await preservePaginationPosition(async () => {
      currentPage.value = page;
      await options.onPageChange?.(page);
    });
  }

  return { currentPage, paginationRef, preservePaginationPosition, handlePageChange };
}
