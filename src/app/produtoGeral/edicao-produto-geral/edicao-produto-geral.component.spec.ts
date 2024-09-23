import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicaoProdutoGeralComponent } from './edicao-produto-geral.component';

describe('EdicaoProdutoGeralComponent', () => {
  let component: EdicaoProdutoGeralComponent;
  let fixture: ComponentFixture<EdicaoProdutoGeralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdicaoProdutoGeralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EdicaoProdutoGeralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
