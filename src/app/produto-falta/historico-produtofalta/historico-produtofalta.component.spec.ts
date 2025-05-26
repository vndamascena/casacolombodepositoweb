import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoProdutofaltaComponent } from './historico-produtofalta.component';

describe('HistoricoProdutofaltaComponent', () => {
  let component: HistoricoProdutofaltaComponent;
  let fixture: ComponentFixture<HistoricoProdutofaltaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoProdutofaltaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoricoProdutofaltaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
