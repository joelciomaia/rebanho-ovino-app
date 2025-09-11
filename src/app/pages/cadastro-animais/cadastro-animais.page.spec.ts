import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroAnimaisPage } from './cadastro-animais.page';

describe('CadastroAnimaisPage', () => {
  let component: CadastroAnimaisPage;
  let fixture: ComponentFixture<CadastroAnimaisPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroAnimaisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
