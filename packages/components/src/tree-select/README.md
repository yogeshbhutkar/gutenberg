# TreeSelect

<!-- This file is generated automatically and cannot be edited directly. Make edits via TypeScript types and TSDocs. -->

<p class="callout callout-info">See the <a href="https://wordpress.github.io/gutenberg/?path=/docs/components-treeselect--docs">WordPress Storybook</a> for more detailed, interactive documentation.</p>

Generates a hierarchical select input.

```jsx
import { useState } from 'react';
import { TreeSelect } from '@wordpress/components';

const MyTreeSelect = () => {
	const [ page, setPage ] = useState( 'p21' );

	return (
		<TreeSelect
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label="Parent page"
			noOptionLabel="No parent page"
			onChange={ ( newPage ) => setPage( newPage ) }
			selectedId={ page }
			tree={ [
				{
					name: 'Page 1',
					id: 'p1',
					children: [
						{ name: 'Descend 1 of page 1', id: 'p11' },
						{ name: 'Descend 2 of page 1', id: 'p12' },
					],
				},
				{
					name: 'Page 2',
					id: 'p2',
					children: [
						{
							name: 'Descend 1 of page 2',
							id: 'p21',
							children: [
								{
									name: 'Descend 1 of Descend 1 of page 2',
									id: 'p211',
								},
							],
						},
					],
				},
			] }
		/>
	);
}
```
## Props

### `__next40pxDefaultSize`

Start opting into the larger default height that will become the default size in a future version.

 - Type: `boolean`
 - Required: No
 - Default: `false`

### `__nextHasNoMarginBottom`

Start opting into the new margin-free styles that will become the default in a future version.

 - Type: `boolean`
 - Required: No
 - Default: `false`

### `children`

As an alternative to the `options` prop, `optgroup`s and `options` can be
passed in as `children` for more customizability.

 - Type: `ReactNode`
 - Required: No

### `disabled`

If true, the `input` will be disabled.

 - Type: `boolean`
 - Required: No
 - Default: `false`

### `hideLabelFromVision`

If true, the label will only be visible to screen readers.

 - Type: `boolean`
 - Required: No
 - Default: `false`

### `help`

Additional description for the control.

Only use for meaningful description or instructions for the control. An element containing the description will be programmatically associated to the BaseControl by the means of an `aria-describedby` attribute.

 - Type: `ReactNode`
 - Required: No

### `label`

If this property is added, a label will be generated using label property as the content.

 - Type: `ReactNode`
 - Required: No

### `labelPosition`

The position of the label.

 - Type: `"top" | "bottom" | "side" | "edge"`
 - Required: No
 - Default: `'top'`

### `noOptionLabel`

If this property is added, an option will be added with this label to represent empty selection.

 - Type: `string`
 - Required: No

### `onChange`

A function that receives the value of the new option that is being selected as input.

 - Type: `(value: string, extra?: { event?: ChangeEvent<HTMLSelectElement>; }) => void`
 - Required: No

### `options`

An array of option property objects to be rendered,
each with a `label` and `value` property, as well as any other
`<option>` attributes.

 - Type: `readonly ({ label: string; value: string; } & Omit<OptionHTMLAttributes<HTMLOptionElement>, "label" | "value">)[]`
 - Required: No

### `prefix`

Renders an element on the left side of the input.

By default, the prefix is aligned with the edge of the input border, with no padding.
If you want to apply standard padding in accordance with the size variant, wrap the element in
the provided `<InputControlPrefixWrapper>` component.

```jsx
import {
  __experimentalInputControl as InputControl,
  __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
} from '@wordpress/components';

<InputControl
  prefix={<InputControlPrefixWrapper>@</InputControlPrefixWrapper>}
/>
```

 - Type: `ReactNode`
 - Required: No

### `selectedId`

The id of the currently selected node.

 - Type: `string`
 - Required: No

### `size`

Adjusts the size of the input.

 - Type: `"default" | "small" | "compact" | "__unstable-large"`
 - Required: No
 - Default: `'default'`

### `suffix`

Renders an element on the right side of the input.

By default, the suffix is aligned with the edge of the input border, with no padding.
If you want to apply standard padding in accordance with the size variant, wrap the element in
the provided `<InputControlSuffixWrapper>` component.

```jsx
import {
  __experimentalInputControl as InputControl,
  __experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';

<InputControl
  suffix={<InputControlSuffixWrapper>%</InputControlSuffixWrapper>}
/>
```

 - Type: `ReactNode`
 - Required: No

### `tree`

An array containing the tree objects with the possible nodes the user can select.

 - Type: `Tree[]`
 - Required: No

### `variant`

The style variant of the control.

 - Type: `"default" | "minimal"`
 - Required: No
 - Default: `'default'`
