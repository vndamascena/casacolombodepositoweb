import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarProdutoGeralComponent } from './cadastrar-produto-geral.component';

describe('CadastrarProdutoGeralComponent', () => {
  let component: CadastrarProdutoGeralComponent;
  let fixture: ComponentFixture<CadastrarProdutoGeralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarProdutoGeralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CadastrarProdutoGeralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
