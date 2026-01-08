/**
 * Gửi nhiều file lên server và trả về một mảng các URL.
 * @param files Danh sách file người dùng chọn.
 * @returns Promise chứa một mảng các URL ảnh.
 */
import { BASE_URL } from "@/lib/axios";
export const uploadMultipleFilesApi = async (files: File[]): Promise<string[]> => {
    // 1. Tạo FormData
    const formData = new FormData();
    files.forEach(file => {
        // 'files' là key mà server của bạn đang lắng nghe, hãy thay đổi nếu cần
        formData.append('files', file); 
    });

    try {
        // 2. Gọi API của bạn, thay thế '/api/upload' bằng endpoint thật
        const response = await fetch(`${BASE_URL}/upload/images`, {
            method: 'POST',
            body: formData,
            // Lưu ý: không cần set header 'Content-Type', trình duyệt sẽ tự làm khi có FormData
        });

        if (!response.ok) {
            throw new Error('Upload request failed');
        }

        const result = await response.json();

        // 3. Xử lý JSON response để lấy ra mảng URL
        // result.data là một object: { "0": { url: "..." }, "1": { url: "..." } }
        // Chúng ta cần chuyển nó thành mảng: [ "...", "..." ]
        if (result && result.data) {
            const urls = Object.values(result.data).map((item: any) => item.url);
            console.log("Uploaded file URLs:", urls);
            return urls;
        }

        return []; // Trả về mảng rỗng nếu không có data

    } catch (error) {
        console.error("Error uploading files:", error);
        // Ném lỗi ra để logic trong component có thể bắt lại
        throw error;
    }
};


export const uploadSingleFileApi = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch(`${BASE_URL}/upload/image`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Upload request failed');
        }
        const result = await response.json();

        if (result && result.data) {
            const url = result.data.url;
            console.log("Uploaded file URL:", url);
            return url;
        }
        return '';
    } catch (error) {

        console.error("Error uploading file:", error);
        throw error;
    }
};
