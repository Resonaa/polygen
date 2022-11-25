import type { LoaderArgs } from "@remix-run/node";

import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";

function generateSiteMap() {
  const baseUrl = "https://polygen.tk";

  function url(link: string) {
    return `<url><loc>${baseUrl}${link}</loc></url>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${url("/")}
     ${url("/game")}
     ${url("/leaderboard")}
     ${url("/admin")}
   </urlset>
 `;
}

export async function loader({ request }: LoaderArgs) {
  await requireAuthenticatedOptionalUser(request, Access.VisitWebsite);

  return new Response(generateSiteMap(), {
    status: 200,
    headers: {
      "Content-Type": "text/xml"
    }
  });
}