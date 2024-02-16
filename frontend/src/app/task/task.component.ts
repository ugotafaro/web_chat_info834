import { Component } from '@angular/core';
import { Task } from '../../task';
import { TaskService } from '../task.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'task',
  standalone: true,
  imports: [NgIf],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {
  task !: Task | null;

  constructor(private route: ActivatedRoute, private taskService: TaskService) {}

  // ngOnInit(): void {
  //   let id = this.route.snapshot.paramMap.get('id')!;
  //   this.taskService.getTask(id).subscribe(
  //     (task) => { this.task = task; },
  //     (error) => { this.task = null; console.error(error) }
  //   )
  //
  // }

  deleteTask(){}


}
