export const enum MessageType {
  World = "世界",
  Room = "房间",
  Team = "队伍"
}

export interface Message {
  type: MessageType;
  sender: string;
  content: string;
}
