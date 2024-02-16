export class Task {
    id: string;
    title: string;
    content: string;
    done: boolean;

    constructor(id: string, title: string, content: string, done: boolean) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.done = done;
  }
}