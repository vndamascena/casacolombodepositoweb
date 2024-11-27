import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoTitulofuncionarioComponent } from './historico-titulofuncionario.component';

describe('HistoricoTitulofuncionarioComponent', () => {
  let component: HistoricoTitulofuncionarioComponent;
  let fixture: ComponentFixture<HistoricoTitulofuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoTitulofuncionarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoricoTitulofuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
