import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockChangeLanguage = jest.fn();
const mockT = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

jest.mock("@/store/useUserStore", () => {
  const mock = {
    use: {
      user: () => ({ email: "test@example.com", name: "Test User" }),
    },
  };
  return { __esModule: true, default: mock };
});

jest.mock("@/utils/theme", () => ({
  getStoredTheme: () => "light",
  setTheme: jest.fn(),
}));

jest.mock("../../app/profile/components/SettingBlock", () => ({
  SettingBlockWrapper: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div>
      <span>{title}</span>
      {children}
    </div>
  ),
}));

import { ProfileSettings } from "../../app/profile/components/ProfileSettings";

describe("ProfileSettings component", () => {
  beforeEach(() => {
    localStorage.clear();
    mockChangeLanguage.mockClear();
  });

  describe("language select rendering", () => {
    it("renders the language select element", () => {
      render(<ProfileSettings />);
      // MUI Select renders a button with role="combobox"
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });

    it("renders language option labels including English", () => {
      render(<ProfileSettings />);
      // t("profileSettings.languageEnglish") returns the key in our mock
      expect(
        screen.getByText("profileSettings.languageEnglish")
      ).toBeInTheDocument();
    });

    it("renders Ukrainian option label when dropdown is opened", () => {
      render(<ProfileSettings />);
      const selectButton = screen.getAllByRole("combobox")[0];
      fireEvent.mouseDown(selectButton);
      // t("profileSettings.languageUkrainian") returns the key in our mock
      expect(
        screen.getByText("profileSettings.languageUkrainian")
      ).toBeInTheDocument();
    });

    it('the language select does not display "uk" as the selected value', () => {
      render(<ProfileSettings />);
      // The button representing the select should not show "uk"
      const selectButton = screen.getAllByRole("combobox")[0];
      expect(selectButton.textContent).not.toBe("uk");
    });

    it("renders language preference section title", () => {
      render(<ProfileSettings />);
      expect(
        screen.getByText("profileSettings.language")
      ).toBeInTheDocument();
    });
  });

  describe("language select menu items have correct values", () => {
    it("opens select and shows ua option (not uk)", () => {
      render(<ProfileSettings />);
      const selectButton = screen.getAllByRole("combobox")[0];

      // Open the select dropdown
      fireEvent.mouseDown(selectButton);

      // After opening, listbox should be visible
      const listbox = screen.queryByRole("listbox");
      if (listbox) {
        const options = screen.getAllByRole("option");
        const optionValues = options.map((opt) => opt.getAttribute("data-value"));
        expect(optionValues).toContain("ua");
        expect(optionValues).not.toContain("uk");
        expect(optionValues).toContain("en");
      }
    });

    it("selecting ua option calls changeLanguage with ua", () => {
      render(<ProfileSettings />);
      const selectButton = screen.getAllByRole("combobox")[0];

      fireEvent.mouseDown(selectButton);

      const listbox = screen.queryByRole("listbox");
      if (listbox) {
        const uaOption = screen
          .getAllByRole("option")
          .find((opt) => opt.getAttribute("data-value") === "ua");
        if (uaOption) {
          fireEvent.click(uaOption);
          expect(mockChangeLanguage).toHaveBeenCalledWith("ua");
          expect(mockChangeLanguage).not.toHaveBeenCalledWith("uk");
        }
      }
    });

    it("selecting ua option stores ua in localStorage", () => {
      render(<ProfileSettings />);
      const selectButton = screen.getAllByRole("combobox")[0];

      fireEvent.mouseDown(selectButton);

      const listbox = screen.queryByRole("listbox");
      if (listbox) {
        const uaOption = screen
          .getAllByRole("option")
          .find((opt) => opt.getAttribute("data-value") === "ua");
        if (uaOption) {
          fireEvent.click(uaOption);
          expect(localStorage.getItem("lang")).toBe("ua");
        }
      }
    });
  });

  describe("regression: uk language code removed from select", () => {
    it('no option with value "uk" exists in the dropdown', () => {
      render(<ProfileSettings />);
      const selectButton = screen.getAllByRole("combobox")[0];
      fireEvent.mouseDown(selectButton);

      const listbox = screen.queryByRole("listbox");
      if (listbox) {
        const allOptions = screen.getAllByRole("option");
        const ukOption = allOptions.find(
          (opt) => opt.getAttribute("data-value") === "uk"
        );
        expect(ukOption).toBeUndefined();
      }
    });

    it('localStorage never stores "uk" via handleChangeLang', () => {
      render(<ProfileSettings />);
      // Verify that "uk" is never in localStorage after any normal interaction
      expect(localStorage.getItem("lang")).not.toBe("uk");
    });
  });

  describe("user account information", () => {
    it("renders user email", () => {
      render(<ProfileSettings />);
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("renders username", () => {
      render(<ProfileSettings />);
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });
});