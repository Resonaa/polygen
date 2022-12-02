export class Player {
  username: string;
  color: number;

  constructor(username: string, color: number = 0) {
    this.username = username;
    this.color = color;
  }
}