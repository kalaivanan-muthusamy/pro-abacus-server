import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNumberString', async: false })
export class IsNumberString implements ValidatorConstraintInterface {
  validate(text: number, args: ValidationArguments): boolean {
    if (typeof text === 'number') return true;
    if (typeof text === 'string') return !isNaN(text);
    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be number or number string`;
  }
}
