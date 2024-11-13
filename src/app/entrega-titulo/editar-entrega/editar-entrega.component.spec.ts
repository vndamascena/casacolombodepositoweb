import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEntregaComponent } from './editar-entrega.component';

describe('EditarEntregaComponent', () => {
  let component: EditarEntregaComponent;
  let fixture: ComponentFixture<EditarEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEntregaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
