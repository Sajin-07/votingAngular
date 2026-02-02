import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCandidate } from './register-candidate';

describe('RegisterCandidate', () => {
  let component: RegisterCandidate;
  let fixture: ComponentFixture<RegisterCandidate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterCandidate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterCandidate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
