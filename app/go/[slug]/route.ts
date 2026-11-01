import { NextResponse } from "next/server";
import { getTool, goTarget } from "@/lib/tools";

// /go/[slug]：302 跳转。第三方工具跳官网、pershare 跳其官网、sheet2word 跳站内可用页。
// 点击计数本期不做，只跳转；目标从注册表统一取，改注册表即改跳转。
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) {
    return new NextResponse("Tool not found", { status: 404 });
  }
  const target = goTarget(tool);
  const url = target.startsWith("http")
    ? target
    : new URL(target, request.url).toString();
  return NextResponse.redirect(url, 302);
}
