import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { deletePost, getPost } from "~/models/post.server";
import { requireUsername } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const authorname = await requireUsername(request);
  invariant(params.postId, "postId not found");
  const id = Number(params.postId);

  const post = await getPost({ authorname, id });
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ post });
}

export async function action({ request, params }: ActionArgs) {
  const authorname = await requireUsername(request);
  invariant(params.postId, "postId not found");
  const id = Number(params.postId);

  await deletePost({ authorname, id });

  return redirect("/post");
}

export default function PostDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p className="py-6">{data.post.content}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
