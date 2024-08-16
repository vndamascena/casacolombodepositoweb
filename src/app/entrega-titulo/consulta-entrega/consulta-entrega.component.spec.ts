import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEntregaComponent } from './consulta-entrega.component';

describe('ConsultaEntregaComponent', () => {
  let component: ConsultaEntregaComponent;
  let fixture: ComponentFixture<ConsultaEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaEntregaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultaEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
