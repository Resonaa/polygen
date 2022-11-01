import { Container, Grid, Header, List, Segment } from "semantic-ui-react";

export default function Footer() {
  return (
    <Segment inverted vertical className="!py-20" >
      <Container>
        <Grid divided inverted stackable>
          <Grid.Column width={3} className="max-w-[40%]">
            <Header inverted as="h4" content="关于" />
            <List link inverted>
              <List.Item as="a">站点地图</List.Item>
              <List.Item as="a">联系我们</List.Item>
              <List.Item as="a">帮助中心</List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={3} className="max-w-[40%]">
            <Header inverted as="h4" content="社区" />
            <List link inverted>
              <List.Item as="a">社区规则</List.Item>
              <List.Item as="a" href="https://github.com/jwcub/polygen">开源仓库</List.Item>
              <List.Item as="a">官方 QQ 群</List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={7}>
            <Header as="h4" inverted>
              Copyright © 2022 polygen
            </Header>
            <p>
              This page is licensed under the <a href="~/components/footer">Unlicense</a>.
            </p>
          </Grid.Column>
        </Grid>
      </Container>
    </Segment>
  );
}