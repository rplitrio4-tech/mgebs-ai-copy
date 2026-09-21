import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;

describe("workspace and marketplace validation", () => {
  it("rejects a marketplace skill without a title", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.marketplace.publish({ visitorId: "visitor-test-123", title: "", content: "instructions", visibility: "public" })).rejects.toThrow();
  });
});
