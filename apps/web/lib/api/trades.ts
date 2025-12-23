import axios, { AxiosError } from "axios";
import type {
    AddTradeInput,
    UpdateTradeInput,
    TradeWithScreenshots,
    ApiResponse,
} from "@repo/common/types";

const BASE_URL = "/api/trades";


const api = axios.create({
    baseURL: BASE_URL
});


function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        return error.response?.data?.error || error.message || "Network error";
    }
    return error instanceof Error ? error.message : "Unknown error";
}

export async function addTradeApi(
    formData: FormData
): Promise<ApiResponse<TradeWithScreenshots>> {
    try {
        const { data } = await api.post("", formData);

        return {
            success: true,
            data: data.trade,
        };
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            return {
                success: false,
                error: error.response.data?.error || "Failed to add trade",
                details: error.response.data?.details,
            };
        }
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}


export async function updateTradeApi(
    id: number,
    input: UpdateTradeInput
): Promise<ApiResponse<TradeWithScreenshots>> {
    try {
        const { data } = await api.put(`/${id}`, input);

        return {
            success: true,
            data: data.trade,
        };
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            return {
                success: false,
                error: error.response.data?.error || "Failed to update trade",
                details: error.response.data?.details,
            };
        }
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}


export async function deleteTradeApi(
    id: number
): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
        await api.delete(`/${id}`);

        return {
            success: true,
            data: { deleted: true },
        };
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            return {
                success: false,
                error: error.response.data?.error || "Failed to delete trade",
            };
        }
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function getTradesApi(): Promise<
    ApiResponse<TradeWithScreenshots[]>
> {
    try {
        console.log("trades get api")
        const { data } = await api.get(`${process.env.NEXTAUTH_URL}/api/trades`);
        console.log("data", data)
        return {
            success: true,
            data: data.trades,
        };
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            return {
                success: false,
                error: error.response.data?.error || "Failed to fetch trades",
            };
        }
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
