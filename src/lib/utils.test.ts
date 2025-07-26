import { cn } from "./utils";

describe("Utils", () => {
  describe("cn function", () => {
    it("should merge classes correctly", () => {
      const result = cn("text-red-500", "bg-blue-200");
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-200");
    });

    it("should handle undefined and null values", () => {
      const result = cn("text-red-500", undefined, null, "bg-blue-200");
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-200");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
    });

    it("should not include false conditional classes", () => {
      const isActive = false;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("base-class");
      expect(result).not.toContain("active-class");
    });
  });
});
