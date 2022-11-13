import { Container, Icon, Segment } from "semantic-ui-react";

export default function Footer() {
  return (
    <Segment className="!py-8">
      <Container className="!flex justify-between items-center">
        <div>
          Copyleft&nbsp;
          <span style={{ transform: "scale(-1,1)", display: "inline-block" }}>©</span>
          &nbsp;2022 polygen.
        </div>

        <div>
          <a title="GitHub" href="https://github.com/jwcub/polygen" style={{ color: "unset" }}>
            <Icon link name="github" size="large" />
          </a>

          <a title="QQ" href="https://jq.qq.com/?_wv=1027&k=4ngo8TrD" style={{ color: "unset" }} className="ml-6">
            <Icon link name="qq" size="large" />
          </a>
        </div>
      </Container>
    </Segment>
  );
}