import { useEffect, useMemo, useState } from "react";
import type { TypingSession } from "@/store/history";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    ArrowUpDown,
    BarChart3,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type HistoryTableProps = {
    sessions: TypingSession[];
};

const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    if (isToday) return `Today, ${timeStr}`;

    const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    return `${dateStr}, ${timeStr}`;
};

const formatDuration = (seconds: number): string => {
    const rounded = Number(seconds.toFixed(1));
    if (rounded < 60) return `${rounded}s`;
    const mins = Math.floor(rounded / 60);
    const secs = Number((rounded % 60).toFixed(1));
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

const formatMode = (mode: string) => {
    if (mode === "time") return "Time";
    if (mode === "words") return "Words";
    if (mode === "quotes") return "Quotes";
    return mode;
};

const wpmTone = (wpm: number) => {
    if (wpm >= 80) return "elite";
    if (wpm >= 60) return "fast";
    if (wpm >= 40) return "steady";
    return "slow";
};

const accuracyTone = (accuracy: number) => {
    if (accuracy >= 96) return "high";
    if (accuracy >= 80) return "mid";
    return "low";
};

const columnHelper = createColumnHelper<TypingSession>();

const HistoryTable = ({ sessions }: HistoryTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([
        { id: "timestamp", desc: true },
    ]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const bestWpm = useMemo(
        () => (sessions.length ? Math.max(...sessions.map((s) => s.wpm)) : 0),
        [sessions],
    );

    const columns = useMemo(
        () => [
            columnHelper.accessor("timestamp", {
                header: "Date",
                cell: (info) => formatDate(info.getValue()),
                sortingFn: "basic",
            }),
            columnHelper.accessor("mode", {
                header: "Mode",
                cell: (info) => (
                    <span className={`history-mode history-mode--${info.getValue()}`}>
                        {formatMode(info.getValue())}
                    </span>
                ),
            }),
            columnHelper.accessor("wpm", {
                header: "WPM",
                cell: (info) => {
                    const wpm = info.getValue();
                    const isBest = wpm === bestWpm && bestWpm > 0;
                    return (
                        <span
                            className={`history-metric history-wpm history-wpm--${wpmTone(wpm)}${isBest ? " is-best" : ""}`}
                            title={isBest ? "Best WPM in this range" : undefined}
                        >
                            {wpm}
                            {isBest && <span className="history-best-tag">best</span>}
                        </span>
                    );
                },
            }),
            columnHelper.accessor("cpm", {
                header: "CPM",
                cell: (info) => (
                    <span className="history-metric history-cpm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("accuracy", {
                header: "Acc",
                cell: (info) => {
                    const accuracy = info.getValue();
                    return (
                        <span
                            className={`history-metric history-accuracy history-accuracy--${accuracyTone(accuracy)}`}
                        >
                            {accuracy}%
                        </span>
                    );
                },
            }),
            columnHelper.accessor("errors", {
                header: "Errors",
                cell: (info) => {
                    const errors = info.getValue();
                    return (
                        <span
                            className={`history-metric history-errors${errors > 0 ? " has-errors" : ""}`}
                        >
                            {errors}
                        </span>
                    );
                },
            }),
            columnHelper.accessor("duration", {
                header: "Time",
                cell: (info) => (
                    <span className="history-duration">
                        {formatDuration(info.getValue())}
                    </span>
                ),
            }),
        ],
        [bestWpm],
    );

    const table = useReactTable({
        data: sessions,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId: (row) => row.id || String(row.timestamp),
    });

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [sessions]);

    if (sessions.length === 0) {
        return (
            <div className="history-empty-state">
                <BarChart3
                    size={64}
                    strokeWidth={1}
                    className="empty-icon"
                    aria-hidden="true"
                />
                <div className="empty-text" id="empty-state-message">
                    No typing sessions found
                </div>
                <div className="empty-subtext">
                    Start typing to track your progress!
                </div>
                <a
                    href="/"
                    className="empty-cta"
                    aria-label="Start typing practice"
                    aria-describedby="empty-state-message"
                >
                    Go to Practice <ArrowRight size={16} aria-hidden="true" />
                </a>
            </div>
        );
    }

    const pageCount = table.getPageCount();
    const { pageIndex, pageSize } = table.getState().pagination;
    const sortedRows = table.getSortedRowModel().rows;
    const from = pageIndex * pageSize + 1;
    const to = Math.min((pageIndex + 1) * pageSize, sortedRows.length);

    const pageRows = table.getRowModel().rows;
    const pageAvgWpm =
        pageRows.length > 0
            ? Math.round(
                  pageRows.reduce((sum, row) => sum + row.original.wpm, 0) /
                      pageRows.length,
              )
            : 0;
    const pageAvgAcc =
        pageRows.length > 0
            ? Math.round(
                  pageRows.reduce(
                      (sum, row) => sum + row.original.accuracy,
                      0,
                  ) / pageRows.length,
              )
            : 0;

    return (
        <div className="history-datatable">
            <div className="history-datatable-toolbar">
                <div className="history-datatable-insight">
                    <span>
                        Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
                        <strong>{sessions.length}</strong> sessions
                    </span>
                    <span className="history-datatable-insight-sep" aria-hidden="true">
                        ·
                    </span>
                    <span>
                        Page avg{" "}
                        <strong className="history-insight-wpm">{pageAvgWpm} WPM</strong>
                        {" / "}
                        <strong className="history-insight-acc">{pageAvgAcc}%</strong>
                    </span>
                </div>

                <label className="history-page-size">
                    <span>Rows</span>
                    <select
                        value={pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        aria-label="Rows per page"
                    >
                        {[10, 25, 50].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const sorted = header.column.getIsSorted();
                                    const canSort = header.column.getCanSort();
                                    return (
                                        <th key={header.id} scope="col">
                                            {header.isPlaceholder ? null : (
                                                <button
                                                    type="button"
                                                    className={`history-th-btn${canSort ? " is-sortable" : ""}${sorted ? " is-sorted" : ""}`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    disabled={!canSort}
                                                >
                                                    <span>
                                                        {flexRender(
                                                            header.column.columnDef
                                                                .header,
                                                            header.getContext(),
                                                        )}
                                                    </span>
                                                    {canSort && (
                                                        <span
                                                            className="history-sort-icon"
                                                            aria-hidden="true"
                                                        >
                                                            {sorted === "asc" ? (
                                                                <ArrowUp size={14} />
                                                            ) : sorted === "desc" ? (
                                                                <ArrowDown size={14} />
                                                            ) : (
                                                                <ArrowUpDown size={14} />
                                                            )}
                                                        </span>
                                                    )}
                                                </button>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {pageRows.map((row) => {
                            const isBest =
                                row.original.wpm === bestWpm && bestWpm > 0;
                            return (
                                <tr
                                    key={row.id}
                                    className={`history-row${isBest ? " is-best-row" : ""}`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            data-label={String(
                                                cell.column.columnDef.header ?? "",
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="history-pagination">
                <button
                    type="button"
                    className="history-page-btn"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="First page"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    type="button"
                    className="history-page-btn"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="history-page-status">
                    Page <strong>{pageIndex + 1}</strong> of{" "}
                    <strong>{Math.max(pageCount, 1)}</strong>
                </span>
                <button
                    type="button"
                    className="history-page-btn"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    type="button"
                    className="history-page-btn"
                    onClick={() => table.setPageIndex(pageCount - 1)}
                    disabled={!table.getCanNextPage()}
                    aria-label="Last page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default HistoryTable;
