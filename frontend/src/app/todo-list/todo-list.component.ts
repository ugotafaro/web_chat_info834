import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TaskService } from '../task.service';
import { Task } from '../../task';
import { NgFor, CommonModule } from '@angular/common';
import { CategoriesToolbarComponent } from '../categories-toolbar/categories-toolbar.component';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [NgFor, CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})

export class TodoListComponent implements OnInit {

  tasks: Task[] = [];
  @Input() category: string = "";
  selectedTasks: Set<string> = new Set();

  newTitle: string = '';
  newContent: string = '';
  hideCreateButton = true;


  constructor(private taskService: TaskService, private authService: AuthService, private catToolBar: CategoriesToolbarComponent) {}

  ngOnInit(): void {
    this.updateAllTasks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && !changes['category'].firstChange) {
      this.updateAllTasks();
    }
  }

  onSubmit(form: NgForm) {
    const newTitle = form.value.newTitle;
    const newContent = form.value.newContent;
    const taskInfo = {title: newTitle, content: newContent, category: this.category, done: false};
    this.taskService.addUserTask(taskInfo).subscribe(
      (task) => {
        this.updateAllTasks();
      },
      (error) => console.error(error)
    );
  }

  onTaskTitleNameChange() {
    this.hideCreateButton = this.newTitle.trim() === '';
  }

  private updateAllTasks() {
    this.taskService.getUserTasks({ category: this.category }).subscribe(
      (tasks: Task[]) => {
        this.tasks = tasks;
      },
      (error: any) => { this.tasks = []; console.error(error); }
    );
  }

  onDeleteCategory() {
    this.catToolBar.deleteCategory(this.category);
  }

  toggleTaskSelection(taskId: string) {
    if (this.selectedTasks.has(taskId)) {
      this.selectedTasks.delete(taskId);
    } else {
      this.selectedTasks.add(taskId);
    }
  }

  toggleTaskStatus(task: Task) {
    this.taskService.toggleStatusTask(task.id).subscribe();
  }

  deleteSelectedTasks() {
    const selectedTaskIds = Array.from(this.selectedTasks);
    // Appelez votre service ou effectuez toute autre logique pour supprimer les tâches sélectionnées.

    this.taskService.deleteTasks(selectedTaskIds).subscribe(
      () => {
        selectedTaskIds.forEach(taskId => {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
      })},
      (error) => {
        console.error(`Erreur lors de la suppression de la tâche`, error);
      }
    );


    this.selectedTasks.clear();
    this.updateAllTasks();
  }


  calculateDropdownHeight(): number {
    const minHeight = 50;
    const extraHeight = 10;

    if (this.tasks) {
      const calculatedHeight = Math.max(this.tasks.length * 40 + extraHeight, minHeight);
      return calculatedHeight;
    } else {
      return minHeight;
    }
  }
}