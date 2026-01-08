import { Variant } from "@/app/admin/product/type";
import api from "../axios"
import { CartItemClient } from "@/store/useCartStore";
import { BASE_URL } from "../axios";
const getCart = async () => {
    const res = await api.post('carts/get-cart');
    return res.data;
}


const addItemToCart = async (item: { variantId: number; quantity: number; productId: number; productName: string; productImage: string }) => {
    console.log("API addItemToCart called with item:", item);
    const res = await api.post('carts/add-item', {
        variantId: item.variantId,
        quantity: item.quantity,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
    });
    return res.data;
}

const decreaseItem = async(variantId:number) => {
    const res = await api.post('carts/decrease-item', {
        variantId: variantId,
        quantity: 1,
    });
    return res.data;
}

const mergeCart = async (items: { variantId: number; quantity: number, productId: number, productName: string, productImage: string }[]) => {
    const res = await api.post('carts/merge-cart', items);
    return res.data;
}


export { getCart, mergeCart, addItemToCart, decreaseItem };