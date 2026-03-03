import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size: raw } = await params;
  const px = Math.min(Math.max(Number(raw) || 192, 16), 1024);
  const radius = Math.round(px * 0.2);
  const fontSize = Math.round(px * 0.55);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: `${radius}px`,
          background:
            "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
        }}
      >
        <span style={{ fontSize, fontWeight: 900, color: "#fff" }}>W</span>
      </div>
    ),
    { width: px, height: px },
  );
}
