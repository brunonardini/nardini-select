import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SiteHeader } from './site-header';

const meta = {
  title: 'Components/SiteHeader',
  component: SiteHeader,
  // The header sits on the hero: off-white on the left, café on the right.
  decorators: [
    (Story) => (
      <div className="hero section">
        <Story />
        <div className="hero-panel" />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Logo and main navigation (Base UI `NavigationMenu`). Above 1280px the links show inline on the café panel; up to 1280px a toggle opens them in a panel under the header. Escape, a click outside, or choosing a link closes it.',
      },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const openMenu = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const toggle = canvas.getByRole('button', { name: 'Abrir menu' });
  await userEvent.click(toggle);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(
    await canvas.findByRole('link', { name: 'Nossa seleção' }),
  ).toBeVisible();
  return toggle;
};

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'A marca' })).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Abrir menu' }),
    ).not.toBeInTheDocument();
  },
};

/** Keyboard focus on the first navigation link. */
export const DesktopFocused: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.tab();
    await expect(
      within(canvasElement).getByRole('link', { name: 'A marca' }),
    ).toHaveFocus();
  },
};

/** Between 1101px and 1280px the links would overflow the café panel. */
export const NarrowDesktopMenuOpen: Story = {
  globals: { viewport: { value: 'narrowDesktop' } },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
  },
};

export const MobileMenuClosed: Story = {
  globals: { viewport: { value: 'mobile' } },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('button', {
      name: 'Abrir menu',
    });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  },
};

export const MobileMenuOpen: Story = {
  globals: { viewport: { value: 'mobile' } },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
  },
};

/** Escape closes the menu and puts focus back on the toggle. */
export const MobileMenuClosedWithEscape: Story = {
  globals: { viewport: { value: 'mobile' } },
  play: async ({ canvasElement }) => {
    const toggle = await openMenu(canvasElement);
    await userEvent.keyboard('{Escape}');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveFocus();
  },
};
