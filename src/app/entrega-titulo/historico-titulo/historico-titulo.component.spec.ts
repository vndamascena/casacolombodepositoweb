import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoTituloComponent } from './historico-titulo.component';

describe('HistoricoTituloComponent', () => {
  let component: HistoricoTituloComponent;
  let fixture: ComponentFixture<HistoricoTituloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoTituloComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoricoTituloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
