import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createPost } from "~/models/post.server";
import { requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";

export async function action({ request }: ActionArgs) {
  const user = await requireAuthenticatedUser(request, Access.Community);

  const formData = await request.formData();
  const content = formData.get("content");

  if (typeof content !== "string" || content.length === 0) {
    return json(
      { errors: { content: "Content is required" } },
      { status: 400 }
    );
  }

  const post = await createPost({ content, username: user.username });

  return redirect(`/post/${post.id}`);
}

export default function NewPostPage() {
  const actionData = useActionData<typeof action>();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.content) {
      contentRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%"
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Content: </span>
          <textarea
            ref={contentRef}
            name="content"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={actionData?.errors?.content ? true : undefined}
            aria-errormessage={
              actionData?.errors?.content ? "content-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.content && (
          <div className="pt-1 text-red-700" id="content-error">
            {actionData.errors.content}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
