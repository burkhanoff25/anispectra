import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/client";
import { UserService } from "@/lib/api/user.service";

async function getUserIdentifiers() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const cookieStr = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const aniProfile = await UserService.getProfile(cookieStr).catch(() => null);

  return {
    userId: session?.user?.id,
    aniLibertyId: aniProfile?.id ? String(aniProfile.id) : undefined,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { userId, aniLibertyId } = await getUserIdentifiers();
    if (!userId && !aniLibertyId) {
      return NextResponse.json({ isFavorited: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Missing type or id parameters" }, { status: 400 });
    }

    if (type === "anime") {
      const fav = await prisma.animeFavorite.findFirst({
        where: {
          titleId: id,
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(aniLibertyId ? [{ aniLibertyId }] : []),
          ],
        },
      });
      return NextResponse.json({ isFavorited: !!fav });
    }

    if (type === "manga") {
      const fav = await prisma.mangaFavorite.findFirst({
        where: {
          mangaId: id,
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(aniLibertyId ? [{ aniLibertyId }] : []),
          ],
        },
      });
      return NextResponse.json({ isFavorited: !!fav });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[Favorites GET Error]:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, aniLibertyId } = await getUserIdentifiers();
    if (!userId && !aniLibertyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, id, titleName, imageSrc } = body;

    if (!type || !id || !titleName) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (type === "anime") {
      const existing = await prisma.animeFavorite.findFirst({
        where: {
          titleId: id,
          userId: userId || null,
          aniLibertyId: aniLibertyId || null,
        },
      });

      if (!existing) {
        await prisma.animeFavorite.create({
          data: {
            userId: userId || null,
            aniLibertyId: aniLibertyId || null,
            titleId: id,
            titleName,
            imageSrc,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (type === "manga") {
      const existing = await prisma.mangaFavorite.findFirst({
        where: {
          mangaId: id,
          userId: userId || null,
          aniLibertyId: aniLibertyId || null,
        },
      });

      if (!existing) {
        await prisma.mangaFavorite.create({
          data: {
            userId: userId || null,
            aniLibertyId: aniLibertyId || null,
            mangaId: id,
            titleName,
            imageSrc,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[Favorites POST Error]:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, aniLibertyId } = await getUserIdentifiers();
    if (!userId && !aniLibertyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (type === "anime") {
      await prisma.animeFavorite.deleteMany({
        where: {
          titleId: id,
          userId: userId || null,
          aniLibertyId: aniLibertyId || null,
        },
      });
      return NextResponse.json({ success: true });
    }

    if (type === "manga") {
      await prisma.mangaFavorite.deleteMany({
        where: {
          mangaId: id,
          userId: userId || null,
          aniLibertyId: aniLibertyId || null,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[Favorites DELETE Error]:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
