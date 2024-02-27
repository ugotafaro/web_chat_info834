export class User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  token: string;

  constructor(id: string, username: string, token: string, firstname: string = "", lastname: string = "") {
    this.id = id;
    this.username = username;
    this.token = token;
    this.firstname = firstname;
    this.lastname = lastname;
  }
}