import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DespesasLojaComponent } from './despesas-loja.component';

describe('DespesasLojaComponent', () => {
  let component: DespesasLojaComponent;
  let fixture: ComponentFixture<DespesasLojaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DespesasLojaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DespesasLojaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
