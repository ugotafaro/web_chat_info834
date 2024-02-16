import { Component} from '@angular/core';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TaskService } from '../task.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'categories-toolbar',
  templateUrl: './categories-toolbar.component.html',
  styleUrls: ['./categories-toolbar.component.scss'],
  standalone: true,
  imports: [TodoListComponent, CommonModule, FormsModule]
})

export class CategoriesToolbarComponent {
  categories: string[] = [];
  selectedCategory: string = '';
  newCategoryName: string = '';
  categoryNameError: boolean = false;

  // Nouvelle propriété pour gérer l'erreur d'ajout de catégorie
  hideCreateButton: boolean = true;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getUserCategories().subscribe(
      (categories) => {
        this.categories = categories;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  onSubmit(form: NgForm) {
    const newCategoryName = form.value.newCategoryName;

    // Vérifier si le nom de la catégorie est vide
    if (newCategoryName.trim() === '') {
      // Activer l'erreur et empêcher l'ajout
      this.categoryNameError = true;
    } else if (!this.categories.includes(newCategoryName)) {
      // Ajouter la nouvelle catégorie
      this.categories.push(newCategoryName);

      // Réinitialiser le formulaire et l'erreur
      form.resetForm();
      this.categoryNameError = false;
      // Sélectionner la nouvelle catégorie
      this.selectedCategory = newCategoryName;
    } else {
      // La catégorie existe déjà
      this.categoryNameError = true; // Peut-être gérer différemment si besoin
    }
  }

  onTaskTitleNameChange() {
    this.hideCreateButton = this.newCategoryName.trim() === '' || this.categories.includes(this.newCategoryName) ;
  }

  closeCategoryErrorModal() {
    this.categoryNameError = false;
  }

  deleteCategory(category: string) {
    // Ajoutez ici le code pour supprimer la catégorie du service
    const index = this.categories.indexOf(category);

    if (index !== -1) this.categories.splice(index, 1);

    this.taskService.deleteCategory(category).subscribe({
      error: (error) => console.error(error)
    });
    this.selectedCategory = '';
  }
}