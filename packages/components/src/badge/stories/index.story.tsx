/**
 * External dependencies
 */
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Internal dependencies
 */
import Badge from '..';

const meta = {
	component: Badge,
	title: 'Components/Containers/Badge',
	tags: [ 'status-private' ],
} satisfies Meta< typeof Badge >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		children: 'Code is Poetry',
	},
};

export const Info: Story = {
	args: {
		...Default.args,
		intent: 'info',
	},
};

export const Success: Story = {
	args: {
		...Default.args,
		intent: 'success',
	},
};

export const Warning: Story = {
	args: {
		...Default.args,
		intent: 'warning',
	},
};

export const Error: Story = {
	args: {
		...Default.args,
		intent: 'error',
	},
};
