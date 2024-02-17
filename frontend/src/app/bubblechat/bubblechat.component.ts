import { Component, Input } from '@angular/core';
import { Message } from '../../message';

@Component({
  selector: 'app-bubblechat',
  standalone: true,
  imports: [],
  templateUrl: './bubblechat.component.html',
  styleUrl: './bubblechat.component.scss'
})
export class BubblechatComponent {
   @Input() messsage! : Message;
   

}
