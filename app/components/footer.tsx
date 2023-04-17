import { Link } from "@remix-run/react";
import { Container, Grid, Header, List, Segment } from "semantic-ui-react";

export default function Footer() {
  return (
    <Segment inverted vertical className="!py-16">
      <Container>
        <Grid divided inverted stackable>
          <Grid.Column width={3} className="max-w-[40%]">
            <Header inverted as="h4" content="关于" />
            <List link inverted>
              <List.Item as={Link} reloadDocument to="/sitemap.xml">站点地图</List.Item>
              <List.Item as="a">帮助中心</List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={3} className="max-w-[40%]">
            <Header inverted as="h4" content="社区" />
            <List link inverted>
              <List.Item as="a" href="https://github.com/jwcub/polygen">开源仓库</List.Item>
              <List.Item as="a" href="https://jq.qq.com/?_wv=1027&k=nfUjZSBS">官方 QQ 群</List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={7}>
            <Header as="h4" inverted>
              Copyleft&nbsp;
              <span style={{ transform: "scale(-1,1)", display: "inline-block" }}>©</span>
              &nbsp;2022-2023 polygen
            </Header>
            <p>
              This page is unlicensed under the <a href="https://unlicense.org/">Unlicense</a>.
            </p>
          </Grid.Column>
        </Grid>
      </Container>
    </Segment>
  );
}