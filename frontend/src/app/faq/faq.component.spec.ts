import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { FaqComponent } from "./faq.component";

describe("FaqComponent", () => {
  let fixture: ComponentFixture<FaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqComponent);
    fixture.detectChanges();
  });

  function questions(): HTMLElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(".question"),
    );
  }

  it("opens the first question by default", () => {
    expect(questions()[0].getAttribute("aria-expanded")).toBe("true");
  });

  it("opens the question that was clicked", () => {
    questions()[3].click();
    fixture.detectChanges();

    expect(questions()[3].getAttribute("aria-expanded")).toBe("true");
    expect(questions()[0].getAttribute("aria-expanded")).toBe("false");
  });

  it("closes a question that was already open", () => {
    questions()[0].click();
    fixture.detectChanges();

    expect(questions()[0].getAttribute("aria-expanded")).toBe("false");
  });

  it("answers every question it asks", () => {
    const component = fixture.componentInstance;
    expect(component.questions.length).toBeGreaterThan(0);
    for (const item of component.questions) {
      expect(item.answer.length).toBeGreaterThan(20);
    }
  });
});
