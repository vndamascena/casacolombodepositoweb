import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarTitulofuncionarioComponent } from './consultar-titulofuncionario.component';

describe('ConsultarTitulofuncionarioComponent', () => {
  let component: ConsultarTitulofuncionarioComponent;
  let fixture: ComponentFixture<ConsultarTitulofuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarTitulofuncionarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarTitulofuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
