import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step5 } from './step5';

describe('Step5', () => {
  let component: Step5;
  let fixture: ComponentFixture<Step5>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step5]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step5);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
