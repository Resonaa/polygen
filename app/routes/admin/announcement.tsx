import { Access, useAuthorizedOptionalUser, vditorConfig } from "~/utils";
import Vditor from "vditor";
import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "semantic-ui-react";
import { createAnnouncement } from "~/models/announcement.server";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireAuthenticatedUser } from "~/session.server";
import { useSubmit } from "@remix-run/react";

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedUser(request, Access.ManageAnnouncement);

  const formData = await request.formData();

  const title = formData.get("title");
  const content = formData.get("content");

  if (typeof title !== "string" || title.trim().length === 0) {
    return json(
      "标题不能为空",
      { status: 400 }
    );
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return json(
      "内容不能为空",
      { status: 400 }
    );
  }

  await createAnnouncement({ title, content });

  return redirect("/");
}

export default function Announcement() {
  useAuthorizedOptionalUser(Access.ManageAnnouncement);

  const [vd, setVd] = useState<Vditor>();

  useEffect(() => {
    const vditor = new Vditor("vditor", vditorConfig);

    setVd(vditor);
  }, []);

  const titleRef = useRef<HTMLInputElement>(null);

  const submit = useSubmit();

  const sendRequest = () => {
    const title = titleRef?.current?.value, content = vd?.getValue();

    if (title?.trim() && content?.trim()) {
      submit({ title, content }, { method: "post" });
    }
  };

  return (
    <div>
      <div className="ui input"><input placeholder="这里是标题" ref={titleRef} /></div>

      <div id="vditor" />

      <br />
      <Button icon primary labelPosition="left" onClick={sendRequest}>
        <Icon name="send" />
        提交
      </Button>
    </div>
  );
}