import React, { forwardRef } from 'react';
import {
	Box,
	Paper,
	CardHeader,
	Typography,
	useTheme,
	IconButton,
	type SxProps,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import type { Card } from '@services/cardService';
export interface Props {
	children: React.ReactNode;
	data?: Card;
	columns?: number;
	label?: string;
	style?: SxProps;
	horizontal?: boolean;
	handleProps?: React.HTMLAttributes<any>;
	hover?: boolean;
	scrollable?: boolean;
	shadow?: boolean;
	placeholder?: boolean;
	unstyled?: boolean;
	onClick?(): void;
	onRemove?(): void;
	onLabelClick?: () => void;
}

export const Container = forwardRef<HTMLDivElement, Props>(
	(
		{
			children,
			columns = 1,
			horizontal,
			hover,
			scrollable,
			shadow,
			placeholder,
			unstyled,
			onClick,
			onRemove,
			handleProps,
			style,
			data,
			onLabelClick,
			...props
		}: Props,
		ref
	) => {
		const theme = useTheme();

		const isPlaceholder = placeholder && !unstyled;

		return (
			<Paper
				{...props}
				ref={ref}
				onClick={onClick}
				tabIndex={onClick ? 0 : undefined}
				elevation={shadow ? 3 : 0}
				sx={{
					display: 'flex',
					flexDirection: 'column',
					overflow: unstyled ? 'visible' : 'hidden',
					minWidth: 350,
					minHeight: 200,
					borderRadius: 1,
					m: 1,
					backgroundColor: isPlaceholder
						? 'transparent'
						: unstyled
							? 'transparent'
							: theme.palette.background.paper,
					border: isPlaceholder || unstyled
						? '1px dashed rgba(0,0,0,0.08)'
						: `1px solid ${theme.palette.divider}`,
					color: isPlaceholder ? 'text.secondary' : 'inherit',
					cursor: isPlaceholder ? 'pointer' : 'default',
					transition: 'background-color 350ms ease',
					'&:hover': hover
						? {
							backgroundColor: theme.palette.action.hover,
						}
						: undefined,
					'&:focus-visible': {
						outline: 'none',
						boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
					},
					...style,
				}}
			>
				{data && !isPlaceholder && (
					<CardHeader
						title={
							<Box
								onClick={() => onLabelClick?.()}
								sx={{ maxWidth: 250, px: 1, pb: 1, borderRadius: 1, '&:hover': onLabelClick ? { textDecorationLine: 'underline', cursor: 'pointer'} : undefined }}>
								<Typography variant="h6" noWrap>
									{data?.name}
								</Typography>

								<Typography variant="body2" noWrap>
									{data?.description}
								</Typography>
							</Box>
						}
						action={
							<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
								{onRemove && <IconButton onClick={onRemove}>
									<CloseIcon />
								</IconButton>}

								<div {...handleProps}  >
									<IconButton sx={{cursor: 'grab'}}>
										<DragIndicatorIcon />
									</IconButton>
								</div>
							</Box>
						}
						sx={{
							pb: 1,
							'& .MuiCardHeader-action': {
								alignSelf: 'center',
							},
						}}
					/>
				)}

				{isPlaceholder ? (
					<Box
						sx={{
							flex: 1,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							'&:hover': {
								borderColor: 'rgba(0,0,0,0.15)',
							},
						}}
					>
						{children}
					</Box>
				) : (
					<Box
						component="ul"
						sx={{
							listStyle: 'none',
							display: 'grid',
							gridTemplateColumns: `repeat(${columns}, 1fr)`,
							gridAutoFlow: horizontal ? 'column' : 'row',
							gap: 2,
							p: 2,
							m: 0,
							overflowY: scrollable ? 'auto' : 'visible',
						}}
					>
						{children}
					</Box>
				)}
			</Paper>
		);
	}
);
