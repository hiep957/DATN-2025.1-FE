import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PaginationFilter({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    return (
        <div className="mt-2">
            <div className="flex items-center justify-center space-x-4">
                <button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-md bg-gray-200 disabled:opacity-50"
                    aria-label="Previous page"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>

                <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                </span>

                <button
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-md bg-gray-200 disabled:opacity-50"
                    aria-label="Next page"
                >
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
