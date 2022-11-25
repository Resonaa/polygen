import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";
import { getPostListItems } from "~/models/post.server";

export async function loader({ request }: LoaderArgs) {
  const { username } = await requireAuthenticatedUser(request, Access.VisitWebsite);

  const postListItems = await getPostListItems({ username });

  return json({ postListItems, username });
}

export default function PostPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Posts</Link>
        </h1>
        <p>{data.username}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Post
          </Link>

          <hr />

          {data.postListItems.length === 0 ? (
            <p className="p-4">No posts yet</p>
          ) : (
            <ol>
              {data.postListItems.map((post) => (
                <li key={post.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={post.id.toString()}
                  >
                    📝 {post.content}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
