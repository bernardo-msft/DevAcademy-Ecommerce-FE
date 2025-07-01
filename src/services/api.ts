const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiErrorResponse {
    Message?: string;
    message?: string; // For model state errors
    [key: string]: any; // For other potential error structures
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({ Message: "An unknown error occurred" }));
        const errorMessage = errorData.Message || errorData.message || `API request failed with status ${response.status}`;
        console.error("API Error:", errorData);
        throw new Error(errorMessage);
    }
    return response.json() as Promise<T>;
}

export const registerUser = async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return handleResponse<any>(response);
};

export const loginUser = async (credentials: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    return handleResponse<any>(response); // Expects { User: ..., Token: ... }
};

export const logoutUserApi = async (token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return handleResponse<any>(response);
    } catch (error) {
        console.warn("Logout API call failed, proceeding with client-side logout:", error);
        // Still resolve successfully for client-side logout to proceed
        return Promise.resolve({ Message: "Client-side logout initiated after API error." });
    }
};

export const getCurrentUser = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse<any>(response); // Expects { Id: ..., Email: ..., Name: ..., Role: ... }
};

export const getCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return handleResponse<any[]>(response);
};

export const createCategory = async (categoryData: { name: string }, token: string) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
    });
    return handleResponse<any>(response);
};

export const updateCategory = async (id: string, categoryData: { name: string }, token: string) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
    });
    return handleResponse<any>(response);
};

export const deleteCategory = async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during deletion.' }));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
};

export const getProducts = async (categoryId?: string | null) => {
    let url = `${API_BASE_URL}/products`;
    if (categoryId) {
        url += `?categoryId=${categoryId}`;
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return handleResponse<any[]>(response);
};

export const getProductById = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return handleResponse<any>(response);
};

export const createProduct = async (productData: FormData, token: string) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: productData,
    });
    return handleResponse<any>(response);
};

export const updateProduct = async (id: number, productData: FormData, token: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: productData,
    });
    return handleResponse<any>(response);
};

export const deleteProduct = async (id: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during deletion.' }));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    // A 204 No Content response is a success but has no body to parse.
};

export const searchProducts = async (query: string, categoryId?: string | null) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (categoryId) {
        params.append('categoryId', categoryId);
    }

    const response = await fetch(`${API_BASE_URL}/products/search?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return handleResponse<any[]>(response);
};


// ==================================================================
// Shopping Cart API
// ==================================================================

export const getCart = async (token?: string | null) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers,
        credentials: 'include',
    });
    return handleResponse<any>(response);
};

export const addItemToCart = async (productId: string, quantity: number, token?: string | null) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId, quantity }),
        credentials: 'include',
    });
    return handleResponse<any>(response);
};

export const updateItemQuantity = async (productId: string, quantity: number, token?: string | null) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity }),
        credentials: 'include',
    });
    return handleResponse<any>(response);
};

export const removeItemFromCart = async (productId: string, token?: string | null) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    });
    return handleResponse<any>(response);
};



// ==================================================================
// Order Management API
// ==================================================================

export const placeOrder = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/Orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse<any>(response);
};

export const getOrders = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/Orders`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse<any[]>(response);
};

export const getAllOrders = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/Orders/all`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse<any[]>(response);
};

export const updateOrderStatus = async (orderId: string, status: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/Orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });
    return handleResponse<any>(response);
};

// ==================================================================
// Reporting API
// ==================================================================

export const getMonthlySalesReport = async (year: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/sales/${year}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse<any[]>(response);
};

export const getPopularProductsReport = async (count: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/popular-products?count=${count}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse<any[]>(response);
};

export const getTopCustomersReport = async (count: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/top-customers?count=${count}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse<any[]>(response);
};