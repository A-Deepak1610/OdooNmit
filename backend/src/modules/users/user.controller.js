import { userService } from './user.service.js';
import { asyncHandler } from '../../utils/async-handler.js';

export const userController = {
  getProfile: asyncHandler(async (req, res) => {
    const targetUserId = req.params.id || req.user.id;
    const profile = await userService.getProfile(targetUserId);

    res.status(200).json({
      status: 'success',
      data: { user: profile },
    });
  }),

  getUserRoles: asyncHandler(async (req, res) => {
    const targetUserId = req.params.id || req.user.id;
    const roles = await userService.getRoles(targetUserId);

    res.status(200).json({
      status: 'success',
      data: { userId: targetUserId, roles },
    });
  }),

  assignRole: asyncHandler(async (req, res) => {
    const targetUserId = req.params.id;
    const { role } = req.body;
    const result = await userService.assignRole(targetUserId, role);

    res.status(200).json({
      status: 'success',
      message: `Role ${role} assigned successfully`,
      data: result,
    });
  }),

  removeRole: asyncHandler(async (req, res) => {
    const { id: targetUserId, role } = req.params;
    const result = await userService.removeRole(targetUserId, role);

    res.status(200).json({
      status: 'success',
      message: `Role ${role} removed successfully`,
      data: result,
    });
  }),
};
