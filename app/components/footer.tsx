import { Container, Icon, Segment } from "semantic-ui-react";
import { Link } from "@remix-run/react";

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
          <a href="https://github.com/jwcub/polygen" style={{ color: "unset" }}
             data-inverted="" data-tooltip="GitHub" data-variation="mini">
            <Icon link name="github" size="large" />
          </a>

          <a href="https://jq.qq.com/?_wv=1027&k=4ngo8TrD" style={{ color: "unset" }} className="ml-6"
             data-inverted="" data-tooltip="QQ" data-variation="mini">
            <Icon link name="qq" size="large" />
          </a>

          <Link reloadDocument to="/sitemap.xml" style={{ color: "unset" }} className="ml-6"
                data-inverted="" data-tooltip="站点地图" data-variation="mini">
            <Icon link name="sitemap" size="large" />
          </Link>
        </div>
      </Container>
    </Segment>
  );
}