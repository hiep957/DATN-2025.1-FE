"use client"

import api from "@/lib/axios";
import { useEffect, useState } from "react";

export default function OrderPage() {
    const [users, setUsers] = useState<any[]>([]);
    // useEffect(() => {
    //     api.get("/user/profile").then((r) => setUsers(r.data));
    // }, []);
    console.log(users);
    return (
        <div>
            Order Page

            <button
                onClick={() => {
                    api.get("/user/profile").then((r) => console.log(r));
                }}
            >
                Test Profile
            </button>
        </div>
    )
}