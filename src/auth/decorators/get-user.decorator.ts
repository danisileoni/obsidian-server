import {
  type ExecutionContext,
  createParamDecorator,
  BadRequestException,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new BadRequestException('User not found (request)');
    }

    return !data ? user : user[data];
  },
);
