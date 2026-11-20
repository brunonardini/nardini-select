import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentType } from 'react';
import { expect, within } from 'storybook/test';

import { Button } from '@/components/button/button';

import { PageHeader } from './page-header';

function frame(width: number) {
  return function Frame(Story: ComponentType) {
    return (
      <div style={{ containerType: 'inline-size', width }}>
        <Story />
      </div>
    );
  };
}

const meta = {
  title: 'Layout/Page Header',
  component: PageHeader,
  args: { title: 'Usuários' },
  parameters: {
    docs: {
      description: {
        component:
          'Listing page heading. Karvest steps from 27px to 36px with the width of the nearest container. An optional action sits on the right and wraps below the title on a narrow row.',
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Title: Story = {
  decorators: [frame(400)],
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', {
      level: 1,
      name: 'Usuários',
    });
    await expect(heading).toBeVisible();
    await expect(getComputedStyle(heading).fontSize).toBe('27px');
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const WithAction: Story = {
  args: { action: <Button type="button">Convidar usuário</Button> },
  decorators: [frame(800)],
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', {
      name: 'Usuários',
    });
    const button = within(canvasElement).getByRole('button', {
      name: 'Convidar usuário',
    });
    await expect(heading.compareDocumentPosition(button)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    await expect(getComputedStyle(heading).fontSize).toBe('34px');
  },
};

/** The action wraps under the title when the container is narrow. */
export const Narrow: Story = {
  ...WithAction,
  decorators: [frame(280)],
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', {
      name: 'Usuários',
    });
    const button = within(canvasElement).getByRole('button', {
      name: 'Convidar usuário',
    });
    await expect(getComputedStyle(heading).fontSize).toBe('27px');
    await expect(button.getBoundingClientRect().top).toBeGreaterThan(
      heading.getBoundingClientRect().bottom - 1,
    );
  },
};

export const Wide: Story = {
  decorators: [frame(1000)],
  play: async ({ canvasElement }) => {
    await expect(
      getComputedStyle(
        within(canvasElement).getByRole('heading', { name: 'Usuários' }),
      ).fontSize,
    ).toBe('36px');
  },
};
