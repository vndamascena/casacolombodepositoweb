import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Erro401Component } from './erro-401.component';

describe('Erro401Component', () => {
  let component: Erro401Component;
  let fixture: ComponentFixture<Erro401Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Erro401Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Erro401Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
