import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";

// 共有セッションを管理するマップ
const sharedSessions = new Map<string, { items: any[]; updatedAt: number }>();

// 定期的に古いセッションを削除（24時間以上アクセスなし）
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24時間
  
  const entriesToDelete: string[] = [];
  sharedSessions.forEach((session, sessionId) => {
    if (now - session.updatedAt > maxAge) {
      entriesToDelete.push(sessionId);
    }
  });
  
  entriesToDelete.forEach(sessionId => {
    sharedSessions.delete(sessionId);
    console.log(`[SharedSession] Deleted expired session: ${sessionId}`);
  });
}, 60 * 60 * 1000); // 1時間ごとにチェック

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  items: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getUserItems(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        id: z.string(),
        brand: z.string().optional(),
        collab: z.string().optional(),
        season: z.string().optional(),
        model: z.string().optional(),
        feature: z.string().optional(),
        item: z.string().optional(),
        cost: z.number().default(0),
        price: z.number().default(0),
        size: z.string().optional(),
        color: z.string().optional(),
        rank: z.string().optional(),
        accessories: z.string().optional(),
        number: z.string().optional(),
        date: z.string().optional(),
        shop: z.string().optional(),
        category: z.string().optional(),
        buyer: z.string().optional(),
        buyerComment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => db.createItem(ctx.user.id, input)),
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        updates: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ ctx, input }) => db.updateItem(ctx.user.id, input.id, input.updates)),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => db.deleteItem(ctx.user.id, input.id)),
    deleteAll: protectedProcedure
      .mutation(async ({ ctx }) => db.deleteAllUserItems(ctx.user.id)),
  }),

  // 共有セッション機能
  shared: router({
    // 新しい共有セッションを作成
    createSession: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          id: z.string(),
          brand: z.string().optional(),
          collab: z.string().optional(),
          season: z.string().optional(),
          model: z.string().optional(),
          feature: z.string().optional(),
          item: z.string().optional(),
          cost: z.number().default(0),
          price: z.number().default(0),
          size: z.string().optional(),
          color: z.string().optional(),
          rank: z.string().optional(),
          accessories: z.string().optional(),
          number: z.string().optional(),
          date: z.string().optional(),
          shop: z.string().optional(),
          category: z.string().optional(),
          buyer: z.string().optional(),
          buyerComment: z.string().optional(),
        })),
      }))
      .mutation(({ input }) => {
        const sessionId = nanoid(8);
        sharedSessions.set(sessionId, {
          items: input.items,
          updatedAt: Date.now(),
        });
        console.log(`[SharedSession] Created session: ${sessionId}`);
        return { sessionId };
      }),

    // 共有セッションのデータを取得
    getSession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(({ input }) => {
        const session = sharedSessions.get(input.sessionId);
        if (!session) {
          return null;
        }
        // アクセス時刻を更新
        session.updatedAt = Date.now();
        return { items: session.items };
      }),

    // 共有セッションのデータを更新
    updateSession: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        items: z.array(z.object({
          id: z.string(),
          brand: z.string().optional(),
          collab: z.string().optional(),
          season: z.string().optional(),
          model: z.string().optional(),
          feature: z.string().optional(),
          item: z.string().optional(),
          cost: z.number().default(0),
          price: z.number().default(0),
          size: z.string().optional(),
          color: z.string().optional(),
          rank: z.string().optional(),
          accessories: z.string().optional(),
          number: z.string().optional(),
          date: z.string().optional(),
          shop: z.string().optional(),
          category: z.string().optional(),
          buyer: z.string().optional(),
          buyerComment: z.string().optional(),
        })),
      }))
      .mutation(({ input }) => {
        const session = sharedSessions.get(input.sessionId);
        if (!session) {
          return { success: false, error: "Session not found" };
        }
        session.items = input.items;
        session.updatedAt = Date.now();
        console.log(`[SharedSession] Updated session: ${input.sessionId}`);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
