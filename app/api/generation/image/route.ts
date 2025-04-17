import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { prompt } = await req.json();

    if (!prompt || prompt.length === 0) {
        return NextResponse.json({ error: "Scenes are required" }, { status: 400 });
    }

    try {
        const response = await fetch("http://127.0.0.1:8787/api/generate/image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate images");
        }

        const data = await response.json();
        const image = data.image;
        
        return NextResponse.json({ image });
    }
    catch(error) {
        console.error("Error generating images:", error);
        return NextResponse.json({ error: "Failed to generate images" }, { status: 500 });
    }
}