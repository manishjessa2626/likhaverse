import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { ROLE_HIERARCHY } from "@likhaverse/shared"

export const ROLES_KEY = "roles"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) return false

    const userLevel = ROLE_HIERARCHY[user.role] ?? -1
    return requiredRoles.some((role) => ROLE_HIERARCHY[role] !== undefined && userLevel >= ROLE_HIERARCHY[role])
  }
}
