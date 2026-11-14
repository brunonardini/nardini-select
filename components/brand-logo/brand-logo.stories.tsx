import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BrandLogo } from './brand-logo';

const meta = {
  title: 'Components/BrandLogo',
  component: BrandLogo,
  args: { label: 'Voltar ao início', sizes: '200px' },
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal logo linking to the top of the page. Keep the protection area (the height of SELECT) clear around it.',
      },
    },
  },
} satisfies Meta<typeof BrandLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As in the footer. */
export const Footer: Story = {};

/** As in the header, with its protection padding and eager loading. */
export const Header: Story = {
  args: {
    label: 'Nardini Select — início',
    className: 'brand-link',
    sizes: '220px',
    loading: 'eager',
  },
};
