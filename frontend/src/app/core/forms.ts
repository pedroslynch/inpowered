import { AbstractControl } from '@angular/forms';

/** A field shows its error once the user has left it (or tried to submit) with an invalid value. */
export function showsError(control: AbstractControl): boolean {
  return control.invalid && control.touched;
}
