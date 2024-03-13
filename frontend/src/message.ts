export class Message {
    id: number ;
    content: string;
    timestamp: Date;
    userIdSender: number;
    conversation: number | null;

    constructor(id: number, content: string, timestamp: Date, userIdSender: number) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.userIdSender = userIdSender;
        this.conversation = null;
    }
}