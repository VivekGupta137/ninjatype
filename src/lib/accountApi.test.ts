import { expect, test } from "bun:test";
import { validateCredentials } from "./accountApi";

test("validates sign-in and sign-up forms", () => {
    expect(validateCredentials({ email: "a@b.co", password: "long enough pass" }, "signIn")).toBeNull();
    expect(validateCredentials({ email: "nope", password: "long enough pass" }, "signIn")).toMatch(/valid email/);
    expect(validateCredentials({ email: "a@b.co", password: "short" }, "signIn")).toMatch(/at least 10/);
    expect(validateCredentials({ email: "a@b.co", password: "long enough pass", name: " " }, "signUp")).toMatch(/display name/);
    expect(validateCredentials({ email: "a@b.co", password: "x".repeat(129) }, "signIn")).toMatch(/at most 128/);
});
