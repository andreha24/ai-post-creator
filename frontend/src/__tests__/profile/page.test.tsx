import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock Next.js navigation hooks
const mockPush = jest.fn();
let mockSearchParamsValue: Record<string, string | null> = {};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsValue[key] ?? null,
    toString: () =>
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(mockSearchParamsValue).filter(
            ([, v]) => v !== null
          ) as [string, string][]
        )
      ).toString(),
  }),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", resolvedLanguage: "en", changeLanguage: jest.fn() },
  }),
}));

// Mock child components to keep tests focused
jest.mock("../../app/profile/components/ProfileSettings", () => ({
  ProfileSettings: () => <div data-testid="profile-settings" />,
}));

jest.mock("../../app/profile/components/PostsHistory", () => ({
  PostsHistory: () => <div data-testid="posts-history" />,
}));

// Mock MUI icons used in TABS array (JSX in module scope)
jest.mock("@mui/icons-material/Settings", () => () => (
  <span data-testid="settings-icon" />
));
jest.mock("@mui/icons-material/History", () => () => (
  <span data-testid="history-icon" />
));

import Profile from "../../app/profile/page";

describe("Profile page", () => {
  beforeEach(() => {
    mockSearchParamsValue = {};
    mockPush.mockClear();
  });

  describe("initialTab logic", () => {
    it('defaults to "settings" tab when no tab param is present', () => {
      mockSearchParamsValue = {};
      render(<Profile />);
      expect(screen.getByTestId("profile-settings")).toBeInTheDocument();
    });

    it('shows "settings" tab content when tab param is "settings"', () => {
      mockSearchParamsValue = { tab: "settings" };
      render(<Profile />);
      expect(screen.getByTestId("profile-settings")).toBeInTheDocument();
    });

    it('shows "history" tab content when tab param is "history"', () => {
      mockSearchParamsValue = { tab: "history" };
      render(<Profile />);
      expect(screen.getByTestId("posts-history")).toBeInTheDocument();
    });

    it('defaults to "settings" when tab param is an invalid value', () => {
      mockSearchParamsValue = { tab: "invalid-tab" };
      render(<Profile />);
      expect(screen.getByTestId("profile-settings")).toBeInTheDocument();
    });

    it('defaults to "settings" when tab param is empty string', () => {
      mockSearchParamsValue = { tab: "" };
      render(<Profile />);
      expect(screen.getByTestId("profile-settings")).toBeInTheDocument();
    });
  });

  describe("tab rendering", () => {
    it("renders both tabs", () => {
      render(<Profile />);
      // Tab labels are uppercased translation keys
      expect(
        screen.getByText("profile.settings".toUpperCase())
      ).toBeInTheDocument();
      expect(
        screen.getByText("profile.history".toUpperCase())
      ).toBeInTheDocument();
    });

    it("tab labels are uppercased", () => {
      render(<Profile />);
      const settingsLabel = screen.getByText("PROFILE.SETTINGS");
      const historyLabel = screen.getByText("PROFILE.HISTORY");
      expect(settingsLabel).toBeInTheDocument();
      expect(historyLabel).toBeInTheDocument();
    });
  });

  describe("displayActiveTab", () => {
    it("renders ProfileSettings and not PostsHistory for settings tab", () => {
      mockSearchParamsValue = { tab: "settings" };
      render(<Profile />);
      expect(screen.getByTestId("profile-settings")).toBeInTheDocument();
      expect(screen.queryByTestId("posts-history")).not.toBeInTheDocument();
    });

    it("renders PostsHistory and not ProfileSettings for history tab", () => {
      mockSearchParamsValue = { tab: "history" };
      render(<Profile />);
      expect(screen.getByTestId("posts-history")).toBeInTheDocument();
      expect(screen.queryByTestId("profile-settings")).not.toBeInTheDocument();
    });
  });
});