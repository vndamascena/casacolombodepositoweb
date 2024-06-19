import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastraOcorrenciaComponent } from './cadastra-ocorrencia.component';

describe('CadastraOcorrenciaComponent', () => {
  let component: CadastraOcorrenciaComponent;
  let fixture: ComponentFixture<CadastraOcorrenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastraOcorrenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CadastraOcorrenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
