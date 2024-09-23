import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarProdutoGeralComponent } from './consultar-produto-geral.component';

describe('ConsultarProdutoGeralComponent', () => {
  let component: ConsultarProdutoGeralComponent;
  let fixture: ComponentFixture<ConsultarProdutoGeralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarProdutoGeralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarProdutoGeralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
