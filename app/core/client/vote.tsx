import { Modal, List, Header, Divider } from "semantic-ui-react";

import AnimatedModal from "~/components/animatedModal";
import type {
  MaxVotedItems,
  VoteData,
  VoteItem,
  VoteValue
} from "~/core/server/vote";
import { translations, voteItems } from "~/core/server/vote";
import type { ClientSocket } from "~/core/types";
import { useUser } from "~/utils";

export function Vote({
  client,
  voteData,
  type,
  setType
}: {
  client?: ClientSocket;
  voteData?: { data: VoteData; ans: MaxVotedItems };
  type?: VoteItem;
  setType: (type?: VoteItem) => void;
}) {
  const user = useUser();

  function Item<T extends VoteItem>({
    value,
    players
  }: {
    value: VoteValue<T>;
    players?: string[];
  }) {
    return (
      <List.Item
        active={players && players.includes(user.username)}
        onClick={() =>
          client?.emit("vote", {
            item: type as VoteItem,
            value
          })
        }
        className="select-none"
      >
        <List.Content>
          <List.Header>{value}</List.Header>
          {players && (
            <>
              {players.length}票{players.length > 0 ? ": " : ""}
              {players.join(", ")}
            </>
          )}
        </List.Content>
      </List.Item>
    );
  }

  return (
    <AnimatedModal
      open={type !== undefined}
      onClose={() => setType()}
      basic
      size="mini"
      duration={300}
    >
      <Modal.Header>
        投票选择{type ? translations[type] : undefined}
      </Modal.Header>
      <Modal.Content scrolling>
        <Modal.Description>
          <Header as="h3" inverted textAlign="center">
            当前投票
          </Header>
          <List divided inverted relaxed selection animated size="large">
            {voteData &&
              type &&
              voteData.data[type]?.map(([value, players]) => (
                <Item key={value} value={value} players={players} />
              ))}
          </List>
          <Divider inverted />
          <Header as="h3" inverted textAlign="center">
            所有{type ? translations[type] : undefined}
          </Header>
          <List divided inverted relaxed selection animated size="large">
            {(() => {
              if (!voteData || !type) {
                return <></>;
              }

              const data = voteData.data[type]
                ? (voteData.data[type] as NonNullable<VoteData[typeof type]>)
                : [];
              const others = (
                voteItems[type] as Array<VoteValue<typeof type>>
              ).filter(
                value =>
                  !data.some(([existingValue]) => existingValue === value)
              );

              return others.map(value => <Item key={value} value={value} />);
            })()}
          </List>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions />
    </AnimatedModal>
  );
}
