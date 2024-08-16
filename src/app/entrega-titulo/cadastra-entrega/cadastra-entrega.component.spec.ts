import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastraEntregaComponent } from './cadastra-entrega.component';

describe('CadastraEntregaComponent', () => {
  let component: CadastraEntregaComponent;
  let fixture: ComponentFixture<CadastraEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastraEntregaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CadastraEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
