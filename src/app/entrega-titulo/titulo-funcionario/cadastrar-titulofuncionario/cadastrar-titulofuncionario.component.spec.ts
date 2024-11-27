import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarTitulofuncionarioComponent } from './cadastrar-titulofuncionario.component';

describe('CadastrarTitulofuncionarioComponent', () => {
  let component: CadastrarTitulofuncionarioComponent;
  let fixture: ComponentFixture<CadastrarTitulofuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarTitulofuncionarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CadastrarTitulofuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
