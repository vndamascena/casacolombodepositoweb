import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoVendaProdutoGeralComponent } from './historico-venda-produto-geral.component';

describe('HistoricoVendaProdutoGeralComponent', () => {
  let component: HistoricoVendaProdutoGeralComponent;
  let fixture: ComponentFixture<HistoricoVendaProdutoGeralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoVendaProdutoGeralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoricoVendaProdutoGeralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
