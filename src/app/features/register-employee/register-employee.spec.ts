import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterEmployee } from './register-employee';

describe('RegisterEmployee', () => {
  let component: RegisterEmployee;
  let fixture: ComponentFixture<RegisterEmployee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterEmployee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterEmployee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
