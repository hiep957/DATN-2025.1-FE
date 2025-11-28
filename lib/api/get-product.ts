import api from "../axios"


export const getProductbyId = async (id: string) => {
    const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch product data');
    }
    const data = await res.json();
    return data;
}



export const getReviewsByProductId = async (productId: number) => {
    const response = await api.get(`/review/product/${productId}`);
    return response.data;
}


export const createReviewForProduct = async (productId: number, userId: number, comment: string, rating: number, imageUrls?: string[]) => {
    const response = await api.post(`/review/create-review`, {
        productId,
        userId,
        comment,
        rating,
        image_urls: imageUrls || [],
    });
    return response;
}

export const updateReviewStatus = async (reviewId: number, status: string) => {
    const response = await api.post(`/review/change-status-review`, {
        reviewId,
        status,
    });
    return response;
}