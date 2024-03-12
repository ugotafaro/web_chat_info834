import { Message } from "./message";
import { User } from "./user";

export class Conversation {
    id: number ;
    content: string;
    timestamp: string;
    users: User[];
    messages: Message[];

    constructor(id: number, content: string, timestamp: string, users: User[], messages: Message[]) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.users = users;
        this.messages = messages;
    }
}