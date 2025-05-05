import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutofaltaConsultarComponent } from './produtofalta-consultar.component';

describe('ProdutofaltaConsultarComponent', () => {
  let component: ProdutofaltaConsultarComponent;
  let fixture: ComponentFixture<ProdutofaltaConsultarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutofaltaConsultarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProdutofaltaConsultarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
