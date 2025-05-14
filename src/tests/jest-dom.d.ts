
/// <reference types="vitest" />
import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface Assertion {
      toBeInTheDocument(): void;
      toHaveValue(value: unknown): void;
      toHaveClass(...classNames: string[]): void;
      // Add other matchers as needed
      toBeVisible(): void;
      toBeChecked(): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toBeEmpty(): void;
      toBeEmptyDOMElement(): void;
      toBePartiallyChecked(): void;
      toBeRequired(): void;
      toBeValid(): void;
      toContainElement(element: HTMLElement | null): void;
      toContainHTML(htmlText: string): void;
      toHaveAccessibleDescription(description?: string): void;
      toHaveAccessibleName(name?: string): void;
      toHaveAttribute(attr: string, value?: any): void;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): void;
      toHaveFocus(): void;
      toHaveFormValues(values: Record<string, any>): void;
      toHaveStyle(css: Record<string, any>): void;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): void;
    }
  }
}
