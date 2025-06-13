import React, { useEffect } from 'react';
import { Box, ListItem, IconButton, Typography } from '@mui/material';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import CloseIcon from '@mui/icons-material/Close';
import type { Task } from '@services/taskService';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export interface Props {
	dragOverlay?: boolean;
	color?: string;
	disabled?: boolean;
	dragging?: boolean;
	handle?: boolean;
	handleProps?: any;
	height?: number;
	index?: number;
	fadeIn?: boolean;
	transform?: Transform | null;
	listeners?: DraggableSyntheticListeners;
	sorting?: boolean;
	style?: React.CSSProperties;
	transition?: string | null;
	wrapperStyle?: React.CSSProperties;
	value: React.ReactNode;
	onRemove?(): void;
	renderItem?(args: {
		dragOverlay: boolean;
		dragging: boolean;
		sorting: boolean;
		index: number | undefined;
		fadeIn: boolean;
		listeners: DraggableSyntheticListeners;
		ref: React.Ref<HTMLElement>;
		style: React.CSSProperties | undefined;
		transform: Props['transform'];
		transition: Props['transition'];
		value: Props['value'];
	}): React.ReactElement;
	data?: Task;
	onTaskClick?(): void;
}

export const Item = React.memo(
	React.forwardRef<HTMLLIElement, Props>(
		(
			{
				color,
				dragOverlay,
				dragging,
				disabled,
				fadeIn,
				handle,
				index,
				listeners,
				onRemove,
				renderItem,
				sorting,
				style,
				transition,
				transform,
				value,
				wrapperStyle,
				data,
				onTaskClick,
				...props
			},
			ref
		) => {

			useEffect(() => {
				if (dragOverlay) {
					document.body.style.cursor = 'grabbing';
					return () => {
						document.body.style.cursor = '';
					};
				}
			}, [dragOverlay]);

			const wrapperSx = {
				display: 'flex',
				boxSizing: 'border-box',
				transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0) scaleX(${transform?.scaleX ?? 1}) scaleY(${transform?.scaleY ?? 1})`,
				transformOrigin: '0 0',
				touchAction: 'manipulation',
				zIndex: dragOverlay ? 999 : 'auto',
				animation: fadeIn ? 'fadeIn 500ms ease' : undefined,
				...wrapperStyle,
				transition: [transition, wrapperStyle?.transition].filter(Boolean).join(', '),
			} as React.CSSProperties;

			const itemSx = {
				position: 'relative',
				display: 'flex',
				flexGrow: 1,
				alignItems: 'center',
				padding: '12px 16px',

				fontWeight: 400,
				fontSize: '1rem',
				whiteSpace: 'nowrap',
				borderRadius: '4px',
				boxShadow: dragOverlay
					? '0 0 0 1px rgba(63,63,68,0.05), -1px 0 15px 0 rgba(34,33,81,0.01), 0px 15px 15px 0 rgba(34,33,81,0.25)'
					: '0 0 0 1px rgba(63,63,68,0.05), 0 1px 3px 0 rgba(34,33,81,0.15)',
				transform: dragOverlay ? 'scale(1.05)' : 'scale(1)',
				transition: 'box-shadow 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
				outline: 'none',
				cursor: dragging ? 'grabbing' : handle ? 'default' : 'grab',
				opacity: dragging && !dragOverlay ? 0.5 : 1,
				'&:focus-visible': {
					boxShadow: `0 0 4px 1px #4c9ffe, 0 1px 3px 0 rgba(34,33,81,0.15)`,
				},
				'&:hover .remove-btn': {
					visibility: 'visible',
				},
				'&::before': data ? color
					? {
						content: '""',
						position: 'absolute',
						left: 0,
						top: '50%',
						transform: 'translateY(-50%)',
						width: '3px',
						height: '100%',
						backgroundColor: color,
						borderTopLeftRadius: '3px',
						borderBottomLeftRadius: '3px',
					}
					: undefined : undefined,
			} as React.CSSProperties;

			const actionsSx = {
				display: 'flex',
				alignSelf: 'flex-start',
				mt: '-12px',
				ml: 'auto',
				mb: '-15px',
				mr: '-10px',
			};

			return renderItem ? (
				renderItem({
					dragOverlay: Boolean(dragOverlay),
					dragging: Boolean(dragging),
					sorting: Boolean(sorting),
					index,
					fadeIn: Boolean(fadeIn),
					listeners,
					ref,
					style,
					transform,
					transition,
					value,
				})
			) : (
				<ListItem ref={ref} sx={wrapperSx} disablePadding {...props}>
					<Box
						sx={{
							...itemSx,
							backgroundColor: theme => data ?  disabled ? theme.palette.action.disabled : theme.palette.background.paper : undefined,
						}}
						style={style}
						tabIndex={!handle ? 0 : undefined}
						data-cypress="draggable-item"
					>
							<Box sx={{ flexGrow: 1, overflow: 'hidden' }} >
								<Box sx={{display: 'flex', alignItems: 'center'}}>
									{data && <div  {...(!handle ? listeners : undefined)} >
										<IconButton sx={{ cursor: 'grab', }}>
											<DragIndicatorIcon sx={{ fontSize: '12px' }} />
										</IconButton>
									</div> }

									<Typography
										variant="subtitle2"
										sx={{
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											wordBreak: 'break-word',
											'&:hover': {
												textDecorationLine: 'underline',
												cursor: 'default'
											},
											width: '100%',
											textAlign: data ? 'start' :'center',
											pr: 2,
											maxWidth: 250
										}}
										onClick={onTaskClick}
									>
										{data?.title || value}
									</Typography>
								</Box>

							</Box>
						<Box sx={actionsSx}>
							{onRemove && (
								<IconButton
									className="remove-btn"
									sx={{ visibility: 'hidden', mt: 1 }}
									size="small"
									onClick={(e) => {
										e.stopPropagation()
										onRemove()
									}}
								>
									<CloseIcon />
								</IconButton>
							)}
						</Box>
					</Box>
				</ListItem>
			);
		}
	)
);
