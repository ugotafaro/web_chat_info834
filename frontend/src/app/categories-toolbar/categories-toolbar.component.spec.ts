import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesToolbarComponent } from './categories-toolbar.component';


describe('CategoriesToolbarComponent', () => {
  let component: CategoriesToolbarComponent;
  let fixture: ComponentFixture<CategoriesToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
