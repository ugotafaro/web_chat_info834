export class Message {
    id: number ;
    content: string;
    timestamp: Date;
    isUserMessage: boolean;
    userIdSender: number;
    conversation: number | null;

    constructor(id: number, content: string, timestamp: Date, isUserMessage: boolean, userIdSender: number) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.isUserMessage = isUserMessage;
        this.userIdSender = userIdSender;
        this.conversation = null;
    }
}