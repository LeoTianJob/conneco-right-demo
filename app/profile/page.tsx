import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/profile/dashboard";
import { type Asset, type UserProfile } from "@/components/profile/types";

const sampleAssets: Asset[] = [
    {
        id: "1",
        title: "Coastal Serenity",
        src: "/images/art-1.jpg",
        type: "image",
        status: "Protected",
        creator: "Elena Marchetti",
        timestamp: "Jan 15, 2026",
        license: "CC BY-NC 4.0",
        dimensions: "3840 x 2160",
        fileSize: "8.2 MB",
    },
    {
        id: "2",
        title: "Mountain Dawn",
        src: "/images/art-2.jpg",
        type: "image",
        status: "Protected",
        creator: "Elena Marchetti",
        timestamp: "Jan 22, 2026",
        license: "All Rights Reserved",
        dimensions: "4096 x 2730",
        fileSize: "12.1 MB",
    },
    {
        id: "3",
        title: "Portrait Study #7",
        src: "/images/art-3.jpg",
        type: "image",
        status: "Processing",
        creator: "Elena Marchetti",
        timestamp: "Feb 3, 2026",
        license: "CC BY 4.0",
        dimensions: "2400 x 3200",
        fileSize: "5.6 MB",
    },
    {
        id: "4",
        title: "Neon Geometry #4",
        src: "/images/art-4.jpg",
        type: "image",
        status: "Protected",
        creator: "Elena Marchetti",
        timestamp: "Feb 10, 2026",
        license: "CC BY-SA 4.0",
        dimensions: "3000 x 3000",
        fileSize: "4.3 MB",
    },
    {
        id: "5",
        title: "Golden Hour",
        src: "/images/art-5.jpg",
        type: "video",
        status: "Pending",
        creator: "Elena Marchetti",
        timestamp: "Feb 18, 2026",
        license: "All Rights Reserved",
        dimensions: "1920 x 1080",
        fileSize: "142 MB",
    },
    {
        id: "6",
        title: "Botanical Study II",
        src: "/images/art-6.jpg",
        type: "image",
        status: "Protected",
        creator: "Elena Marchetti",
        timestamp: "Feb 24, 2026",
        license: "CC BY-NC 4.0",
        dimensions: "2800 x 4200",
        fileSize: "9.8 MB",
    },
    {
        id: "7",
        title: "Urban Rhythms",
        src: "/images/art-7.jpg",
        type: "image",
        status: "Processing",
        creator: "Elena Marchetti",
        timestamp: "Mar 1, 2026",
        license: "CC BY 4.0",
        dimensions: "3600 x 2400",
        fileSize: "7.1 MB",
    },
    {
        id: "8",
        title: "Dreamscape IV",
        src: "/images/art-8.jpg",
        type: "image",
        status: "Protected",
        creator: "Elena Marchetti",
        timestamp: "Mar 3, 2026",
        license: "All Rights Reserved",
        dimensions: "4000 x 3000",
        fileSize: "11.4 MB",
    },
];

const STORAGE_USED = 45;
const STORAGE_TOTAL = 100;

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Extract primary email and phone safely for the client component
    // Note: While these getters exist, we extract just the strings to ensure easy serialization for the client component.
    const primaryEmail = user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || "";

    const primaryPhone = user.primaryPhoneNumber?.phoneNumber ||
        user.phoneNumbers.find(p => p.id === user.primaryPhoneNumberId)?.phoneNumber || "";

    const sanitizedUser: UserProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        email: primaryEmail,
        phone: primaryPhone
    };

    return (
        <Dashboard
            assets={sampleAssets}
            storageUsed={STORAGE_USED}
            storageTotal={STORAGE_TOTAL}
            user={sanitizedUser}
        />
    );
}
