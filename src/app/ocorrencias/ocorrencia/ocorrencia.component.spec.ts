import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcorrenciaComponent } from './ocorrencia.component';

describe('OcorrenciaComponent', () => {
  let component: OcorrenciaComponent;
  let fixture: ComponentFixture<OcorrenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OcorrenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OcorrenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
