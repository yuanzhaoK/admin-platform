import { pocketbaseClient } from "../../config/pocketbase.ts";
import { BatchOperationResult, PaginationInfo } from "../../types/base.ts";
import {
  Member,
  MemberInput,
  MemberLevel,
  MemberLevelInput,
  MemberLevelUpdateInput,
  MemberQueryInput,
  MemberStats,
  MemberUpdateInput,
} from "../../types/member.ts";

// 类型转换辅助函数
const toMember = (record: any): Member => record as unknown as Member;
const toMemberLevel = (record: any): MemberLevel =>
  record as unknown as MemberLevel;
const toMemberLevelArray = (records: any[]): MemberLevel[] =>
  records as unknown as MemberLevel[];

export const memberResolvers = {
  Query: {
    members: async (
      parent: any,
      { input }: { input?: MemberQueryInput }
    ): Promise<{ items: Member[]; pagination: PaginationInfo }> => {
      const {
        page = 1,
        perPage = 20,
        search,
        status,
        level_id,
        gender,
        register_date_start,
        register_date_end,
        sortBy = "register_time",
        sortOrder = "desc",
      } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        let filter = "";
        const filterParams: string[] = [];

        if (search) {
          filterParams.push(
            `(username ~ "${search}" || email ~ "${search}" || real_name ~ "${search}")`
          );
        }

        if (status) {
          filterParams.push(`status = "${status}"`);
        }

        if (level_id) {
          filterParams.push(`level_id = "${level_id}"`);
        }

        if (gender) {
          filterParams.push(`gender = "${gender}"`);
        }

        if (register_date_start) {
          filterParams.push(`register_time >= "${register_date_start}"`);
        }

        if (register_date_end) {
          filterParams.push(`register_time <= "${register_date_end}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(" && ");
        }

        const result = await pb.collection("members").getList(page, perPage, {
          filter,
          sort: sortOrder === "desc" ? `-${sortBy}` : sortBy,
          expand: "level_id",
        });
        const levels = await pb.collection("member_levels").getFullList();
        const items: Member[] = result.items.map((item: any) => ({
          ...item,
          level: levels.find((level: any) => level.id === item.level_id) || null,
        }));

        return {
          items,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages,
          },
        };
      } catch (error) {
        console.error("Error fetching members:", error);
        throw new Error("Failed to fetch members");
      }
    },

    member: async (
      parent: any,
      { id }: { id: string }
    ): Promise<Member | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const result = await pb.collection("members").getOne(id, {
          expand: "level_id",
        });

        return {
          ...result,
          level: result.expand?.level_id || null,
        } as unknown as Member;
      } catch (error) {
        console.error("Error fetching member:", error);
        return null;
      }
    },

    memberLevels: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: MemberLevel[]; pagination: PaginationInfo }> => {
      const {
        page = 1,
        perPage = 20,
        search,
        sortBy = "sort_order",
        sortOrder = "asc",
      } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        let filter = "";
        if (search) {
          filter = `name ~ "${search}"`;
        }

        const result = await pb
          .collection("member_levels")
          .getList(page, perPage, {
            filter,
            sort: sortOrder === "desc" ? `-${sortBy}` : sortBy,
          });

        return {
          items: result.items as unknown as MemberLevel[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages,
          },
        };
      } catch (error) {
        console.error("Error fetching member levels:", error);
        throw new Error("Failed to fetch member levels");
      }
    },

    memberLevel: async (
      parent: any,
      { id }: { id: string }
    ): Promise<MemberLevel | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const result = await pb.collection("member_levels").getOne(id);
        return result as unknown as MemberLevel;
      } catch (error) {
        console.error("Error fetching member level:", error);
        return null;
      }
    },

    memberStats: async (): Promise<MemberStats> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        // 获取会员统计信息
        const totalMembers = await pb
          .collection("members")
          .getList(1, 1, { filter: "" });
        const activeMembers = await pb
          .collection("members")
          .getList(1, 1, { filter: 'status = "active"' });
        const inactiveMembers = await pb
          .collection("members")
          .getList(1, 1, { filter: 'status = "inactive"' });
        const bannedMembers = await pb
          .collection("members")
          .getList(1, 1, { filter: 'status = "banned"' });

        // 获取积分和余额统计
        const membersWithStats = await pb
          .collection("members")
          .getList(1, 1000, {
            fields: "points,balance,level_id",
          });

        const totalPoints = membersWithStats.items.reduce(
          (sum: number, member: any) => sum + (member.points || 0),
          0
        );
        const totalBalance = membersWithStats.items.reduce(
          (sum: number, member: any) => sum + (member.balance || 0),
          0
        );

        // 等级分布统计
        const levelDistribution: Record<string, number> = {};
        membersWithStats.items.forEach((member: any) => {
          const levelId = member.level_id || "unknown";
          levelDistribution[levelId] = (levelDistribution[levelId] || 0) + 1;
        });

        // 获取等级详细信息用于分布统计
        const levels = await pb.collection("member_levels").getFullList();
        const levelDistributionWithNames: Record<string, { count: number; name: string }> = {};
        
        levels.forEach((level: any) => {
          levelDistributionWithNames[level.id] = {
            count: levelDistribution[level.id] || 0,
            name: level.name
          };
        });
        
        // 添加未知等级
        if (levelDistribution["unknown"]) {
          levelDistributionWithNames["unknown"] = {
            count: levelDistribution["unknown"],
            name: "未设置等级"
          };
        }

        // 本月新增会员
        const currentMonth = new Date().toISOString().slice(0, 7);
        const newMembersThisMonth = await pb
          .collection("members")
          .getList(1, 1, {
            filter: `register_time >= "${currentMonth}-01"`,
          });

        return {
          total: totalMembers.totalItems,
          active: activeMembers.totalItems,
          inactive: inactiveMembers.totalItems,
          banned: bannedMembers.totalItems,
          totalPoints,
          totalBalance,
          levelDistribution: levelDistributionWithNames,
          newMembersThisMonth: newMembersThisMonth.totalItems,
        };
      } catch (error) {
        console.error("Error fetching member stats:", error);
        throw new Error("Failed to fetch member stats");
      }
    },
  },

  Mutation: {
    createMember: async (
      parent: any,
      { input }: { input: MemberInput }
    ): Promise<Member> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const memberData = {
          ...input,
          register_time: new Date().toISOString(),
          total_orders: input.total_orders || 0,
          total_amount: input.total_amount || 0,
          points: input.points || 0,
          balance: input.balance || 0,
        };

        const result = await pb.collection("members").create(memberData);
        const member = await pb.collection("members").getOne(result.id, {
          expand: "level_id",
        });

        return {
          ...member,
          level: member.expand?.level_id || null,
        } as unknown as Member;
      } catch (error) {
        console.error("Error creating member:", error);
        throw new Error("Failed to create member");
      }
    },

    updateMember: async (
      parent: any,
      { id, input }: { id: string; input: MemberUpdateInput }
    ): Promise<Member> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const result = await pb.collection("members").update(id, input);
        const member = await pb.collection("members").getOne(result.id, {
          expand: "level_id",
        });

        return {
          ...member,
          level: member.expand?.level_id || null,
        } as unknown as Member;
      } catch (error) {
        console.error("Error updating member:", error);
        throw new Error("Failed to update member");
      }
    },

    deleteMember: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        await pb.collection("members").delete(id);
        return true;
      } catch (error) {
        console.error("Error deleting member:", error);
        return false;
      }
    },

    batchDeleteMembers: async (
      parent: any,
      { ids }: { ids: string[] }
    ): Promise<BatchOperationResult> => {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();

      let successCount = 0;
      let failureCount = 0;
      const errors: string[] = [];

      for (const id of ids) {
        try {
          await pb.collection("members").delete(id);
          successCount++;
        } catch (error) {
          failureCount++;
          errors.push(`Failed to delete member ${id}: ${error}`);
        }
      }

      return {
        success: failureCount === 0,
        message: `Successfully deleted ${successCount} members, failed ${failureCount}`,
        successCount,
        failureCount,
        errors,
      };
    },

    createMemberLevel: async (
      parent: any,
      { input }: { input: MemberLevelInput }
    ): Promise<MemberLevel> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const result = await pb.collection("member_levels").create(input);
        return result as unknown as MemberLevel;
      } catch (error) {
        console.error("Error creating member level:", error);
        throw new Error("Failed to create member level");
      }
    },

    updateMemberLevel: async (
      parent: any,
      { id, input }: { id: string; input: MemberLevelUpdateInput }
    ): Promise<MemberLevel> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const result = await pb.collection("member_levels").update(id, input);
        return result as unknown as MemberLevel;
      } catch (error) {
        console.error("Error updating member level:", error);
        throw new Error("Failed to update member level");
      }
    },

    deleteMemberLevel: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        await pb.collection("member_levels").delete(id);
        return true;
      } catch (error) {
        console.error("Error deleting member level:", error);
        return false;
      }
    },

    adjustMemberPoints: async (
      parent: any,
      { id, points, reason }: { id: string; points: number; reason: string }
    ): Promise<Member> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const member = await pb.collection("members").getOne(id);
        const newPoints = member.points + points;

        // 更新会员积分
        await pb.collection("members").update(id, {
          points: newPoints,
        });

        // 记录积分变动
        await pb.collection("points_records").create({
          user_id: id,
          username: member.username,
          type: points > 0 ? "earned_admin" : "admin_adjust",
          points: points,
          balance: newPoints,
          reason: reason,
        });

        const updatedMember = await pb.collection("members").getOne(id, {
          expand: "level_id",
        });

        return {
          ...updatedMember,
          level: updatedMember.expand?.level_id || null,
        } as unknown as Member;
      } catch (error) {
        console.error("Error adjusting member points:", error);
        throw new Error("Failed to adjust member points");
      }
    },

    adjustMemberBalance: async (
      parent: any,
      { id, amount, reason }: { id: string; amount: number; reason: string }
    ): Promise<Member> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const member = await pb.collection("members").getOne(id);
        const newBalance = member.balance + amount;

        // 更新会员余额
        await pb.collection("members").update(id, {
          balance: newBalance,
        });

        // 记录余额变动
        await pb.collection("balance_records").create({
          user_id: id,
          username: member.username,
          type: "admin_adjust",
          amount: amount,
          balance: newBalance,
          reason: reason,
        });

        const updatedMember = await pb.collection("members").getOne(id, {
          expand: "level_id",
        });

        return {
          ...updatedMember,
          level: updatedMember.expand?.level_id || null,
        } as unknown as Member;
      } catch (error) {
        console.error("Error adjusting member balance:", error);
        throw new Error("Failed to adjust member balance");
      }
    },

    // 导出会员数据
    exportMembers: async (
      parent: any,
      { input }: { input?: MemberQueryInput }
    ): Promise<string> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        // 获取所有会员数据（不分页）
        const { search, status, level_id, gender, register_date_start, register_date_end } = input || {};
        
        let filter = "";
        const filterParams: string[] = [];

        if (search) {
          filterParams.push(
            `(username ~ "${search}" || email ~ "${search}" || real_name ~ "${search}")`
          );
        }
        if (status) filterParams.push(`status = "${status}"`);
        if (level_id) filterParams.push(`level_id = "${level_id}"`);
        if (gender) filterParams.push(`gender = "${gender}"`);
        if (register_date_start) filterParams.push(`register_time >= "${register_date_start}"`);
        if (register_date_end) filterParams.push(`register_time <= "${register_date_end}"`);

        if (filterParams.length > 0) {
          filter = filterParams.join(" && ");
        }

        const members = await pb.collection("members").getFullList({
          filter,
          expand: "level_id",
        });

        // 转换为CSV格式
        const headers = [
          "ID", "用户名", "邮箱", "手机号", "真实姓名", "性别", "生日",
          "会员等级", "积分", "余额", "状态", "注册时间", "最后登录", 
          "总订单数", "总消费金额", "创建时间", "更新时间"
        ];

        const csvRows = [headers.join(",")];
        
        members.forEach((member: any) => {
          const row = [
            member.id,
            member.username || "",
            member.email || "",
            member.phone || "",
            member.real_name || "",
            member.gender || "",
            member.birthday || "",
            member.expand?.level_id?.name || "",
            member.points || 0,
            member.balance || 0,
            member.status || "",
            member.register_time || "",
            member.last_login_time || "",
            member.total_orders || 0,
            member.total_amount || 0,
          ];
          csvRows.push(row.join(","));
        });

        return csvRows.join("\n");
      } catch (error) {
        console.error("Error exporting members:", error);
        throw new Error("Failed to export members");
      }
    },

    // 批量导入会员
    importMembers: async (
      parent: any,
      { csvData }: { csvData: string }
    ): Promise<BatchOperationResult> => {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();

      let successCount = 0;
      let failureCount = 0;
      const errors: string[] = [];

      try {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        // 验证CSV格式
        const requiredHeaders = ['用户名', '邮箱', '会员等级', '状态'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          throw new Error(`缺少必要的列: ${missingHeaders.join(', ')}`);
        }

        // 获取所有等级信息用于匹配
        const levels = await pb.collection("member_levels").getFullList();
        const levelMap = new Map();
        levels.forEach((level: any) => {
          levelMap.set(level.name, level.id);
        });

        // 处理数据行
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const values = line.split(',');
            const memberData: any = {};

            headers.forEach((header, index) => {
              const value = values[index]?.trim();
              switch (header) {
                case '用户名':
                  memberData.username = value;
                  break;
                case '邮箱':
                  memberData.email = value;
                  break;
                case '手机号':
                  memberData.phone = value;
                  break;
                case '真实姓名':
                  memberData.real_name = value;
                  break;
                case '性别':
                  memberData.gender = value;
                  break;
                case '生日':
                  memberData.birthday = value;
                  break;
                case '会员等级':
                  memberData.level_id = levelMap.get(value) || null;
                  break;
                case '积分':
                  memberData.points = parseInt(value) || 0;
                  break;
                case '余额':
                  memberData.balance = parseFloat(value) || 0;
                  break;
                case '状态':
                  memberData.status = value;
                  break;
              }
            });

            // 验证必要字段
            if (!memberData.username || !memberData.email || !memberData.status) {
              throw new Error(`第${i + 1}行：缺少必要字段`);
            }

            // 设置默认值
            memberData.register_time = new Date().toISOString();
            memberData.total_orders = 0;
            memberData.total_amount = 0;

            await pb.collection("members").create(memberData);
            successCount++;
          } catch (error) {
            failureCount++;
            errors.push(`第${i + 1}行: ${error}`);
          }
        }

        return {
          success: failureCount === 0,
          message: `成功导入 ${successCount} 个会员，失败 ${failureCount} 个`,
          successCount,
          failureCount,
          errors,
        };
      } catch (error) {
        console.error("Error importing members:", error);
        throw new Error(`导入失败: ${error}`);
      }
    },
  },
};
