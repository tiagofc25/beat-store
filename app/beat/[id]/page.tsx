import BeatDetail from "@/src/components/pages/BeatDetail";

interface BeatPageProps {
    params: Promise<{ id: string }>;
}

export default async function BeatPage({ params }: BeatPageProps) {
    const { id } = await params;
    return <BeatDetail beatId={id} />;
}
