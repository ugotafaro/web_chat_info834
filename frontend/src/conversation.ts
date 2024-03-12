import { Message } from "./message";
import { User } from "./user";

export class Conversation {
    id: number ;
    name : string;
    users: User[];
    messages: Message[];

    constructor(id: number, name: string,  users: User[], messages: Message[]) {
        this.id = id;
        this.name = name;
        this.users = users;
        this.messages = messages;
    }
}