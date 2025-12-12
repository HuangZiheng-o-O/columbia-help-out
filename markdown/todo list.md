# 未实现/硬编码清单

## 前端
- [ ] `src/App.tsx`：`CURRENT_USER_UID='mock-user-1'` 依赖假用户，未接入真实登录；`handleSidebarNavigate` 对除 discover/tasks 以外的路由直接弹窗占位；创建任务后返回列表但不会重新拉取任务数据。
- [ ] `src/components/layout/Sidebar.tsx`：左下角头像与用户名固定为 “J / Jordan Lee”，未与实际用户信息绑定。
- [ ] `src/components/tasks/TaskCard.tsx`：认领按钮调用 `updateTaskStatus` 时将 `claimedByUid` 硬编码为 `mock-user-1`，且仅弹窗不刷新列表/跳转；复制邮箱的回退逻辑依赖假邮箱。
- [ ] `src/components/tasks/PlazaDetailPage.tsx`：认领同样使用硬编码用户；Publisher Reputation 区块数值（23 次完成、5% 取消）为静态展示，没有后端数据支撑。
- [ ] `src/components/tasks/MyClaimedDetailPage.tsx`：`currentUid` 默认 mock；“Mark as Done” 实际仍提交状态 `claimed`，未触发结算或完成流程；复制邮箱同样依赖假邮箱。
- [ ] `src/components/tasks/TaskSettlementPage.tsx`：发布者/接单者姓名硬编码为 “Andy Zhang / Jack M”，状态文字固定 “Unsettled”；“Mark as Done” 按钮无任何事件，未对接后端；复制邮箱用假邮箱回退。
- [ ] `src/components/tasks/TaskListManagePage.tsx`：列表与操作均基于 `currentUserUid='mock-user-1'`，未与真实身份/鉴权绑定。
- [ ] `src/components/tasks/CreateTaskPage.tsx`：可用积分 `availableCredits=80` 硬编码并带 TODO 注释，未读取真实余额；发布成功后仅调用回调返回列表，不会触发任务重新拉取；地点建议完全是前端静态表。
- [ ] `src/App.tsx` + 排序：当选择 “Nearest” 时前端按静态地理表计算，但后端未实现 `nearest` 排序，前后端排序逻辑不一致。

## 后端
- [ ] `backend/src/routes/taskRoutes.ts`：创建与状态更新均使用硬编码的 `currentUid='mock-user-1'`、邮箱 `jordan@columbia.edu`，未接入鉴权/用户体系；缺少对真实用户身份与权限的校验。
- [ ] `backend/src/taskService.ts`：`listTasks` 的 `nearest` 排序直接回退为 newest（注释“nearest 未实现”）；`updateTaskStatus` 的 `actorUid` 也来自硬编码；`createTask` 未校验发布者可用积分等业务约束。
- [ ] `backend/src/db.ts`：数据库连接参数默认本地 `root`/空密码/`columbia_help_out`，属于硬编码配置，未通过环境安全管理。
