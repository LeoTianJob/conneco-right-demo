export interface UserProfile {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    email: string;
    phone: string;
}

export interface Asset {
    id: string;
    title: string;
    src: string;
    type: "image" | "video";
    status: "Protected" | "Processing" | "Pending";
    creator: string;
    timestamp: string;
    license: string;
    dimensions?: string;
    fileSize?: string;
}
