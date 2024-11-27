import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTitulofuncionarioComponent } from './editar-titulofuncionario.component';

describe('EditarTitulofuncionarioComponent', () => {
  let component: EditarTitulofuncionarioComponent;
  let fixture: ComponentFixture<EditarTitulofuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTitulofuncionarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarTitulofuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
