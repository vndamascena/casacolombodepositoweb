import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoBaixaOcorrenciaComponent } from './historico-baixa-ocorrencia.component';

describe('HistoricoBaixaOcorrenciaComponent', () => {
  let component: HistoricoBaixaOcorrenciaComponent;
  let fixture: ComponentFixture<HistoricoBaixaOcorrenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoBaixaOcorrenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoricoBaixaOcorrenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
