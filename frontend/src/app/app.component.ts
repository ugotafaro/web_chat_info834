import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TodoListComponent } from './todo-list/todo-list.component';
import { initFlowbite } from 'flowbite';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, HeaderComponent, TodoListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  selectedCategory: string | null = null;

  onCategorySelected(category: string) {
    this.selectedCategory = category;
  }

  ngOnInit(): void {
    initFlowbite();
  }
}