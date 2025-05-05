import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutofaltaCadastrarComponent } from './produtofalta-cadastrar.component';

describe('ProdutofaltaCadastrarComponent', () => {
  let component: ProdutofaltaCadastrarComponent;
  let fixture: ComponentFixture<ProdutofaltaCadastrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutofaltaCadastrarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProdutofaltaCadastrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
