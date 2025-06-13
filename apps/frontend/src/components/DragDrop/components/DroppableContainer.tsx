import {
	type UniqueIdentifier,
} from '@dnd-kit/core';
import {
	type AnimateLayoutChanges,
	useSortable,
	defaultAnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Container, type Props as ContainerProps } from './Container';
import type { Card } from '@services/cardService';
import type { SxProps } from '@mui/material';



const animateLayoutChanges: AnimateLayoutChanges = (args) =>
	defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function DroppableContainer({
	children,
	columns = 1,
	disabled,
	id,
	items,
	style,
	...props
}: ContainerProps & {
	disabled?: boolean;
	id: UniqueIdentifier;
	items: UniqueIdentifier[];
	style?: SxProps<any> ;
	data: Card;
	onLabelClick: () => void;
}) {
	const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform,  } =
		useSortable({
			id,
			data: {
				type: 'container',
				children: items,
			},
			animateLayoutChanges,
		});
	const isOverContainer = over
		? (id === over.id && active?.data.current?.type !== 'container') || items.includes(over.id)
		: false;

	return (
		<Container
			ref={disabled ? undefined : setNodeRef}
			style={{
				...style,
				transition,
				transform: CSS.Translate.toString(transform),
				opacity: isDragging ? 0.5 : undefined,
			}}
			hover={isOverContainer}
			handleProps={{
				...attributes,
				...listeners,
			}}
			columns={columns}
			{...props}
		>
			{children}
		</Container>
	);
}
