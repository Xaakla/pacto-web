import {Directive} from '@angular/core';
import {AbstractControl, FormArray, FormGroup, ValidatorFn} from '@angular/forms';

import $ from 'jquery';

@Directive()
export abstract class FormReactiveBase {

  form!: FormGroup;
  submitted: boolean = false;

  protected constructor() {
  }

  abstract submit(): void;

  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.submit();
    } else {
      this.markAllFormFieldsAsTouched(this.form);
      // go element with error
      this.goToAnchorWithError();
    }
  }

  markAllFormFieldsAsTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup['controls']).forEach(field => {
      const control = formGroup.get(field) as AbstractControl;
      control.markAsDirty();
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllFormFieldsAsTouched(control);
      }
    });
  }

  goToAnchorWithError(): void {
    // go element with error
    setTimeout(() => {
      const diff = 200;

      const elementTarget = $('.ng-invalid:not(form):first');
      if (elementTarget.length > 0) {
        $('html, body').animate({
          // @ts-ignore
          scrollTop: (elementTarget.first().offset().top - diff)
        }, 500);
      }
    });
  }

  hasError(field: string) {
    return (this.form.get(field) as AbstractControl).errors;
  }

  isValid(name: string, showIcon: boolean = true, showIfValid: boolean = false): {
    'is-invalid': boolean,
    'is-valid': boolean,
    'without-icon': boolean
  } {
    const el = this.form.get(name) as AbstractControl;
    const invalid = (!el.valid && (el.touched || el.dirty) && el.status === 'INVALID');
    return {
      'is-invalid': invalid,
      'is-valid': (showIfValid && el.valid),
      'without-icon': !showIcon
    };
  }

  valid(name: string): boolean {
    const el = this.form.get(name) as AbstractControl;
    return (!el.valid && (el.touched || el.dirty) && el.status === 'INVALID');
  }

  isValidElementForm(form: AbstractControl, name: string, showIfValid: boolean = false, showIcon: boolean = true): object {
    const el = form.get(name) as AbstractControl;
    return {
      'is-invalid': (!el.valid && (el.touched || el.dirty) && el.status === 'INVALID'),
      'is-valid': (showIfValid && el.valid),
      'without-icon': !showIcon
    };
  }

  isValidFormControl(el: AbstractControl): object {
    return {
      'is-invalid': (!el.valid && (el.touched || el.dirty) && el.status === 'INVALID')
    };
  }

  hasErrorWithValidator(name: string, validatorName: string): boolean {
    const el = this.form.get(name) as AbstractControl;
    return (el.invalid && (el.touched || el.dirty)) && el.hasError(validatorName);
  }

  hasErrorWithValidatorAndElementAndForm(form: FormGroup,
                                         elementName: string,
                                         validatorName: string): boolean {
    return this.hasErrorWithValidatorFormControl(form.get(elementName) as AbstractControl, validatorName);
  }

  hasErrorWithValidatorFormControl(el: AbstractControl, validatorName: string): boolean {
    return (el.invalid && (el.touched || el.dirty)) && el.hasError(validatorName);
  }

  isValidFormArrayInFormArray(firstIndex: number,
                              firstFormArrayName: string,
                              secondIndex: number,
                              secondFormArrayName: string,
                              fieldName: string,
                              showIcon: boolean = true): object {
    const el = this.getFieldOfFormArrayInForArray(firstIndex, firstFormArrayName, secondIndex, secondFormArrayName, fieldName);
    return {
      'is-invalid': (!el.valid && (el.touched || el.dirty) && el.status === 'INVALID'),
      'without-icon': !showIcon
    };
  }

  isValidFormArray(formArrayName: string, index: number, fieldName: string, showIcon: boolean = true): object {
    const el = this.getFieldOfFormArray(formArrayName, index, fieldName);
    return {
      'is-invalid': (!el.valid && (el.touched || el.dirty) && el.status === 'INVALID'),
      'without-icon': !showIcon
    };
  }

  isValidFormArrayElement(formArrayName: string, index: number, fieldName: string): boolean {
    const el = this.getFieldOfFormArray(formArrayName, index, fieldName);
    return (!el.valid && (el.touched || el.dirty) && el.status === 'INVALID');
  }

  getFieldOfFormArray(formArrayName: string, index: number, fieldName: string): AbstractControl {
    const telephones = this.form.get(formArrayName) as FormArray;
    const formGroup = telephones.controls[index] as FormGroup;
    return formGroup.get(fieldName) as AbstractControl;
  }

  getFieldOfFormArrayInForArray(firstIndex: number,
                                firstFormArrayName: string,
                                secondIndex: number,
                                secondFormArrayName: string,
                                fieldName: string): AbstractControl {
    const el: FormGroup = (
      (this.form.get(firstFormArrayName) as FormArray)
        .controls[firstIndex].get(secondFormArrayName) as FormArray)
      .controls[secondIndex] as FormGroup;
    return el.get(fieldName) as AbstractControl;
  }

  getFormArray(formArrayName: string): FormArray {
    return this.form.get(formArrayName) as FormArray;
  }

  getFormArrayByForm(form: FormGroup, formArrayName: string): FormArray {
    return form.get(formArrayName) as FormArray;
  }

  getFormArrayInParent(form: AbstractControl, formArrayName: string): FormArray {
    return form.get(formArrayName) as FormArray;
  }

  get(field: string): AbstractControl {
    return this.form.get(field) as AbstractControl;
  }

  existFormControl(field: string): boolean {
    return !!this.form.get(field);
  }

  getFieldByForm(field: string, form: FormGroup): AbstractControl {
    return form.get(field) as AbstractControl;
  }

  getValue(field: string): any {
    return (this.form.get(field) as AbstractControl).value;
  }

  setValue(field: string, value: any): any {
    return (this.form.get(field) as AbstractControl).setValue(value);
  }

  getValueFieldByForm(form: FormGroup, fieldName: string): any {
    return (form.get(fieldName) as AbstractControl).value;
  }

  setValueFieldByForm(form: FormGroup, fieldName: string, newValue: string): void {
    return (form.get(fieldName) as AbstractControl).value;
  }

  hasValue(field: string): boolean {
    return !!this.get(field).value;
  }

  reset(form: FormGroup): void {
    form.reset();
    Object.keys(form.controls).forEach(key => {
      (form.get(key) as AbstractControl).setErrors(null);
    });
  }

  changeValidators(items: {
    fieldName: string,
    emitEventValidators?: boolean,
    validators: { emitEvent?: boolean, remove?: boolean, validator: ValidatorFn }[]
  }[], form: FormGroup): void {
    items.forEach(it => {

      const formControl = form.get(it.fieldName) as AbstractControl;

      it.validators.forEach(v => {
        if (v.remove) {
          formControl.removeValidators(v.validator);
        } else {
          formControl.addValidators(v.validator);
        }

        if (v.emitEvent) {
          formControl.updateValueAndValidity();
        }
      });

      if (it.emitEventValidators) {
        formControl?.updateValueAndValidity();
      }
    });
  }
}

