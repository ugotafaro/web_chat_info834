import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubblechatComponent } from './bubblechat.component';

describe('BubblechatComponent', () => {
  let component: BubblechatComponent;
  let fixture: ComponentFixture<BubblechatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubblechatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BubblechatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
