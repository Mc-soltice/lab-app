import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey =
  process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = (
  process.env.CLOUDINARY_API_SECRET ||
  process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET ||
  ""
).trim();

function createCloudinarySignature(params: Record<string, string | number>) {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${sortedParams}${apiSecret}`).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error: "Les variables Cloudinary ne sont pas configurées côté serveur.",
        },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) || "blog/posts";
    const requestedResourceType = (
      (formData.get("resourceType") as string | null) || ""
    ).toLowerCase();

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (file.size > 250 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier ne doit pas dépasser 250 Mo" },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append(
      "file",
      new Blob([bytes], { type: file.type || "image/jpeg" }),
      file.name || "upload",
    );

    const timestamp = Math.floor(Date.now() / 1000);
    const isAudio =
      file.type?.startsWith("audio/") || requestedResourceType === "audio";
    const isVideo =
      file.type?.startsWith("video/") || requestedResourceType === "video";
    const resourceTypeValue =
      requestedResourceType === "image" ||
      requestedResourceType === "video" ||
      requestedResourceType === "raw" ||
      requestedResourceType === "auto"
        ? requestedResourceType
        : isAudio || isVideo
          ? "auto"
          : "image";
    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    };

    const signature = createCloudinarySignature(paramsToSign);

    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", String(timestamp));
    cloudinaryFormData.append("signature", signature);
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("resource_type", resourceTypeValue);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceTypeValue}/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      },
    );

    const result = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok || !result.secure_url) {
      return NextResponse.json(
        {
          error: result.error?.message || "Erreur lors de l’upload Cloudinary",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: {
          secure_url: result.secure_url,
          public_id: result.public_id,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur lors de l’upload",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error: "Les variables Cloudinary ne sont pas configurées côté serveur.",
        },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json({ error: "Aucun publicId fourni" }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      public_id: publicId,
      timestamp,
    };

    const signature = createCloudinarySignature(paramsToSign);

    const deleteFormData = new FormData();
    deleteFormData.append("public_id", publicId);
    deleteFormData.append("api_key", apiKey);
    deleteFormData.append("timestamp", String(timestamp));
    deleteFormData.append("signature", signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: deleteFormData,
      },
    );

    const result = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok || result.result !== "ok") {
      return NextResponse.json(
        {
          error: result.error?.message || "Erreur lors de la suppression Cloudinary",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur lors de la suppression",
      },
      { status: 500 },
    );
  }
}
