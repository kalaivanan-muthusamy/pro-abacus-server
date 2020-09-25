import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const authorizedRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!authorizedRoles) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (authorizedRoles.includes(user.role)) return true;
    return false;
  }
}

const config = {
  examId: '',
  questionId: '',
  studentId: '',
  teacherId: '',
  givenAnswer: '',
  answer: '',
  isCorrectAnswer: '',
  serverTime: '',
};
