import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaFornecedorComponent } from './consulta-fornecedor.component';

describe('ConsultaFornecedorComponent', () => {
  let component: ConsultaFornecedorComponent;
  let fixture: ComponentFixture<ConsultaFornecedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaFornecedorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultaFornecedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
