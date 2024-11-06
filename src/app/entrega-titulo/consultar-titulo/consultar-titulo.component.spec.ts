import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarTituloComponent } from './consultar-titulo.component';

describe('ConsultarTituloComponent', () => {
  let component: ConsultarTituloComponent;
  let fixture: ComponentFixture<ConsultarTituloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarTituloComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarTituloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
